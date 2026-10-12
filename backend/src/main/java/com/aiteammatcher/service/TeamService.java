package com.aiteammatcher.service;

import com.aiteammatcher.dto.TeamMemberDto;
import com.aiteammatcher.dto.TeamResponseDto;
import com.aiteammatcher.entity.*;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.repository.ProjectRepository;
import com.aiteammatcher.repository.TeamMemberRepository;
import com.aiteammatcher.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;

    public TeamService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            ProjectRepository projectRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public TeamResponseDto getTeamByProjectId(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Team team = teamRepository.findByProject(project)
                .orElseGet(() -> {
                    Team t = new Team(project, project.getName() + " Team");
                    return teamRepository.save(t);
                });

        return toDto(team, project);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberDto> getTeamMembers(Long projectId) {
        TeamResponseDto team = getTeamByProjectId(projectId);
        return team.getMembers();
    }

    @Transactional(readOnly = true)
    public List<TeamResponseDto> getMyTeams(User user) {
        List<TeamMember> memberships = teamMemberRepository.findByUser(user);
        List<TeamResponseDto> list = new ArrayList<>();
        for (TeamMember tm : memberships) {
            Team t = tm.getTeam();
            list.add(toDto(t, t.getProject()));
        }
        return list;
    }

    @Transactional
    public TeamMember addMember(Team team, User user, String roleName) {
        Project project = team.getProject();
        if (team.getMembers().size() >= project.getTeamSize()) {
            throw new BadRequestException("Team has already reached its maximum size of " + project.getTeamSize());
        }

        if (teamMemberRepository.existsByTeamAndUser(team, user)) {
            throw new BadRequestException("User is already a member of this team");
        }

        TeamMember member = new TeamMember(team, user, roleName);
        TeamMember saved = teamMemberRepository.save(member);
        team.getMembers().add(saved);

        // Update project status if team is full
        if (team.getMembers().size() >= project.getTeamSize()) {
            project.setStatus("IN_PROGRESS");
            projectRepository.save(project);
        }

        return saved;
    }

    private TeamResponseDto toDto(Team team, Project project) {
        TeamResponseDto dto = new TeamResponseDto();
        dto.setId(team.getId());
        dto.setProjectId(project.getId());
        dto.setProjectName(project.getName());
        dto.setTargetTeamSize(project.getTeamSize());

        List<TeamMemberDto> memberDtos = team.getMembers().stream()
                .map(m -> {
                    List<String> skills = m.getUser().getProfile() != null ?
                            m.getUser().getProfile().getUserSkills().stream()
                                    .map(us -> us.getSkill().getName())
                                    .collect(Collectors.toList()) :
                            new ArrayList<>();
                    return new TeamMemberDto(
                            m.getId(),
                            m.getUser().getId(),
                            m.getUser().getFullName(),
                            m.getUser().getEmail(),
                            m.getRoleName(),
                            skills,
                            m.getJoinedAt()
                    );
                })
                .collect(Collectors.toList());

        dto.setMembers(memberDtos);
        dto.setFull(memberDtos.size() >= project.getTeamSize());

        return dto;
    }
}
