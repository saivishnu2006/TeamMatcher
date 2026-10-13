package com.aiteammatcher.dto;

import java.time.LocalDateTime;

public class ChatMessageDto {
    private Long id;
    private Long teamId;
    private Long projectId;
    private String projectName;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderRole;
    private String content;
    private LocalDateTime timestamp;

    public ChatMessageDto() {
    }

    public ChatMessageDto(Long id, Long teamId, Long projectId, String projectName,
                          Long senderId, String senderName, String senderEmail,
                          String senderRole, String content, LocalDateTime timestamp) {
        this.id = id;
        this.teamId = teamId;
        this.projectId = projectId;
        this.projectName = projectName;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.senderRole = senderRole;
        this.content = content;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
