package com.aiteammatcher.dto;

public class SkillDto {
    private Long id;
    private String name;
    private String category;
    private String proficiencyLevel; // Beginner, Intermediate, Advanced, Expert

    public SkillDto() {
    }

    public SkillDto(Long id, String name, String category, String proficiencyLevel) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.proficiencyLevel = proficiencyLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
