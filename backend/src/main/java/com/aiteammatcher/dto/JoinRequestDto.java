package com.aiteammatcher.dto;

public class JoinRequestDto {
    private String message;
    private String preferredRole;

    public JoinRequestDto() {
    }

    public JoinRequestDto(String message, String preferredRole) {
        this.message = message;
        this.preferredRole = preferredRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPreferredRole() {
        return preferredRole;
    }

    public void setPreferredRole(String preferredRole) {
        this.preferredRole = preferredRole;
    }
}
