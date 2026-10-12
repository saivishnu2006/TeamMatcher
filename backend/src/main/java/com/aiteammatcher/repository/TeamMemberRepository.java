package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Team;
import com.aiteammatcher.entity.TeamMember;
import com.aiteammatcher.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeam(Team team);
    List<TeamMember> findByUser(User user);
    List<TeamMember> findByUserId(Long userId);
    Optional<TeamMember> findByTeamAndUser(Team team, User user);
    boolean existsByTeamAndUser(Team team, User user);
    void deleteByTeamAndUser(Team team, User user);
}
