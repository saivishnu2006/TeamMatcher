package com.aiteammatcher.dto;

public class TeamRequestCreateDto {
    private Long projectId;
    private Long receiverId;
    private String message;

    public TeamRequestCreateDto() {
    }

    public TeamRequestCreateDto(Long projectId, Long receiverId, String message) {
        this.projectId = projectId;
        this.receiverId = receiverId;
        this.message = message;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
