package com.aiteammatcher.repository;

import com.aiteammatcher.entity.AiMatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiMatchResultRepository extends JpaRepository<AiMatchResult, Long> {
    List<AiMatchResult> findByProjectIdOrderByFinalScoreDesc(Long projectId);
    Optional<AiMatchResult> findByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectId(Long projectId);
}
