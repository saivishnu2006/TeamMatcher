package com.aiteammatcher.dto;

public class AiChatRequest {
    private Long projectId;
    private String message;

    public AiChatRequest() {
    }

    public AiChatRequest(Long projectId, String message) {
        this.projectId = projectId;
        this.message = message;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
