package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class AiTeamBuildRequest {
    private Long projectId;
    private Integer teamSize;
    private List<String> requiredRoles = new ArrayList<>();

    public AiTeamBuildRequest() {
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Integer getTeamSize() {
        return teamSize;
    }

    public void setTeamSize(Integer teamSize) {
        this.teamSize = teamSize;
    }

    public List<String> getRequiredRoles() {
        return requiredRoles;
    }

    public void setRequiredRoles(List<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }
}
