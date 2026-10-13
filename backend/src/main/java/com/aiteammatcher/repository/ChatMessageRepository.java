package com.aiteammatcher.repository;

import com.aiteammatcher.entity.ChatMessage;
import com.aiteammatcher.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByTeamOrderBySentAtAsc(Team team);

    List<ChatMessage> findByTeamIdOrderBySentAtAsc(Long teamId);

    @Query("SELECT m FROM ChatMessage m WHERE m.team.project.id = :projectId ORDER BY m.sentAt ASC")
    List<ChatMessage> findByProjectIdOrderBySentAtAsc(@Param("projectId") Long projectId);
}
