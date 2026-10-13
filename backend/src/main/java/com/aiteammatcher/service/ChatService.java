package com.aiteammatcher.service;

import com.aiteammatcher.dto.ChatMessageDto;
import com.aiteammatcher.dto.TeamChatInfoDto;
import com.aiteammatcher.dto.TeamMemberDto;
import com.aiteammatcher.entity.ChatMessage;
import com.aiteammatcher.entity.Team;
import com.aiteammatcher.entity.TeamMember;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.exception.UnauthorizedException;
import com.aiteammatcher.repository.ChatMessageRepository;
import com.aiteammatcher.repository.ProjectRepository;
import com.aiteammatcher.repository.TeamMemberRepository;
import com.aiteammatcher.repository.TeamRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(
            ChatMessageRepository chatMessageRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            ProjectRepository projectRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public boolean isUserMemberOfTeam(Long teamId, Long userId) {
        if (teamId == null || userId == null) return false;
        return teamMemberRepository.isUserMemberOfTeam(teamId, userId);
    }

    public boolean isUserMemberByEmail(Long teamId, String email) {
        if (teamId == null || email == null) return false;
        return teamMemberRepository.isUserMemberOfTeamByEmail(teamId, email);
    }

    public boolean isUserMemberOfProjectTeam(Long projectId, Long userId) {
        if (projectId == null || userId == null) return false;
        return teamMemberRepository.isUserMemberOfProjectTeam(projectId, userId);
    }

    public boolean isUserMemberOfProjectByEmail(Long projectId, String email) {
        if (projectId == null || email == null) return false;
        return teamMemberRepository.isUserMemberOfProjectTeamByEmail(projectId, email);
    }

    @Transactional(readOnly = true)
    public TeamChatInfoDto getTeamChatInfo(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        boolean isMember = user != null && isUserMemberOfTeam(teamId, user.getId());
        return buildChatInfoDto(team, isMember);
    }

    @Transactional(readOnly = true)
    public TeamChatInfoDto getProjectChatInfo(Long projectId, User user) {
        Team team = teamRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No team found for project id: " + projectId));

        boolean isMember = user != null && isUserMemberOfProjectTeam(projectId, user.getId());
        return buildChatInfoDto(team, isMember);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessagesByTeamId(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (!isUserMemberOfTeam(teamId, user.getId())) {
            throw new UnauthorizedException("Access denied: You are not a member of team '" + team.getName() + "'. Only team members can view this chat.");
        }

        List<ChatMessage> messages = chatMessageRepository.findByTeamIdOrderBySentAtAsc(teamId);
        return messages.stream()
                .map(m -> toDto(m, team))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessagesByProjectId(Long projectId, User user) {
        Team team = teamRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No team found for project id: " + projectId));

        if (!isUserMemberOfProjectTeam(projectId, user.getId())) {
            throw new UnauthorizedException("Access denied: You are not a member of this project's team. Only team members can view this chat.");
        }

        List<ChatMessage> messages = chatMessageRepository.findByProjectIdOrderBySentAtAsc(projectId);
        return messages.stream()
                .map(m -> toDto(m, team))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDto sendMessage(Long teamId, User sender, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be empty");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        if (!isUserMemberOfTeam(teamId, sender.getId())) {
            throw new UnauthorizedException("Access denied: You are not a member of team '" + team.getName() + "'. Only team members can send messages in this chat.");
        }

        ChatMessage message = new ChatMessage(team, sender, content.trim());
        ChatMessage saved = chatMessageRepository.save(message);

        ChatMessageDto dto = toDto(saved, team);

        // Broadcast to WebSocket subscribers of this team
        messagingTemplate.convertAndSend("/topic/teams/" + teamId, dto);

        if (team.getProject() != null) {
            messagingTemplate.convertAndSend("/topic/projects/" + team.getProject().getId(), dto);
        }

        return dto;
    }

    @Transactional
    public ChatMessageDto sendMessageByProjectId(Long projectId, User sender, String content) {
        Team team = teamRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No team found for project id: " + projectId));

        return sendMessage(team.getId(), sender, content);
    }

    private TeamChatInfoDto buildChatInfoDto(Team team, boolean isMember) {
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

        int targetSize = team.getProject() != null ? team.getProject().getTeamSize() : memberDtos.size();
        Long projectId = team.getProject() != null ? team.getProject().getId() : null;
        String projectName = team.getProject() != null ? team.getProject().getName() : team.getName();

        return new TeamChatInfoDto(
                team.getId(),
                projectId,
                projectName,
                team.getName(),
                isMember,
                memberDtos,
                memberDtos.size(),
                targetSize
        );
    }

    private ChatMessageDto toDto(ChatMessage message, Team team) {
        String roleName = teamMemberRepository.findByTeamAndUser(team, message.getSender())
                .map(TeamMember::getRoleName)
                .orElse("Member");

        Long projectId = team.getProject() != null ? team.getProject().getId() : null;
        String projectName = team.getProject() != null ? team.getProject().getName() : team.getName();

        return new ChatMessageDto(
                message.getId(),
                team.getId(),
                projectId,
                projectName,
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getSender().getEmail(),
                roleName,
                message.getContent(),
                message.getSentAt()
        );
    }
}
