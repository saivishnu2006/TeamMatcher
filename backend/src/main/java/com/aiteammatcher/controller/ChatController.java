package com.aiteammatcher.controller;

import com.aiteammatcher.dto.ChatMessageDto;
import com.aiteammatcher.dto.ChatMessageRequest;
import com.aiteammatcher.dto.TeamChatInfoDto;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.repository.UserRepository;
import com.aiteammatcher.security.UserPrincipal;
import com.aiteammatcher.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // Team-centric endpoints
    @GetMapping("/teams/{teamId}/chat/info")
    public ResponseEntity<TeamChatInfoDto> getTeamChatInfo(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(chatService.getTeamChatInfo(teamId, user));
    }

    @GetMapping("/teams/{teamId}/chat/messages")
    public ResponseEntity<List<ChatMessageDto>> getTeamMessages(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(chatService.getMessagesByTeamId(teamId, user));
    }

    @PostMapping("/teams/{teamId}/chat/messages")
    public ResponseEntity<ChatMessageDto> sendTeamMessage(
            @PathVariable Long teamId,
            @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(chatService.sendMessage(teamId, user, request.getContent()));
    }

    // Project-centric endpoints
    @GetMapping("/projects/{projectId}/chat/info")
    public ResponseEntity<TeamChatInfoDto> getProjectChatInfo(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(chatService.getProjectChatInfo(projectId, user));
    }

    @GetMapping("/projects/{projectId}/chat/messages")
    public ResponseEntity<List<ChatMessageDto>> getProjectMessages(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(chatService.getMessagesByProjectId(projectId, user));
    }

    @PostMapping("/projects/{projectId}/chat/messages")
    public ResponseEntity<ChatMessageDto> sendProjectMessage(
            @PathVariable Long projectId,
            @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(chatService.sendMessageByProjectId(projectId, user, request.getContent()));
    }
}
