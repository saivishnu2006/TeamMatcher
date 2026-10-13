package com.aiteammatcher.config;

import com.aiteammatcher.security.CustomUserDetailsService;
import com.aiteammatcher.security.JwtTokenProvider;
import com.aiteammatcher.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final ChatService chatService;

    public WebSocketConfig(
            JwtTokenProvider jwtTokenProvider,
            CustomUserDetailsService customUserDetailsService,
            @Lazy ChatService chatService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.customUserDetailsService = customUserDetailsService;
        this.chatService = chatService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS fallback endpoint
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Native WebSocket endpoint
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix for outgoing topic subscriptions
        registry.enableSimpleBroker("/topic");
        // Prefix for incoming messages routed to @MessageMapping handlers
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    authenticateStompConnection(accessor);
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    authorizeSubscription(accessor);
                } else if (StompCommand.SEND.equals(accessor.getCommand())) {
                    authorizeSendMessage(accessor);
                }

                return message;
            }
        });
    }

    private void authenticateStompConnection(StompHeaderAccessor accessor) {
        String token = accessor.getFirstNativeHeader("Authorization");
        if (!StringUtils.hasText(token)) {
            token = accessor.getFirstNativeHeader("token");
        }

        if (StringUtils.hasText(token)) {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getEmailFromToken(token);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                accessor.setUser(authentication);
                logger.debug("STOMP connection authenticated for user: {}", email);
            } else {
                logger.warn("Invalid JWT token presented during STOMP connect");
            }
        }
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) return;

        Principal principal = accessor.getUser();
        if (principal == null) {
            logger.warn("Unauthenticated attempt to subscribe to: {}", destination);
            throw new AccessDeniedException("Authentication required to subscribe to team chat");
        }

        if (destination.startsWith("/topic/teams/")) {
            Long teamId = parseIdAfterPrefix(destination, "/topic/teams/");
            if (teamId != null && !chatService.isUserMemberByEmail(teamId, principal.getName())) {
                logger.warn("User {} denied subscription to team {}: Not a member", principal.getName(), teamId);
                throw new AccessDeniedException("Access denied: You are not a member of team " + teamId);
            }
        } else if (destination.startsWith("/topic/projects/")) {
            Long projectId = parseIdAfterPrefix(destination, "/topic/projects/");
            if (projectId != null && !chatService.isUserMemberOfProjectByEmail(projectId, principal.getName())) {
                logger.warn("User {} denied subscription to project {} team chat: Not a member", principal.getName(), projectId);
                throw new AccessDeniedException("Access denied: You are not a member of this project's team");
            }
        }
    }

    private void authorizeSendMessage(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) return;

        Principal principal = accessor.getUser();
        if (principal == null) {
            logger.warn("Unauthenticated attempt to send message to: {}", destination);
            throw new AccessDeniedException("Authentication required to send chat messages");
        }

        if (destination.startsWith("/app/teams/")) {
            Long teamId = parseIdInPath(destination, "/app/teams/");
            if (teamId != null && !chatService.isUserMemberByEmail(teamId, principal.getName())) {
                logger.warn("User {} denied sending to team {}: Not a member", principal.getName(), teamId);
                throw new AccessDeniedException("Access denied: You are not a member of team " + teamId);
            }
        } else if (destination.startsWith("/app/projects/")) {
            Long projectId = parseIdInPath(destination, "/app/projects/");
            if (projectId != null && !chatService.isUserMemberOfProjectByEmail(projectId, principal.getName())) {
                logger.warn("User {} denied sending to project {}: Not a member", principal.getName(), projectId);
                throw new AccessDeniedException("Access denied: You are not a member of this project's team");
            }
        }
    }

    private Long parseIdAfterPrefix(String path, String prefix) {
        try {
            String sub = path.substring(prefix.length());
            int slash = sub.indexOf('/');
            if (slash != -1) {
                sub = sub.substring(0, slash);
            }
            return Long.parseLong(sub);
        } catch (Exception e) {
            return null;
        }
    }

    private Long parseIdInPath(String path, String prefix) {
        try {
            String sub = path.substring(prefix.length());
            int slash = sub.indexOf('/');
            if (slash != -1) {
                sub = sub.substring(0, slash);
            }
            return Long.parseLong(sub);
        } catch (Exception e) {
            return null;
        }
    }
}
