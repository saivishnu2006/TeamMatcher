package com.aiteammatcher.service;

import com.aiteammatcher.dto.ChatMessageDto;
import com.aiteammatcher.dto.TeamChatInfoDto;
import com.aiteammatcher.entity.ChatMessage;
import com.aiteammatcher.entity.Project;
import com.aiteammatcher.entity.Team;
import com.aiteammatcher.entity.TeamMember;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.UnauthorizedException;
import com.aiteammatcher.repository.ChatMessageRepository;
import com.aiteammatcher.repository.ProjectRepository;
import com.aiteammatcher.repository.TeamMemberRepository;
import com.aiteammatcher.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private User memberUser;
    private User nonMemberUser;
    private Project project;
    private Team team;

    @BeforeEach
    void setUp() {
        memberUser = new User("member@example.com", "pass", "Alice Teammate", "ROLE_USER");
        memberUser.setId(10L);

        nonMemberUser = new User("outsider@example.com", "pass", "Bob Outsider", "ROLE_USER");
        nonMemberUser.setId(20L);

        project = new Project();
        project.setId(100L);
        project.setName("AI Collaboration Platform");
        project.setTeamSize(4);

        team = new Team(project, "AI Collaboration Platform Team");
        team.setId(50L);
    }

    @Test
    void testSendMessage_SuccessForTeamMember() {
        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.isUserMemberOfTeam(50L, 10L)).thenReturn(true);

        TeamMember member = new TeamMember(team, memberUser, "Lead Developer");
        when(teamMemberRepository.findByTeamAndUser(team, memberUser)).thenReturn(Optional.of(member));

        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage msg = invocation.getArgument(0);
            msg.setId(1L);
            return msg;
        });

        ChatMessageDto result = chatService.sendMessage(50L, memberUser, "Hello Team!");

        assertNotNull(result);
        assertEquals("Hello Team!", result.getContent());
        assertEquals("Alice Teammate", result.getSenderName());
        assertEquals("Lead Developer", result.getSenderRole());
        assertEquals(50L, result.getTeamId());

        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/teams/50"), any(ChatMessageDto.class));
    }

    @Test
    void testSendMessage_UnauthorizedForNonMember() {
        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.isUserMemberOfTeam(50L, 20L)).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> {
            chatService.sendMessage(50L, nonMemberUser, "Unauthorized message");
        });

        verify(chatMessageRepository, never()).save(any(ChatMessage.class));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(ChatMessageDto.class));
    }

    @Test
    void testSendMessage_EmptyContentThrowsBadRequest() {
        assertThrows(BadRequestException.class, () -> {
            chatService.sendMessage(50L, memberUser, "   ");
        });
    }

    @Test
    void testGetMessages_SuccessForMember() {
        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.isUserMemberOfTeam(50L, 10L)).thenReturn(true);

        ChatMessage msg = new ChatMessage(team, memberUser, "Welcome to the group chat!");
        msg.setId(2L);
        when(chatMessageRepository.findByTeamIdOrderBySentAtAsc(50L)).thenReturn(List.of(msg));

        List<ChatMessageDto> messages = chatService.getMessagesByTeamId(50L, memberUser);

        assertEquals(1, messages.size());
        assertEquals("Welcome to the group chat!", messages.get(0).getContent());
        assertEquals("Alice Teammate", messages.get(0).getSenderName());
    }

    @Test
    void testGetMessages_UnauthorizedForNonMember() {
        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.isUserMemberOfTeam(50L, 20L)).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> {
            chatService.getMessagesByTeamId(50L, nonMemberUser);
        });

        verify(chatMessageRepository, never()).findByTeamIdOrderBySentAtAsc(anyLong());
    }

    @Test
    void testGetTeamChatInfo() {
        when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.isUserMemberOfTeam(50L, 10L)).thenReturn(true);

        TeamChatInfoDto info = chatService.getTeamChatInfo(50L, memberUser);

        assertNotNull(info);
        assertEquals(50L, info.getTeamId());
        assertEquals("AI Collaboration Platform", info.getProjectName());
        assertTrue(info.isMember());
    }
}
