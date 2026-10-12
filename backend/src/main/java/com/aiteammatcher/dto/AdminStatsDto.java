package com.aiteammatcher.dto;

public class AdminStatsDto {
    private long totalUsers;
    private long totalProjects;
    private long totalTeams;
    private long totalRequests;
    private long pendingRequests;

    public AdminStatsDto() {
    }

    public AdminStatsDto(long totalUsers, long totalProjects, long totalTeams, long totalRequests, long pendingRequests) {
        this.totalUsers = totalUsers;
        this.totalProjects = totalProjects;
        this.totalTeams = totalTeams;
        this.totalRequests = totalRequests;
        this.pendingRequests = pendingRequests;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getTotalTeams() {
        return totalTeams;
    }

    public void setTotalTeams(long totalTeams) {
        this.totalTeams = totalTeams;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }
}
