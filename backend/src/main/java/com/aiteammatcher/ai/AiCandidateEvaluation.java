package com.aiteammatcher.ai;

import java.util.ArrayList;
import java.util.List;

public class AiCandidateEvaluation {
    private int matchScore;
    private String reason;
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private String recommendedRole;
    private List<String> strengths = new ArrayList<>();

    public AiCandidateEvaluation() {
    }

    public AiCandidateEvaluation(int matchScore, String reason, List<String> matchedSkills, List<String> missingSkills, String recommendedRole, List<String> strengths) {
        this.matchScore = matchScore;
        this.reason = reason;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.recommendedRole = recommendedRole;
        this.strengths = strengths;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public String getRecommendedRole() {
        return recommendedRole;
    }

    public void setRecommendedRole(String recommendedRole) {
        this.recommendedRole = recommendedRole;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }
}
