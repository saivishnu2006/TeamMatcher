package com.aiteammatcher.controller;

import com.aiteammatcher.dto.ChatMessageDto;
import com.aiteammatcher.dto.ChatMessageRequest;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.repository.UserRepository;
import com.aiteammatcher.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatWebSocketController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/teams/{teamId}/chat")
    public void handleTeamChatMessage(
            @DestinationVariable Long teamId,
            @Payload ChatMessageRequest request,
            Principal principal) {
        if (principal == null) {
            logger.warn("Unauthenticated WebSocket message received for team {}", teamId);
            return;
        }

        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            logger.warn("User not found for email {} during team {} chat", principal.getName(), teamId);
            return;
        }

        chatService.sendMessage(teamId, user, request.getContent());
    }

    @MessageMapping("/projects/{projectId}/chat")
    public void handleProjectChatMessage(
            @DestinationVariable Long projectId,
            @Payload ChatMessageRequest request,
            Principal principal) {
        if (principal == null) {
            logger.warn("Unauthenticated WebSocket message received for project {}", projectId);
            return;
        }

        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            logger.warn("User not found for email {} during project {} chat", principal.getName(), projectId);
            return;
        }

        chatService.sendMessageByProjectId(projectId, user, request.getContent());
    }
}
