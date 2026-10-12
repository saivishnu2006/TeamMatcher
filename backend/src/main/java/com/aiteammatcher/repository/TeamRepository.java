package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByProject(Project project);
    Optional<Team> findByProjectId(Long projectId);
}
