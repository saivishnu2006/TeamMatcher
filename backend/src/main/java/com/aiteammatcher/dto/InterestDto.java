package com.aiteammatcher.dto;

public class InterestDto {
    private Long id;
    private String name;

    public InterestDto() {
    }

    public InterestDto(Long id, String name) {
        this.id = id;
        this.name = name;
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
}
