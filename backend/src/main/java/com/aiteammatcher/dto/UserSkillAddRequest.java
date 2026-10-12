package com.aiteammatcher.dto;

public class UserSkillAddRequest {
    private String skillName;
    private String category;
    private String proficiencyLevel; // Beginner, Intermediate, Advanced, Expert

    public UserSkillAddRequest() {
    }

    public UserSkillAddRequest(String skillName, String category, String proficiencyLevel) {
        this.skillName = skillName;
        this.category = category;
        this.proficiencyLevel = proficiencyLevel;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }
}
