package com.aiteammatcher.dto;

public class UserProjectStatusDto {
    private boolean isOwner;
    private boolean isMember;
    private boolean hasPendingRequest;
    private Long pendingRequestId;
    private String requestType; // INVITATION or JOIN_REQUEST
    private boolean isFull;

    public UserProjectStatusDto() {
    }

    public UserProjectStatusDto(boolean isOwner, boolean isMember, boolean hasPendingRequest, Long pendingRequestId, String requestType, boolean isFull) {
        this.isOwner = isOwner;
        this.isMember = isMember;
        this.hasPendingRequest = hasPendingRequest;
        this.pendingRequestId = pendingRequestId;
        this.requestType = requestType;
        this.isFull = isFull;
    }

    public boolean isOwner() {
        return isOwner;
    }

    public void setOwner(boolean owner) {
        isOwner = owner;
    }

    public boolean isMember() {
        return isMember;
    }

    public void setMember(boolean member) {
        isMember = member;
    }

    public boolean isHasPendingRequest() {
        return hasPendingRequest;
    }

    public void setHasPendingRequest(boolean hasPendingRequest) {
        this.hasPendingRequest = hasPendingRequest;
    }

    public Long getPendingRequestId() {
        return pendingRequestId;
    }

    public void setPendingRequestId(Long pendingRequestId) {
        this.pendingRequestId = pendingRequestId;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public boolean isFull() {
        return isFull;
    }

    public void setFull(boolean full) {
        isFull = full;
    }
}
