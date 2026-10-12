package com.aiteammatcher.controller;

import com.aiteammatcher.dto.JoinRequestDto;
import com.aiteammatcher.dto.TeamRequestCreateDto;
import com.aiteammatcher.dto.TeamRequestResponseDto;
import com.aiteammatcher.dto.UserProjectStatusDto;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.repository.UserRepository;
import com.aiteammatcher.security.UserPrincipal;
import com.aiteammatcher.service.TeamRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-requests")
public class TeamRequestController {

    private final TeamRequestService teamRequestService;
    private final UserRepository userRepository;

    public TeamRequestController(TeamRequestService teamRequestService, UserRepository userRepository) {
        this.teamRequestService = teamRequestService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<TeamRequestResponseDto> sendInvite(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody TeamRequestCreateDto dto) {
        User user = getAuthenticatedUser(principal);
        TeamRequestResponseDto response = teamRequestService.sendInvite(user, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/projects/{projectId}/join")
    public ResponseEntity<TeamRequestResponseDto> sendJoinRequest(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) JoinRequestDto dto) {
        User user = getAuthenticatedUser(principal);
        TeamRequestResponseDto response = teamRequestService.sendJoinRequest(user, projectId, dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/projects/{projectId}/status")
    public ResponseEntity<UserProjectStatusDto> getUserProjectStatus(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamRequestService.getUserProjectStatus(user, projectId));
    }

    @GetMapping("/received")
    public ResponseEntity<List<TeamRequestResponseDto>> getReceivedRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamRequestService.getReceivedRequests(user));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<TeamRequestResponseDto>> getSentRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamRequestService.getSentRequests(user));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<TeamRequestResponseDto> acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamRequestService.acceptRequest(id, user));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TeamRequestResponseDto> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamRequestService.rejectRequest(id, user));
    }
}
