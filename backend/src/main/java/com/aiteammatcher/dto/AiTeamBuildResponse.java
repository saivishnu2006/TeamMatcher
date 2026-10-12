package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class AiTeamBuildResponse {
    private List<AiTeamBuildAssignment> assignments = new ArrayList<>();
    private String summary;

    public AiTeamBuildResponse() {
    }

    public List<AiTeamBuildAssignment> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<AiTeamBuildAssignment> assignments) {
        this.assignments = assignments;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
