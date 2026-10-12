package com.aiteammatcher.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TeamMemberDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String roleName;
    private List<String> skills = new ArrayList<>();
    private LocalDateTime joinedAt;

    public TeamMemberDto() {
    }

    public TeamMemberDto(Long id, Long userId, String fullName, String email, String roleName, List<String> skills, LocalDateTime joinedAt) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.roleName = roleName;
        this.skills = skills;
        this.joinedAt = joinedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
