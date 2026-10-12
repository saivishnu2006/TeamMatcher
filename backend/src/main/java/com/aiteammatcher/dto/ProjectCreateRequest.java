package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class ProjectCreateRequest {
    private String name;
    private String description;
    private Integer teamSize = 4;
    private String duration;
    private String availabilityRequirement;
    private String complexity;
    private List<String> requiredSkills = new ArrayList<>();
    private List<String> requiredRoles = new ArrayList<>();

    public ProjectCreateRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTeamSize() {
        return teamSize;
    }

    public void setTeamSize(Integer teamSize) {
        this.teamSize = teamSize;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getAvailabilityRequirement() {
        return availabilityRequirement;
    }

    public void setAvailabilityRequirement(String availabilityRequirement) {
        this.availabilityRequirement = availabilityRequirement;
    }

    public String getComplexity() {
        return complexity;
    }

    public void setComplexity(String complexity) {
        this.complexity = complexity;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public List<String> getRequiredRoles() {
        return requiredRoles;
    }

    public void setRequiredRoles(List<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }
}
