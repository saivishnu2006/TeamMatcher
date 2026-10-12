package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class AiTeamAnalysisResponse {
    private List<String> teamStrengths = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private String recommendation;
    private Double coveragePercentage;

    public AiTeamAnalysisResponse() {
    }

    public List<String> getTeamStrengths() {
        return teamStrengths;
    }

    public void setTeamStrengths(List<String> teamStrengths) {
        this.teamStrengths = teamStrengths;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public Double getCoveragePercentage() {
        return coveragePercentage;
    }

    public void setCoveragePercentage(Double coveragePercentage) {
        this.coveragePercentage = coveragePercentage;
    }
}
