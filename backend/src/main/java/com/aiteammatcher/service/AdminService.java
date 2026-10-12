package com.aiteammatcher.service;

import com.aiteammatcher.dto.AdminStatsDto;
import com.aiteammatcher.dto.ProjectResponseDto;
import com.aiteammatcher.dto.ProfileDto;
import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.repository.ProjectRepository;
import com.aiteammatcher.repository.TeamMemberRepository;
import com.aiteammatcher.repository.TeamRepository;
import com.aiteammatcher.repository.TeamRequestRepository;
import com.aiteammatcher.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamRequestRepository teamRequestRepository;
    private final ProfileService profileService;
    private final ProjectService projectService;

    public AdminService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TeamRepository teamRepository,
            TeamRequestRepository teamRequestRepository,
            ProfileService profileService,
            ProjectService projectService) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.teamRequestRepository = teamRequestRepository;
        this.profileService = profileService;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getStats() {
        long totalUsers = userRepository.count();
        long totalProjects = projectRepository.count();
        long totalTeams = teamRepository.count();
        long totalRequests = teamRequestRepository.count();
        long pendingRequests = teamRequestRepository.findAll().stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()))
                .count();

        return new AdminStatsDto(totalUsers, totalProjects, totalTeams, totalRequests, pendingRequests);
    }

    @Transactional(readOnly = true)
    public List<ProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(profileService::getProfileByUser)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfileDto updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }

        user.setRole(role);
        User saved = userRepository.save(user);
        return profileService.getProfileByUser(saved);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            long adminCount = userRepository.findAll().stream().filter(u -> "ROLE_ADMIN".equals(u.getRole())).count();
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot delete the only administrator account");
            }
        }

        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectService::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        projectRepository.delete(project);
    }
}
