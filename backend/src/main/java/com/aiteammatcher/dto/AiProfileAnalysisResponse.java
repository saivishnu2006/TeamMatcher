package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class AiProfileAnalysisResponse {
    private List<String> suggestedSkills = new ArrayList<>();
    private List<String> possibleRoles = new ArrayList<>();
    private List<String> suggestedInterests = new ArrayList<>();

    public AiProfileAnalysisResponse() {
    }

    public List<String> getSuggestedSkills() {
        return suggestedSkills;
    }

    public void setSuggestedSkills(List<String> suggestedSkills) {
        this.suggestedSkills = suggestedSkills;
    }

    public List<String> getPossibleRoles() {
        return possibleRoles;
    }

    public void setPossibleRoles(List<String> possibleRoles) {
        this.possibleRoles = possibleRoles;
    }

    public List<String> getSuggestedInterests() {
        return suggestedInterests;
    }

    public void setSuggestedInterests(List<String> suggestedInterests) {
        this.suggestedInterests = suggestedInterests;
    }
}
