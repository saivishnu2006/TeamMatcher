package com.aiteammatcher.service;

import com.aiteammatcher.ai.AIService;
import com.aiteammatcher.dto.*;
import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.ProjectRole;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIOrchestrationService {

    private final AIService aiService;
    private final ProjectRepository projectRepository;
    private final TeamService teamService;
    private final MatchingService matchingService;

    public AIOrchestrationService(
            AIService aiService,
            ProjectRepository projectRepository,
            TeamService teamService,
            MatchingService matchingService) {
        this.aiService = aiService;
        this.projectRepository = projectRepository;
        this.teamService = teamService;
        this.matchingService = matchingService;
    }

    public AiProjectAnalysisResponse analyzeProject(AiProjectAnalysisRequest request) {
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new BadRequestException("Project description is required for AI analysis");
        }
        return aiService.analyzeProject(request.getProjectName(), request.getDescription());
    }

    public AiProfileAnalysisResponse analyzeProfile(AiProfileAnalysisRequest request) {
        if ((request.getBio() == null || request.getBio().isBlank()) &&
                (request.getPreviousProjects() == null || request.getPreviousProjects().isBlank())) {
            throw new BadRequestException("Bio or previous project experience is required for AI profile analysis");
        }
        return aiService.analyzeProfile(request.getBio(), request.getPreviousProjects());
    }

    @Transactional
    public AiTeamBuildResponse buildTeam(AiTeamBuildRequest request) {
        if (request.getProjectId() == null) {
            throw new BadRequestException("Project ID is required");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        int teamSize = request.getTeamSize() != null && request.getTeamSize() > 0 ?
                request.getTeamSize() : project.getTeamSize();

        List<String> roles = request.getRequiredRoles() != null && !request.getRequiredRoles().isEmpty() ?
                request.getRequiredRoles() :
                project.getRequiredRoles().stream().map(ProjectRole::getRoleName).collect(Collectors.toList());

        if (roles.isEmpty()) {
            roles = List.of("Frontend Developer", "Backend Developer", "UI/UX Designer", "QA Tester");
        }

        // Get AI hybrid match candidates for evaluation
        List<MatchCandidateDto> candidates = matchingService.getAiHybridMatches(project.getId()).stream()
                .filter(c -> !c.isTeamMember()) // Only non-members
                .collect(Collectors.toList());

        return aiService.buildTeam(project, candidates, teamSize, roles);
    }

    @Transactional(readOnly = true)
    public AiTeamAnalysisResponse analyzeTeam(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<TeamMemberDto> currentMembers = teamService.getTeamMembers(projectId);

        return aiService.analyzeTeam(project, currentMembers);
    }

    @Transactional(readOnly = true)
    public AiChatResponse chat(AiChatRequest request) {
        if (request.getProjectId() == null) {
            throw new BadRequestException("Project ID is required");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BadRequestException("Message cannot be empty");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        List<TeamMemberDto> currentMembers = teamService.getTeamMembers(request.getProjectId());
        List<MatchCandidateDto> candidates = matchingService.getAiHybridMatches(request.getProjectId());

        return aiService.chatAboutProject(project, currentMembers, candidates, request.getMessage().trim());
    }
}
