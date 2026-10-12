package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class TeamResponseDto {
    private Long id;
    private Long projectId;
    private String projectName;
    private Integer targetTeamSize;
    private List<TeamMemberDto> members = new ArrayList<>();
    private boolean isFull;

    public TeamResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Integer getTargetTeamSize() {
        return targetTeamSize;
    }

    public void setTargetTeamSize(Integer targetTeamSize) {
        this.targetTeamSize = targetTeamSize;
    }

    public List<TeamMemberDto> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberDto> members) {
        this.members = members;
    }

    public boolean isFull() {
        return isFull;
    }

    public void setFull(boolean full) {
        isFull = full;
    }
}
