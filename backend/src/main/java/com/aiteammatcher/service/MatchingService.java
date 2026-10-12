package com.aiteammatcher.service;

import com.aiteammatcher.ai.AIService;
import com.aiteammatcher.ai.AiCandidateEvaluation;
import com.aiteammatcher.dto.MatchCandidateDto;
import com.aiteammatcher.dto.SkillDto;
import com.aiteammatcher.entity.*;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final AiMatchResultRepository aiMatchResultRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    public MatchingService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TeamMemberRepository teamMemberRepository,
            TeamRequestRepository teamRequestRepository,
            AiMatchResultRepository aiMatchResultRepository,
            AIService aiService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamRequestRepository = teamRequestRepository;
        this.aiMatchResultRepository = aiMatchResultRepository;
        this.aiService = aiService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Level 1: Normal Rule-based scoring
     */
    public double calculateRuleBasedScore(Project project, User user, List<String> candidateSkills, List<String> candidateInterests) {
        Profile profile = user.getProfile();
        String candidateRole = profile != null && profile.getPreferredRole() != null ? profile.getPreferredRole() : "";
        String candidateAvail = profile != null && profile.getAvailability() != null ? profile.getAvailability() : "";
        String candidateExp = profile != null && profile.getExperienceLevel() != null ? profile.getExperienceLevel() : "Intermediate";

        List<String> projectSkills = project.getRequiredSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .toList();

        List<String> projectRoles = project.getRequiredRoles().stream()
                .map(ProjectRole::getRoleName)
                .toList();

        // 1. Skills Score (40% weight)
        double skillsScore = 50.0;
        if (!projectSkills.isEmpty()) {
            long matchCount = projectSkills.stream()
                    .filter(ps -> candidateSkills.stream().anyMatch(cs -> cs.equalsIgnoreCase(ps.trim())))
                    .count();
            skillsScore = ((double) matchCount / projectSkills.size()) * 100.0;
        }

        // 2. Role Score (25% weight)
        double roleScore = 30.0;
        if (!projectRoles.isEmpty()) {
            boolean exact = projectRoles.stream().anyMatch(pr -> pr.equalsIgnoreCase(candidateRole.trim()));
            boolean partial = projectRoles.stream().anyMatch(pr ->
                    pr.toLowerCase().contains(candidateRole.toLowerCase()) ||
                    candidateRole.toLowerCase().contains(pr.toLowerCase()));
            if (exact) {
                roleScore = 100.0;
            } else if (partial && !candidateRole.isBlank()) {
                roleScore = 70.0;
            } else {
                roleScore = 30.0;
            }
        }

        // 3. Interests Score (15% weight)
        double interestScore = 40.0;
        String projectContext = (project.getName() + " " + project.getDescription()).toLowerCase();
        if (!candidateInterests.isEmpty()) {
            long matchedInterests = candidateInterests.stream()
                    .filter(ci -> projectContext.contains(ci.toLowerCase()))
                    .count();
            interestScore = Math.min(100.0, 30.0 + (matchedInterests * 35.0));
        }

        // 4. Availability Score (10% weight)
        double availScore = 70.0;
        if (project.getAvailabilityRequirement() != null && !candidateAvail.isBlank()) {
            if (candidateAvail.toLowerCase().contains("full") ||
                    candidateAvail.equalsIgnoreCase(project.getAvailabilityRequirement())) {
                availScore = 100.0;
            } else if (candidateAvail.toLowerCase().contains("part-time")) {
                availScore = 75.0;
            } else {
                availScore = 50.0;
            }
        }

        // 5. Experience Score (10% weight)
        double expScore = 65.0;
        String projComplexity = project.getComplexity() != null ? project.getComplexity() : "Medium";
        if (projComplexity.equalsIgnoreCase("High") && (candidateExp.equalsIgnoreCase("Senior") || candidateExp.equalsIgnoreCase("Lead"))) {
            expScore = 100.0;
        } else if (projComplexity.equalsIgnoreCase("Medium") && (candidateExp.equalsIgnoreCase("Intermediate") || candidateExp.equalsIgnoreCase("Senior"))) {
            expScore = 95.0;
        } else if (projComplexity.equalsIgnoreCase("Low")) {
            expScore = 90.0;
        }

        // Combined rule score
        double total = (skillsScore * 0.40) + (roleScore * 0.25) + (interestScore * 0.15) + (availScore * 0.10) + (expScore * 0.10);
        return Math.min(100.0, Math.max(10.0, Math.round(total * 10.0) / 10.0));
    }

    /**
     * Level 1 Matching: Rule-based only
     */
    @Transactional(readOnly = true)
    public List<MatchCandidateDto> getRuleBasedMatches(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<User> allUsers = userRepository.findAll();
        List<MatchCandidateDto> candidates = new ArrayList<>();

        Set<Long> teamMemberUserIds = getExistingTeamMemberIds(project);
        Set<Long> pendingInviteUserIds = getPendingInviteUserIds(project);

        for (User user : allUsers) {
            // Exclude project owner
            if (user.getId().equals(project.getOwner().getId())) {
                continue;
            }

            Profile profile = user.getProfile();
            List<String> userSkills = profile != null ?
                    profile.getUserSkills().stream().map(us -> us.getSkill().getName()).collect(Collectors.toList()) :
                    Collections.emptyList();

            List<String> userInterests = profile != null ?
                    profile.getUserInterests().stream().map(ui -> ui.getInterest().getName()).collect(Collectors.toList()) :
                    Collections.emptyList();

            double ruleScore = calculateRuleBasedScore(project, user, userSkills, userInterests);

            MatchCandidateDto candidate = buildCandidateBaseDto(user, profile);
            candidate.setRuleScore(ruleScore);
            candidate.setFinalScore(ruleScore);
            candidate.setMatchCategory(categorizeScore(ruleScore));
            candidate.setTeamMember(teamMemberUserIds.contains(user.getId()));
            candidate.setHasPendingInvite(pendingInviteUserIds.contains(user.getId()));

            // Identify matched/missing skills
            List<String> projectSkills = project.getRequiredSkills().stream()
                    .map(ps -> ps.getSkill().getName())
                    .toList();
            List<String> matched = projectSkills.stream()
                    .filter(ps -> userSkills.stream().anyMatch(us -> us.equalsIgnoreCase(ps.trim())))
                    .toList();
            List<String> missing = projectSkills.stream()
                    .filter(ps -> userSkills.stream().noneMatch(us -> us.equalsIgnoreCase(ps.trim())))
                    .toList();

            candidate.setMatchedSkills(matched);
            candidate.setMissingSkills(missing);
            candidate.setRecommendedRole(profile != null && profile.getPreferredRole() != null ? profile.getPreferredRole() : "Contributor");

            candidates.add(candidate);
        }

        candidates.sort(Comparator.comparing(MatchCandidateDto::getFinalScore).reversed());
        return candidates;
    }

    /**
     * Level 2 & Hybrid Matching: Normal Score (60%) + AI Score (40%)
     */
    @Transactional
    public List<MatchCandidateDto> getAiHybridMatches(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<User> allUsers = userRepository.findAll();
        List<MatchCandidateDto> candidates = new ArrayList<>();

        Set<Long> teamMemberUserIds = getExistingTeamMemberIds(project);
        Set<Long> pendingInviteUserIds = getPendingInviteUserIds(project);

        for (User user : allUsers) {
            // Exclude project owner
            if (user.getId().equals(project.getOwner().getId())) {
                continue;
            }

            Profile profile = user.getProfile();
            List<String> userSkills = profile != null ?
                    profile.getUserSkills().stream().map(us -> us.getSkill().getName()).collect(Collectors.toList()) :
                    Collections.emptyList();

            List<String> userInterests = profile != null ?
                    profile.getUserInterests().stream().map(ui -> ui.getInterest().getName()).collect(Collectors.toList()) :
                    Collections.emptyList();

            // 1. Calculate Rule-based score (Level 1)
            double ruleScore = calculateRuleBasedScore(project, user, userSkills, userInterests);

            // 2. Calculate AI Evaluation (Level 2)
            AiCandidateEvaluation aiEval = aiService.evaluateCandidate(project, user, userSkills, userInterests);
            double aiScore = aiEval.getMatchScore();

            // 3. Hybrid Score: 60% rule-based + 40% AI
            double finalScore = Math.round(((ruleScore * 0.60) + (aiScore * 0.40)) * 10.0) / 10.0;

            MatchCandidateDto candidate = buildCandidateBaseDto(user, profile);
            candidate.setRuleScore(ruleScore);
            candidate.setAiScore(aiScore);
            candidate.setFinalScore(finalScore);
            candidate.setMatchCategory(categorizeScore(finalScore));
            candidate.setAiReason(aiEval.getReason());
            candidate.setMatchedSkills(aiEval.getMatchedSkills());
            candidate.setMissingSkills(aiEval.getMissingSkills());
            candidate.setRecommendedRole(aiEval.getRecommendedRole());
            candidate.setStrengths(aiEval.getStrengths());
            candidate.setTeamMember(teamMemberUserIds.contains(user.getId()));
            candidate.setHasPendingInvite(pendingInviteUserIds.contains(user.getId()));

            candidates.add(candidate);

            // Persist to ai_match_results table
            saveMatchResult(project.getId(), user.getId(), ruleScore, aiScore, finalScore, aiEval);
        }

        candidates.sort(Comparator.comparing(MatchCandidateDto::getFinalScore).reversed());
        return candidates;
    }

    private void saveMatchResult(Long projectId, Long userId, double ruleScore, double aiScore, double finalScore, AiCandidateEvaluation aiEval) {
        try {
            AiMatchResult result = aiMatchResultRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseGet(() -> {
                        AiMatchResult r = new AiMatchResult();
                        r.setProjectId(projectId);
                        r.setUserId(userId);
                        return r;
                    });

            result.setRuleScore(ruleScore);
            result.setAiScore(aiScore);
            result.setFinalScore(finalScore);
            result.setAiReason(aiEval.getReason());
            result.setRecommendedRole(aiEval.getRecommendedRole());
            result.setMatchedSkills(objectMapper.writeValueAsString(aiEval.getMatchedSkills()));
            result.setMissingSkills(objectMapper.writeValueAsString(aiEval.getMissingSkills()));
            result.setStrengths(objectMapper.writeValueAsString(aiEval.getStrengths()));

            aiMatchResultRepository.save(result);
        } catch (Exception ex) {
            // Non-critical logging for persistence
        }
    }

    private MatchCandidateDto buildCandidateBaseDto(User user, Profile profile) {
        MatchCandidateDto dto = new MatchCandidateDto();
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());

        if (profile != null) {
            dto.setPreferredRole(profile.getPreferredRole());
            dto.setExperienceLevel(profile.getExperienceLevel());
            dto.setAvailability(profile.getAvailability());
            dto.setBio(profile.getBio());
            dto.setPreviousProjects(profile.getPreviousProjects());

            List<SkillDto> skillDtos = profile.getUserSkills().stream()
                    .map(us -> new SkillDto(us.getSkill().getId(), us.getSkill().getName(), us.getSkill().getCategory(), us.getProficiencyLevel()))
                    .collect(Collectors.toList());
            dto.setSkills(skillDtos);

            List<String> interestNames = profile.getUserInterests().stream()
                    .map(ui -> ui.getInterest().getName())
                    .collect(Collectors.toList());
            dto.setInterests(interestNames);
        }

        return dto;
    }

    private String categorizeScore(double score) {
        if (score >= 80.0) {
            return "Excellent Match";
        } else if (score >= 60.0) {
            return "Good Match";
        } else if (score >= 40.0) {
            return "Moderate Match";
        } else {
            return "Low Match";
        }
    }

    private Set<Long> getExistingTeamMemberIds(Project project) {
        if (project.getTeam() != null) {
            return project.getTeam().getMembers().stream()
                    .map(m -> m.getUser().getId())
                    .collect(Collectors.toSet());
        }
        return Collections.emptySet();
    }

    private Set<Long> getPendingInviteUserIds(Project project) {
        return teamRequestRepository.findByProject(project).stream()
                .filter(tr -> "PENDING".equalsIgnoreCase(tr.getStatus()))
                .map(tr -> tr.getReceiver().getId())
                .collect(Collectors.toSet());
    }
}
