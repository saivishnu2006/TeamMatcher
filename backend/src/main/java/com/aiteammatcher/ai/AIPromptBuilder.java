package com.aiteammatcher.ai;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AIPromptBuilder {

    public String buildCandidateEvaluationPrompt(
            String projectName,
            String projectDescription,
            List<String> requiredSkills,
            List<String> requiredRoles,
            String candidateName,
            List<String> candidateSkills,
            String candidateRole,
            List<String> candidateInterests,
            String candidateExperience,
            String candidateBio) {

        return """
                You are an expert AI talent and engineering team evaluator.
                Evaluate the candidate's suitability for the project.
                
                IMPORTANT RULES:
                1. Do NOT invent skills that the candidate does not have.
                2. Base your explanation ONLY on the information supplied.
                3. Return ONLY valid JSON matching this schema:
                {
                  "matchScore": <integer 0-100>,
                  "reason": "<clear explanation why the candidate is or isn't suitable>",
                  "matchedSkills": ["<skill1>", "<skill2>"],
                  "missingSkills": ["<skill3>", "<skill4>"],
                  "recommendedRole": "<best matching role for this candidate>",
                  "strengths": ["<strength 1>", "<strength 2>"]
                }

                PROJECT DETAILS:
                Name: %s
                Description: %s
                Required skills: %s
                Required roles: %s

                CANDIDATE DETAILS:
                Name: %s
                Skills: %s
                Role: %s
                Interests: %s
                Experience: %s
                Bio: %s
                """.formatted(
                projectName,
                projectDescription,
                String.join(", ", requiredSkills),
                String.join(", ", requiredRoles),
                candidateName,
                String.join(", ", candidateSkills),
                candidateRole != null ? candidateRole : "Not specified",
                String.join(", ", candidateInterests),
                candidateExperience != null ? candidateExperience : "Not specified",
                candidateBio != null ? candidateBio : "None"
        );
    }

    public String buildProjectAnalysisPrompt(String projectName, String description) {
        return """
                You are an AI software architect. Analyze the project description and suggest required skills, team roles, team size, complexity, and technologies.
                
                Return ONLY valid JSON matching this schema:
                {
                  "requiredSkills": ["skill1", "skill2", "skill3"],
                  "suggestedRoles": ["role1", "role2", "role3"],
                  "suggestedTeamSize": 4,
                  "projectComplexity": "Low" | "Medium" | "High",
                  "suggestedTechnologies": ["tech1", "tech2", "tech3"]
                }

                Project Name: %s
                Project Description: %s
                """.formatted(projectName, description);
    }

    public String buildProfileAnalysisPrompt(String bio, String previousProjects) {
        return """
                You are an AI career advisor for tech teams. Analyze the user's bio and past project experience to identify skills, possible roles, and interests.
                
                RULES:
                - Do not invent experience or skills not mentioned or implied by the bio/projects.
                - Return ONLY valid JSON matching this schema:
                {
                  "suggestedSkills": ["skill1", "skill2"],
                  "possibleRoles": ["role1", "role2"],
                  "suggestedInterests": ["interest1", "interest2"]
                }

                User Bio: %s
                Previous Projects: %s
                """.formatted(
                bio != null ? bio : "",
                previousProjects != null ? previousProjects : ""
        );
    }

    public String buildTeamCompositionPrompt(
            String projectName,
            String projectDescription,
            int targetTeamSize,
            List<String> requiredRoles,
            String candidatesJson) {

        return """
                You are an AI engineering manager. Select a balanced team from the provided candidates for the project.
                
                CRITICAL CONSTRAINTS:
                1. Do NOT select the same candidate twice.
                2. Do NOT exceed the requested team size: %d.
                3. Map candidates to the required roles: %s.
                4. Select only from the candidate IDs provided.
                
                Return ONLY valid JSON matching this schema:
                {
                  "assignments": [
                    {
                      "role": "<Role Name>",
                      "candidateUserId": <candidate user id>,
                      "rationale": "<Specific explanation why this person was selected for this role based on their skills>"
                    }
                  ],
                  "summary": "<Overall explanation of team balance and coverage>"
                }

                Project Name: %s
                Project Description: %s
                
                Available Candidates:
                %s
                """.formatted(
                targetTeamSize,
                String.join(", ", requiredRoles),
                projectName,
                projectDescription,
                candidatesJson
        );
    }

    public String buildTeamSkillsAnalysisPrompt(
            String projectName,
            String projectDescription,
            List<String> requiredSkills,
            List<String> requiredRoles,
            String currentTeamMembersJson) {

        return """
                You are an AI team composition auditor. Analyze the current team's combined skills against project requirements.
                
                Return ONLY valid JSON matching this schema:
                {
                  "teamStrengths": ["Strength 1", "Strength 2"],
                  "missingSkills": ["Missing Skill 1", "Missing Skill 2"],
                  "recommendation": "Consider adding a ...",
                  "coveragePercentage": 75.0
                }

                Project Name: %s
                Project Description: %s
                Required Skills: %s
                Required Roles: %s

                Current Team Members:
                %s
                """.formatted(
                projectName,
                projectDescription,
                String.join(", ", requiredSkills),
                String.join(", ", requiredRoles),
                currentTeamMembersJson
        );
    }

    public String buildProjectAssistantPrompt(
            String projectName,
            String projectDescription,
            List<String> requiredSkills,
            List<String> requiredRoles,
            String teamSummary,
            String candidatesSummary,
            String userQuestion) {

        return """
                You are the AI Project Assistant for the project "%s".
                
                RULES:
                1. Answer using ONLY the project's stored data, current team, and candidate information.
                2. Do not invent fictitious teammates, skills, or features.
                3. Be direct, professional, and actionable.
                
                Project Description: %s
                Required Skills: %s
                Required Roles: %s
                
                Current Team:
                %s
                
                Available Candidates:
                %s
                
                User Question:
                "%s"
                
                Return ONLY valid JSON matching this schema:
                {
                  "answer": "<helpful response grounded in project data>",
                  "suggestedFollowUps": ["Question 1?", "Question 2?"]
                }
                """.formatted(
                projectName,
                projectDescription,
                String.join(", ", requiredSkills),
                String.join(", ", requiredRoles),
                teamSummary,
                candidatesSummary,
                userQuestion
        );
    }
}
