package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwner(User owner);
    List<Project> findByOwnerId(Long ownerId);
    List<Project> findByStatus(String status);
}
