package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.TeamRequest;
import com.aiteammatcher.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRequestRepository extends JpaRepository<TeamRequest, Long> {
    List<TeamRequest> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<TeamRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<TeamRequest> findBySenderOrderByCreatedAtDesc(User sender);
    List<TeamRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<TeamRequest> findByProject(Project project);
    Optional<TeamRequest> findByProjectAndReceiverAndStatus(Project project, User receiver, String status);
    boolean existsByProjectAndReceiverAndStatus(Project project, User receiver, String status);
    Optional<TeamRequest> findByProjectAndSenderAndStatus(Project project, User sender, String status);
    boolean existsByProjectAndSenderAndStatus(Project project, User sender, String status);
}
