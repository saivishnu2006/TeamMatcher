package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class AiProjectAnalysisResponse {
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> suggestedRoles = new ArrayList<>();
    private Integer suggestedTeamSize = 4;
    private String projectComplexity = "Medium";
    private List<String> suggestedTechnologies = new ArrayList<>();

    public AiProjectAnalysisResponse() {
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getSuggestedRoles() {
        return suggestedRoles;
    }

    public void setSuggestedRoles(List<String> suggestedRoles) {
        this.suggestedRoles = suggestedRoles;
    }

    public Integer getSuggestedTeamSize() {
        return suggestedTeamSize;
    }

    public void setSuggestedTeamSize(Integer suggestedTeamSize) {
        this.suggestedTeamSize = suggestedTeamSize;
    }

    public String getProjectComplexity() {
        return projectComplexity;
    }

    public void setComplexity(String projectComplexity) {
        this.projectComplexity = projectComplexity;
    }

    public void setProjectComplexity(String projectComplexity) {
        this.projectComplexity = projectComplexity;
    }

    public List<String> getSuggestedTechnologies() {
        return suggestedTechnologies;
    }

    public void setSuggestedTechnologies(List<String> suggestedTechnologies) {
        this.suggestedTechnologies = suggestedTechnologies;
    }
}
