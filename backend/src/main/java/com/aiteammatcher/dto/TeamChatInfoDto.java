package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class TeamChatInfoDto {
    private Long teamId;
    private Long projectId;
    private String projectName;
    private String teamName;
    private boolean isMember;
    private List<TeamMemberDto> members = new ArrayList<>();
    private int memberCount;
    private int targetTeamSize;

    public TeamChatInfoDto() {
    }

    public TeamChatInfoDto(Long teamId, Long projectId, String projectName, String teamName,
                           boolean isMember, List<TeamMemberDto> members,
                           int memberCount, int targetTeamSize) {
        this.teamId = teamId;
        this.projectId = projectId;
        this.projectName = projectName;
        this.teamName = teamName;
        this.isMember = isMember;
        this.members = members;
        this.memberCount = memberCount;
        this.targetTeamSize = targetTeamSize;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
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

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public boolean isMember() {
        return isMember;
    }

    public void setMember(boolean member) {
        isMember = member;
    }

    public List<TeamMemberDto> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberDto> members) {
        this.members = members;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public int getTargetTeamSize() {
        return targetTeamSize;
    }

    public void setTargetTeamSize(int targetTeamSize) {
        this.targetTeamSize = targetTeamSize;
    }
}
