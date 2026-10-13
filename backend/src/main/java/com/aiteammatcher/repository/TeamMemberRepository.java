package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Team;
import com.aiteammatcher.entity.TeamMember;
import com.aiteammatcher.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.user.id = :userId")
    boolean isUserMemberOfTeam(@Param("teamId") Long teamId, @Param("userId") Long userId);

    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.user.email = :email")
    boolean isUserMemberOfTeamByEmail(@Param("teamId") Long teamId, @Param("email") String email);

    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm WHERE tm.team.project.id = :projectId AND tm.user.id = :userId")
    boolean isUserMemberOfProjectTeam(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm WHERE tm.team.project.id = :projectId AND tm.user.email = :email")
    boolean isUserMemberOfProjectTeamByEmail(@Param("projectId") Long projectId, @Param("email") String email);
}
