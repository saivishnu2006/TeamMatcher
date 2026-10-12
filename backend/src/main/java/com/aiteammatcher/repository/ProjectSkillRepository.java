package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, Long> {
    List<ProjectSkill> findByProject(Project project);
    void deleteByProject(Project project);
}
