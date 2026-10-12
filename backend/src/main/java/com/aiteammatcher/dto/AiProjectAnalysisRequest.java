package com.aiteammatcher.dto;

public class AiProjectAnalysisRequest {
    private String projectName;
    private String description;

    public AiProjectAnalysisRequest() {
    }

    public AiProjectAnalysisRequest(String projectName, String description) {
        this.projectName = projectName;
        this.description = description;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
