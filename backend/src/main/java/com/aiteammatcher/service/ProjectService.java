package com.aiteammatcher.service;

import com.aiteammatcher.dto.ProjectCreateRequest;
import com.aiteammatcher.dto.ProjectResponseDto;
import com.aiteammatcher.entity.*;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.exception.UnauthorizedException;
import com.aiteammatcher.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            SkillRepository skillRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository) {
        this.projectRepository = projectRepository;
        this.skillRepository = skillRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional
    public ProjectResponseDto createProject(User user, ProjectCreateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Project name is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new BadRequestException("Project description is required");
        }

        Project project = new Project();
        project.setOwner(user);
        project.setName(request.getName().trim());
        project.setDescription(request.getDescription().trim());
        project.setTeamSize(request.getTeamSize() != null && request.getTeamSize() > 0 ? request.getTeamSize() : 4);
        project.setDuration(request.getDuration() != null ? request.getDuration() : "3 months");
        project.setAvailabilityRequirement(request.getAvailabilityRequirement() != null ? request.getAvailabilityRequirement() : "Flexible");
        project.setComplexity(request.getComplexity() != null ? request.getComplexity() : "Medium");
        project.setStatus("OPEN");

        // Add skills
        if (request.getRequiredSkills() != null) {
            for (String sName : request.getRequiredSkills()) {
                if (sName != null && !sName.isBlank()) {
                    String trimmed = sName.trim();
                    Skill skill = skillRepository.findByNameIgnoreCase(trimmed)
                            .orElseGet(() -> skillRepository.save(new Skill(trimmed, "Technical")));
                    project.getRequiredSkills().add(new ProjectSkill(project, skill));
                }
            }
        }

        // Add roles
        if (request.getRequiredRoles() != null) {
            for (String rName : request.getRequiredRoles()) {
                if (rName != null && !rName.isBlank()) {
                    project.getRequiredRoles().add(new ProjectRole(project, rName.trim()));
                }
            }
        }

        Project savedProject = projectRepository.save(project);

        // Auto-create Team for this project and add Owner as Team Lead
        Team team = new Team(savedProject, savedProject.getName() + " Team");
        Team savedTeam = teamRepository.save(team);

        TeamMember leadMember = new TeamMember(savedTeam, user, "Project Lead / Owner");
        teamMemberRepository.save(leadMember);
        savedTeam.getMembers().add(leadMember);

        return toDto(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectResponseDto getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        return toDto(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getMyProjects(User user) {
        return projectRepository.findByOwner(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getAllOpenProjects() {
        return projectRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponseDto> getJoinedProjects(User user) {
        List<TeamMember> memberships = teamMemberRepository.findByUser(user);
        List<ProjectResponseDto> result = new ArrayList<>();
        for (TeamMember tm : memberships) {
            Project p = tm.getTeam().getProject();
            if (!p.getOwner().getId().equals(user.getId())) {
                result.add(toDto(p));
            }
        }
        return result;
    }

    @Transactional
    public ProjectResponseDto updateProject(Long projectId, User user, ProjectCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getOwner().getId().equals(user.getId()) && !user.getRole().equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("You are not authorized to update this project");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            project.setDescription(request.getDescription().trim());
        }
        if (request.getTeamSize() != null && request.getTeamSize() > 0) {
            project.setTeamSize(request.getTeamSize());
        }
        if (request.getDuration() != null) {
            project.setDuration(request.getDuration());
        }
        if (request.getAvailabilityRequirement() != null) {
            project.setAvailabilityRequirement(request.getAvailabilityRequirement());
        }
        if (request.getComplexity() != null) {
            project.setComplexity(request.getComplexity());
        }

        if (request.getRequiredSkills() != null) {
            project.getRequiredSkills().clear();
            for (String sName : request.getRequiredSkills()) {
                if (sName != null && !sName.isBlank()) {
                    String trimmed = sName.trim();
                    Skill skill = skillRepository.findByNameIgnoreCase(trimmed)
                            .orElseGet(() -> skillRepository.save(new Skill(trimmed, "Technical")));
                    project.getRequiredSkills().add(new ProjectSkill(project, skill));
                }
            }
        }

        if (request.getRequiredRoles() != null) {
            project.getRequiredRoles().clear();
            for (String rName : request.getRequiredRoles()) {
                if (rName != null && !rName.isBlank()) {
                    project.getRequiredRoles().add(new ProjectRole(project, rName.trim()));
                }
            }
        }

        Project saved = projectRepository.save(project);
        return toDto(saved);
    }

    @Transactional
    public void deleteProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getOwner().getId().equals(user.getId()) && !user.getRole().equals("ROLE_ADMIN")) {
            throw new UnauthorizedException("You are not authorized to delete this project");
        }

        projectRepository.delete(project);
    }

    public ProjectResponseDto toDto(Project project) {
        ProjectResponseDto dto = new ProjectResponseDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setTeamSize(project.getTeamSize());
        dto.setDuration(project.getDuration());
        dto.setAvailabilityRequirement(project.getAvailabilityRequirement());
        dto.setComplexity(project.getComplexity());
        dto.setStatus(project.getStatus());
        dto.setOwnerId(project.getOwner().getId());
        dto.setOwnerName(project.getOwner().getFullName());
        dto.setOwnerEmail(project.getOwner().getEmail());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        List<String> skills = project.getRequiredSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .collect(Collectors.toList());
        dto.setRequiredSkills(skills);

        List<String> roles = project.getRequiredRoles().stream()
                .map(ProjectRole::getRoleName)
                .collect(Collectors.toList());
        dto.setRequiredRoles(roles);

        teamRepository.findByProject(project).ifPresent(team -> {
            dto.setCurrentTeamSize(team.getMembers().size());
        });

        return dto;
    }
}
