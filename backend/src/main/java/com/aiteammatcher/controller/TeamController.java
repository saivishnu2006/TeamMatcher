package com.aiteammatcher.controller;

import com.aiteammatcher.dto.TeamResponseDto;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.repository.UserRepository;
import com.aiteammatcher.security.UserPrincipal;
import com.aiteammatcher.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TeamController {

    private final TeamService teamService;
    private final UserRepository userRepository;

    public TeamController(TeamService teamService, UserRepository userRepository) {
        this.teamService = teamService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/projects/{projectId}/team")
    public ResponseEntity<TeamResponseDto> getProjectTeam(@PathVariable Long projectId) {
        return ResponseEntity.ok(teamService.getTeamByProjectId(projectId));
    }

    @GetMapping("/teams/my-teams")
    public ResponseEntity<List<TeamResponseDto>> getMyTeams(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamService.getMyTeams(user));
    }
}
