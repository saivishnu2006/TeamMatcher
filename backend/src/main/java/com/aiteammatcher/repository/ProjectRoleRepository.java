package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    List<ProjectRole> findByProject(Project project);
    void deleteByProject(Project project);
}
