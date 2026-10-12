package com.aiteammatcher.controller;

import com.aiteammatcher.dto.JoinRequestDto;
import com.aiteammatcher.dto.ProjectCreateRequest;
import com.aiteammatcher.dto.ProjectResponseDto;
import com.aiteammatcher.dto.TeamRequestResponseDto;
import com.aiteammatcher.dto.UserProjectStatusDto;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.repository.UserRepository;
import com.aiteammatcher.security.UserPrincipal;
import com.aiteammatcher.service.ProjectService;
import com.aiteammatcher.service.TeamRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final TeamRequestService teamRequestService;

    public ProjectController(
            ProjectService projectService,
            UserRepository userRepository,
            TeamRequestService teamRequestService) {
        this.projectService = projectService;
        this.userRepository = userRepository;
        this.teamRequestService = teamRequestService;
    }

    private User getAuthenticatedUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDto> createProject(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProjectCreateRequest request) {
        User user = getAuthenticatedUser(principal);
        ProjectResponseDto created = projectService.createProject(user, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllOpenProjects());
    }

    @GetMapping("/my-projects")
    public ResponseEntity<List<ProjectResponseDto>> getMyProjects(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(projectService.getMyProjects(user));
    }

    @GetMapping("/joined")
    public ResponseEntity<List<ProjectResponseDto>> getJoinedProjects(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(projectService.getJoinedProjects(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> updateProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProjectCreateRequest request) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(projectService.updateProject(id, user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        projectService.deleteProject(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join-request")
    public ResponseEntity<TeamRequestResponseDto> sendJoinRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) JoinRequestDto dto) {
        User user = getAuthenticatedUser(principal);
        return new ResponseEntity<>(teamRequestService.sendJoinRequest(user, id, dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<UserProjectStatusDto> getUserProjectStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(teamRequestService.getUserProjectStatus(user, id));
    }
}
