package com.aiteammatcher.dto;

public class AiProfileAnalysisRequest {
    private String bio;
    private String previousProjects;

    public AiProfileAnalysisRequest() {
    }

    public AiProfileAnalysisRequest(String bio, String previousProjects) {
        this.bio = bio;
        this.previousProjects = previousProjects;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPreviousProjects() {
        return previousProjects;
    }

    public void setPreviousProjects(String previousProjects) {
        this.previousProjects = previousProjects;
    }
}
