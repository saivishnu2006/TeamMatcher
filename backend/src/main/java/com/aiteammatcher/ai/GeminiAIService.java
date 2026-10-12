package com.aiteammatcher.ai;

import com.aiteammatcher.dto.*;
import com.aiteammatcher.entity.Profile;
import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.ProjectRole;
import com.aiteammatcher.entity.ProjectSkill;
import com.aiteammatcher.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiAIService implements AIService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);

    private final String apiKey;
    private final String model;
    private final AIPromptBuilder promptBuilder;
    private final AIResponseParser responseParser;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAIService(
            @Value("${ai.api-key:}") String apiKey,
            @Value("${ai.gemini.model:gemini-1.5-flash}") String model,
            AIPromptBuilder promptBuilder,
            AIResponseParser responseParser) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null && !model.isBlank() ? model.trim() : "gemini-1.5-flash";
        this.promptBuilder = promptBuilder;
        this.responseParser = responseParser;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();

        if (StringUtils.hasText(this.apiKey)) {
            logger.info("GeminiAIService initialized with external API key (model: {})", this.model);
        } else {
            logger.info("GeminiAIService initialized without API key - intelligent local semantic AI fallback enabled.");
        }
    }

    private String callGeminiApi(String prompt) {
        if (!StringUtils.hasText(apiKey)) {
            return null;
        }

        try {
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(textPart));
            Map<String, Object> generationConfig = Map.of(
                    "temperature", 0.2,
                    "responseMimeType", "application/json"
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(content),
                    "generationConfig", generationConfig
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseStr = restTemplate.postForObject(url, entity, String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode() && StringUtils.hasText(textNode.asText())) {
                    return textNode.asText();
                }
            }
        } catch (Exception ex) {
            logger.warn("External Gemini API call failed: {}. Falling back to internal semantic evaluator.", ex.getMessage());
        }

        return null;
    }

    @Override
    public AiCandidateEvaluation evaluateCandidate(
            Project project,
            User user,
            List<String> candidateSkills,
            List<String> candidateInterests) {

        Profile profile = user.getProfile();
        String bio = profile != null ? profile.getBio() : "";
        String role = profile != null ? profile.getPreferredRole() : "";
        String experience = profile != null ? profile.getExperienceLevel() : "";
        String prevProjects = profile != null ? profile.getPreviousProjects() : "";

        List<String> requiredSkills = project.getRequiredSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .collect(Collectors.toList());

        List<String> requiredRoles = project.getRequiredRoles().stream()
                .map(ProjectRole::getRoleName)
                .collect(Collectors.toList());

        if (StringUtils.hasText(apiKey)) {
            String prompt = promptBuilder.buildCandidateEvaluationPrompt(
                    project.getName(),
                    project.getDescription(),
                    requiredSkills,
                    requiredRoles,
                    user.getFullName(),
                    candidateSkills,
                    role,
                    candidateInterests,
                    experience + (StringUtils.hasText(prevProjects) ? " | " + prevProjects : ""),
                    bio
            );

            String raw = callGeminiApi(prompt);
            if (raw != null) {
                AiCandidateEvaluation parsed = responseParser.parse(raw, AiCandidateEvaluation.class);
                if (parsed != null && parsed.getMatchScore() > 0) {
                    // Sanity filter: ensure AI did not invent skills not present in candidateSkills
                    List<String> safeMatched = parsed.getMatchedSkills().stream()
                            .filter(s -> candidateSkills.stream().anyMatch(cs -> cs.equalsIgnoreCase(s.trim())))
                            .collect(Collectors.toList());
                    parsed.setMatchedSkills(safeMatched);
                    return parsed;
                }
            }
        }

        // Semantic Evaluation Fallback (strictly grounded in candidate data)
        return evaluateCandidateInternal(project, user, candidateSkills, candidateInterests);
    }

    private AiCandidateEvaluation evaluateCandidateInternal(
            Project project,
            User user,
            List<String> candidateSkills,
            List<String> candidateInterests) {

        Profile profile = user.getProfile();
        String candidateRole = profile != null && profile.getPreferredRole() != null ? profile.getPreferredRole() : "Contributor";
        String candidateBio = profile != null && profile.getBio() != null ? profile.getBio() : "";
        String experience = profile != null && profile.getExperienceLevel() != null ? profile.getExperienceLevel() : "Intermediate";
        String prevProjects = profile != null && profile.getPreviousProjects() != null ? profile.getPreviousProjects() : "";

        List<String> projectSkills = project.getRequiredSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .toList();

        List<String> projectRoles = project.getRequiredRoles().stream()
                .map(ProjectRole::getRoleName)
                .toList();

        // 1. Matched Skills (intersection strictly from candidate skills)
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String reqSkill : projectSkills) {
            boolean hasSkill = candidateSkills.stream().anyMatch(cs -> cs.equalsIgnoreCase(reqSkill.trim()));
            if (hasSkill) {
                matchedSkills.add(reqSkill);
            } else {
                missingSkills.add(reqSkill);
            }
        }

        // 2. Role matching
        boolean exactRoleMatch = projectRoles.stream().anyMatch(pr -> pr.equalsIgnoreCase(candidateRole.trim()));
        boolean partialRoleMatch = projectRoles.stream().anyMatch(pr ->
                pr.toLowerCase().contains(candidateRole.toLowerCase()) ||
                candidateRole.toLowerCase().contains(pr.toLowerCase()));

        // 3. Domain Interest / Bio match
        String projectContext = (project.getName() + " " + project.getDescription()).toLowerCase();
        List<String> matchedInterests = candidateInterests.stream()
                .filter(i -> projectContext.contains(i.toLowerCase()))
                .toList();

        // Strengths grounded in candidate profile
        List<String> strengths = new ArrayList<>();
        if (!matchedSkills.isEmpty()) {
            strengths.add("Direct proficiency in " + String.join(", ", matchedSkills));
        }
        if (exactRoleMatch) {
            strengths.add("Exact fit for preferred role: " + candidateRole);
        } else if (partialRoleMatch) {
            strengths.add("Aligned background for " + candidateRole);
        }
        if (!matchedInterests.isEmpty()) {
            strengths.add("Domain interest in " + String.join(", ", matchedInterests));
        }
        if (StringUtils.hasText(prevProjects)) {
            strengths.add("Demonstrated project experience (" + prevProjects + ")");
        }
        if (strengths.isEmpty()) {
            strengths.add(experience + " level technologist");
        }

        // Compute AI Score (0 - 100)
        double skillRatio = projectSkills.isEmpty() ? 0.7 : (double) matchedSkills.size() / projectSkills.size();
        double roleScore = exactRoleMatch ? 1.0 : (partialRoleMatch ? 0.75 : 0.35);
        double domainScore = matchedInterests.isEmpty() ? 0.4 : 0.95;

        double calculatedScore = (skillRatio * 50.0) + (roleScore * 30.0) + (domainScore * 20.0);
        int finalAiScore = (int) Math.round(Math.min(100.0, Math.max(25.0, calculatedScore)));

        // Structured reason
        StringBuilder reason = new StringBuilder();
        if (finalAiScore >= 80) {
            reason.append("Strong match because the candidate has ");
            if (!matchedSkills.isEmpty()) {
                reason.append(String.join(", ", matchedSkills)).append(" experience");
            } else {
                reason.append("relevant technical qualifications");
            }
            if (!matchedInterests.isEmpty()) {
                reason.append(" and is interested in ").append(String.join(", ", matchedInterests));
            }
            if (exactRoleMatch) {
                reason.append(", aligning perfectly with the ").append(candidateRole).append(" role.");
            } else {
                reason.append(".");
            }
        } else if (finalAiScore >= 60) {
            reason.append("Good potential match with relevant foundational skills in ");
            reason.append(matchedSkills.isEmpty() ? "core software engineering" : String.join(", ", matchedSkills));
            if (!missingSkills.isEmpty()) {
                reason.append(", though would benefit from support in ").append(String.join(", ", missingSkills));
            }
            reason.append(".");
        } else {
            reason.append("Moderate overlap. Candidate specializes in ").append(candidateRole);
            if (!matchedSkills.isEmpty()) {
                reason.append(" with ").append(String.join(", ", matchedSkills));
            }
            if (!missingSkills.isEmpty()) {
                reason.append(", but lacks required project skills: ").append(String.join(", ", missingSkills));
            }
            reason.append(".");
        }

        String recommendedRole = exactRoleMatch ? candidateRole :
                (!projectRoles.isEmpty() ? projectRoles.get(0) : candidateRole);

        return new AiCandidateEvaluation(
                finalAiScore,
                reason.toString(),
                matchedSkills,
                missingSkills,
                recommendedRole,
                strengths
        );
    }

    @Override
    public AiProjectAnalysisResponse analyzeProject(String projectName, String description) {
        if (StringUtils.hasText(apiKey)) {
            String prompt = promptBuilder.buildProjectAnalysisPrompt(projectName, description);
            String raw = callGeminiApi(prompt);
            if (raw != null) {
                AiProjectAnalysisResponse res = responseParser.parse(raw, AiProjectAnalysisResponse.class);
                if (res != null && !res.getRequiredSkills().isEmpty()) {
                    return res;
                }
            }
        }

        // Semantic Fallback
        AiProjectAnalysisResponse response = new AiProjectAnalysisResponse();
        String text = ((projectName != null ? projectName : "") + " " + (description != null ? description : "")).toLowerCase();

        List<String> skills = new ArrayList<>();
        List<String> roles = new ArrayList<>();
        List<String> techs = new ArrayList<>();

        if (text.contains("react") || text.contains("frontend") || text.contains("web") || text.contains("ui") || text.contains("patient") || text.contains("portal")) {
            skills.add("React");
            skills.add("JavaScript");
            roles.add("Frontend Developer");
            roles.add("UI/UX Designer");
            techs.add("React.js");
            techs.add("CSS/Tailwind");
        }
        if (text.contains("spring") || text.contains("java") || text.contains("backend") || text.contains("api") || text.contains("doctor") || text.contains("appointment")) {
            skills.add("Spring Boot");
            skills.add("Java");
            skills.add("REST API");
            if (!roles.contains("Backend Developer")) roles.add("Backend Developer");
            techs.add("Spring Boot");
        }
        if (text.contains("mysql") || text.contains("database") || text.contains("sql") || text.contains("book") || text.contains("records")) {
            skills.add("MySQL");
            techs.add("MySQL");
        }
        if (text.contains("test") || text.contains("qa") || text.contains("quality")) {
            roles.add("QA / Tester");
        } else {
            roles.add("QA Tester");
        }

        if (skills.isEmpty()) {
            skills.addAll(List.of("React", "Spring Boot", "MySQL"));
        }
        if (roles.isEmpty()) {
            roles.addAll(List.of("Frontend Developer", "Backend Developer", "UI/UX Designer"));
        }
        if (techs.isEmpty()) {
            techs.addAll(List.of("React", "Spring Boot", "MySQL"));
        }

        response.setRequiredSkills(skills.stream().distinct().limit(5).collect(Collectors.toList()));
        response.setSuggestedRoles(roles.stream().distinct().limit(4).collect(Collectors.toList()));
        response.setSuggestedTechnologies(techs.stream().distinct().limit(4).collect(Collectors.toList()));
        response.setSuggestedTeamSize(Math.max(3, roles.size()));
        response.setProjectComplexity(skills.size() > 4 ? "High" : "Medium");

        return response;
    }

    @Override
    public AiProfileAnalysisResponse analyzeProfile(String bio, String previousProjects) {
        if (StringUtils.hasText(apiKey)) {
            String prompt = promptBuilder.buildProfileAnalysisPrompt(bio, previousProjects);
            String raw = callGeminiApi(prompt);
            if (raw != null) {
                AiProfileAnalysisResponse res = responseParser.parse(raw, AiProfileAnalysisResponse.class);
                if (res != null && (!res.getSuggestedSkills().isEmpty() || !res.getPossibleRoles().isEmpty())) {
                    return res;
                }
            }
        }

        // Semantic Fallback
        AiProfileAnalysisResponse response = new AiProfileAnalysisResponse();
        String combined = ((bio != null ? bio : "") + " " + (previousProjects != null ? previousProjects : "")).toLowerCase();

        List<String> skills = new ArrayList<>();
        List<String> roles = new ArrayList<>();
        List<String> interests = new ArrayList<>();

        if (combined.contains("java")) skills.add("Java");
        if (combined.contains("spring")) skills.add("Spring Boot");
        if (combined.contains("mysql") || combined.contains("sql") || combined.contains("database")) skills.add("MySQL");
        if (combined.contains("react")) skills.add("React");
        if (combined.contains("javascript") || combined.contains("js")) skills.add("JavaScript");
        if (combined.contains("python")) skills.add("Python");
        if (combined.contains("design") || combined.contains("ui") || combined.contains("ux") || combined.contains("figma")) {
            skills.add("UI/UX Design");
            roles.add("UI/UX Designer");
        }

        if (skills.contains("Java") || skills.contains("Spring Boot")) {
            roles.add("Backend Developer");
        }
        if (skills.contains("React") || skills.contains("JavaScript")) {
            roles.add("Frontend Developer");
        }
        if (roles.contains("Backend Developer") && roles.contains("Frontend Developer")) {
            roles.add("Full Stack Developer");
        }

        if (combined.contains("health") || combined.contains("doctor") || combined.contains("medical")) interests.add("Healthcare Applications");
        if (combined.contains("web")) interests.add("Web Development");
        if (combined.contains("ai") || combined.contains("ml") || combined.contains("machine learning")) interests.add("AI & Machine Learning");
        if (combined.contains("cloud") || combined.contains("aws") || combined.contains("devops")) interests.add("Cloud Computing");
        if (combined.contains("finance") || combined.contains("fintech")) interests.add("Fintech");

        if (skills.isEmpty()) {
            skills.addAll(List.of("Java", "Spring Boot", "MySQL"));
        }
        if (roles.isEmpty()) {
            roles.addAll(List.of("Backend Developer"));
        }
        if (interests.isEmpty()) {
            interests.addAll(List.of("Web Development"));
        }

        response.setSuggestedSkills(skills);
        response.setPossibleRoles(roles);
        response.setSuggestedInterests(interests);

        return response;
    }

    @Override
    public AiTeamBuildResponse buildTeam(
            Project project,
            List<MatchCandidateDto> availableCandidates,
            int teamSize,
            List<String> requiredRoles) {

        int maxSlots = Math.min(teamSize, requiredRoles.size());
        List<AiTeamBuildAssignment> assignments = new ArrayList<>();
        Set<Long> selectedUserIds = new HashSet<>();

        for (int i = 0; i < maxSlots; i++) {
            String role = requiredRoles.get(i);

            // Find best available unselected candidate for this role
            MatchCandidateDto bestCandidate = null;
            double highestScore = -1.0;

            for (MatchCandidateDto c : availableCandidates) {
                if (selectedUserIds.contains(c.getUserId())) {
                    continue;
                }

                double score = c.getFinalScore() != null ? c.getFinalScore() : 50.0;
                if (c.getPreferredRole() != null && c.getPreferredRole().equalsIgnoreCase(role)) {
                    score += 30.0;
                } else if (c.getPreferredRole() != null && c.getPreferredRole().toLowerCase().contains(role.toLowerCase())) {
                    score += 15.0;
                }

                if (score > highestScore) {
                    highestScore = score;
                    bestCandidate = c;
                }
            }

            if (bestCandidate != null) {
                selectedUserIds.add(bestCandidate.getUserId());
                String rationale = String.format(
                        "%s is selected for %s because of verified skills in %s and an overall match score of %d%%.",
                        bestCandidate.getFullName(),
                        role,
                        bestCandidate.getSkills().stream().map(SkillDto::getName).limit(3).collect(Collectors.joining(", ")),
                        Math.round(bestCandidate.getFinalScore())
                );
                assignments.add(new AiTeamBuildAssignment(role, bestCandidate, rationale));
            }
        }

        AiTeamBuildResponse response = new AiTeamBuildResponse();
        response.setAssignments(assignments);

        String summary = String.format(
                "AI successfully assembled a balanced %d-member team for '%s' covering required roles: %s with zero duplicate member assignments.",
                assignments.size(),
                project.getName(),
                assignments.stream().map(AiTeamBuildAssignment::getRole).collect(Collectors.joining(", "))
        );
        response.setSummary(summary);

        return response;
    }

    @Override
    public AiTeamAnalysisResponse analyzeTeam(
            Project project,
            List<TeamMemberDto> currentMembers) {

        List<String> projectSkills = project.getRequiredSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .toList();

        Set<String> teamSkills = new HashSet<>();
        for (TeamMemberDto m : currentMembers) {
            if (m.getSkills() != null) {
                teamSkills.addAll(m.getSkills().stream().map(String::toLowerCase).collect(Collectors.toSet()));
            }
        }

        List<String> coveredSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : projectSkills) {
            if (teamSkills.contains(req.toLowerCase())) {
                coveredSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        List<String> strengths = new ArrayList<>();
        if (!coveredSkills.isEmpty()) {
            strengths.add("Strong coverage in " + String.join(", ", coveredSkills));
        }
        if (teamSkills.contains("java") || teamSkills.contains("spring boot")) {
            strengths.add("Strong backend development & architecture");
        }
        if (teamSkills.contains("mysql") || teamSkills.contains("database")) {
            strengths.add("Good database knowledge & persistence design");
        }
        if (teamSkills.contains("react")) {
            strengths.add("Modern frontend UI capabilities");
        }
        if (strengths.isEmpty()) {
            strengths.add("Diverse cross-functional baseline");
        }

        // Detect missing areas
        if (!teamSkills.contains("ui/ux") && !teamSkills.contains("ui/ux design") && !teamSkills.contains("figma")) {
            if (!missingSkills.contains("UI/UX")) missingSkills.add("UI/UX");
        }
        if (!teamSkills.contains("testing") && !teamSkills.contains("qa")) {
            if (!missingSkills.contains("Testing")) missingSkills.add("Testing");
        }

        double coverage = projectSkills.isEmpty() ? 100.0 : ((double) coveredSkills.size() / projectSkills.size()) * 100.0;

        String recommendation;
        if (!missingSkills.isEmpty()) {
            recommendation = "Consider adding " + String.join(" and ", missingSkills) + "-focused members to achieve 100% project coverage.";
        } else {
            recommendation = "Current team covers all primary project requirements thoroughly!";
        }

        AiTeamAnalysisResponse response = new AiTeamAnalysisResponse();
        response.setTeamStrengths(strengths);
        response.setMissingSkills(missingSkills);
        response.setRecommendation(recommendation);
        response.setCoveragePercentage(Math.round(coverage * 10.0) / 10.0);

        return response;
    }

    @Override
    public AiChatResponse chatAboutProject(
            Project project,
            List<TeamMemberDto> currentMembers,
            List<MatchCandidateDto> candidates,
            String userQuestion) {

        String q = userQuestion.toLowerCase();
        String answer;
        List<String> followUps = new ArrayList<>();

        if (q.contains("missing") || q.contains("lack")) {
            AiTeamAnalysisResponse analysis = analyzeTeam(project, currentMembers);
            answer = "Based on the project's requirements, your team is currently missing: " +
                    String.join(", ", analysis.getMissingSkills()) + ". " + analysis.getRecommendation();
            followUps.add("Who is the best candidate for " + (analysis.getMissingSkills().isEmpty() ? "frontend" : analysis.getMissingSkills().get(0)) + "?");
            followUps.add("Who should I invite first?");
        } else if (q.contains("why is") && q.contains("match")) {
            // Find candidate name in question
            MatchCandidateDto matched = candidates.stream()
                    .filter(c -> q.contains(c.getFullName().toLowerCase().split(" ")[0]))
                    .findFirst()
                    .orElse(null);

            if (matched != null) {
                answer = String.format("%s is a %d%% match for '%s'. %s Recommended role: %s. Strengths: %s.",
                        matched.getFullName(),
                        Math.round(matched.getFinalScore()),
                        project.getName(),
                        matched.getAiReason() != null ? matched.getAiReason() : "Matches key technical requirements.",
                        matched.getRecommendedRole(),
                        String.join(", ", matched.getStrengths())
                );
            } else {
                answer = "The candidates were evaluated based on strict overlap with project requirements. Specify a candidate name to see their tailored evaluation breakdown.";
            }
            followUps.add("Who should I invite first?");
            followUps.add("What type of teammate am I missing?");
        } else if (q.contains("invite first") || q.contains("who should i invite")) {
            if (!candidates.isEmpty()) {
                MatchCandidateDto top = candidates.get(0);
                answer = String.format("You should invite %s first (%d%% match). They excel in %s and fill the %s role effectively.",
                        top.getFullName(),
                        Math.round(top.getFinalScore()),
                        top.getSkills().stream().map(SkillDto::getName).limit(3).collect(Collectors.joining(", ")),
                        top.getRecommendedRole()
                );
            } else {
                answer = "No eligible candidates are currently uninvited. All requirements have been filled or no matches found.";
            }
            followUps.add("What type of teammate am I missing?");
            followUps.add("Build team automatically");
        } else {
            answer = String.format("Project '%s' requires %d members. Currently %d members joined. Target skills: %s.",
                    project.getName(),
                    project.getTeamSize(),
                    currentMembers.size(),
                    project.getRequiredSkills().stream().map(ps -> ps.getSkill().getName()).collect(Collectors.joining(", "))
            );
            followUps.add("What type of teammate am I missing?");
            followUps.add("Who should I invite first?");
        }

        return new AiChatResponse(answer, followUps);
    }
}
