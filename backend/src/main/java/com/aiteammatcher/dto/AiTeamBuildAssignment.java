package com.aiteammatcher.dto;

public class AiTeamBuildAssignment {
    private String role;
    private MatchCandidateDto candidate;
    private String rationale;

    public AiTeamBuildAssignment() {
    }

    public AiTeamBuildAssignment(String role, MatchCandidateDto candidate, String rationale) {
        this.role = role;
        this.candidate = candidate;
        this.rationale = rationale;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public MatchCandidateDto getCandidate() {
        return candidate;
    }

    public void setCandidate(MatchCandidateDto candidate) {
        this.candidate = candidate;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }
}
