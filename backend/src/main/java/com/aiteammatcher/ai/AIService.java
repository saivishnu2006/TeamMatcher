package com.aiteammatcher.ai;

import com.aiteammatcher.dto.*;
import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.User;

import java.util.List;

public interface AIService {

    AiCandidateEvaluation evaluateCandidate(
            Project project,
            User user,
            List<String> candidateSkills,
            List<String> candidateInterests
    );

    AiProjectAnalysisResponse analyzeProject(String projectName, String description);

    AiProfileAnalysisResponse analyzeProfile(String bio, String previousProjects);

    AiTeamBuildResponse buildTeam(
            Project project,
            List<MatchCandidateDto> availableCandidates,
            int teamSize,
            List<String> requiredRoles
    );

    AiTeamAnalysisResponse analyzeTeam(
            Project project,
            List<TeamMemberDto> currentMembers
    );

    AiChatResponse chatAboutProject(
            Project project,
            List<TeamMemberDto> currentMembers,
            List<MatchCandidateDto> candidates,
            String userQuestion
    );
}
