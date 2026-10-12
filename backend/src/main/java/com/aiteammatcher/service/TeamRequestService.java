package com.aiteammatcher.service;

import com.aiteammatcher.dto.JoinRequestDto;
import com.aiteammatcher.dto.TeamRequestCreateDto;
import com.aiteammatcher.dto.TeamRequestResponseDto;
import com.aiteammatcher.dto.UserProjectStatusDto;
import com.aiteammatcher.entity.*;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ConflictException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.exception.UnauthorizedException;
import com.aiteammatcher.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamRequestService {

    private final TeamRequestRepository teamRequestRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamService teamService;

    public TeamRequestService(
            TeamRequestRepository teamRequestRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            TeamRepository teamRepository,
            TeamService teamService) {
        this.teamRequestRepository = teamRequestRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.teamService = teamService;
    }

    @Transactional
    public TeamRequestResponseDto sendInvite(User sender, TeamRequestCreateDto dto) {
        if (dto.getProjectId() == null) {
            throw new BadRequestException("Project ID is required");
        }
        if (dto.getReceiverId() == null) {
            throw new BadRequestException("Receiver user ID is required");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        // Check sender authority (must be owner or admin)
        if (!project.getOwner().getId().equals(sender.getId()) && !"ROLE_ADMIN".equals(sender.getRole())) {
            throw new UnauthorizedException("Only the project owner can invite teammates");
        }

        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found with id: " + dto.getReceiverId()));

        // Prevent self-invitation
        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("You cannot invite yourself to your own project");
        }

        Team team = teamRepository.findByProject(project)
                .orElseGet(() -> teamRepository.save(new Team(project, project.getName() + " Team")));

        // Prevent full team invitations
        if (team.getMembers().size() >= project.getTeamSize()) {
            throw new BadRequestException("This team is already full (maximum size: " + project.getTeamSize() + ")");
        }

        // Prevent duplicate team membership
        boolean isAlreadyMember = team.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(receiver.getId()));
        if (isAlreadyMember) {
            throw new ConflictException("User is already a member of this project team");
        }

        // Prevent duplicate pending invitations
        if (teamRequestRepository.existsByProjectAndReceiverAndStatus(project, receiver, "PENDING")) {
            throw new ConflictException("An invitation to this user is already pending");
        }

        TeamRequest request = new TeamRequest(
                sender,
                receiver,
                project,
                dto.getMessage() != null && !dto.getMessage().isBlank() ?
                        dto.getMessage() :
                        "Hi " + receiver.getFullName() + ", you are invited to join the team for " + project.getName() + "!",
                "INVITATION"
        );

        TeamRequest saved = teamRequestRepository.save(request);
        return toDto(saved);
    }

    @Transactional
    public TeamRequestResponseDto sendJoinRequest(User candidate, Long projectId, JoinRequestDto dto) {
        if (projectId == null) {
            throw new BadRequestException("Project ID is required");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (project.getOwner().getId().equals(candidate.getId())) {
            throw new BadRequestException("You are the owner of this project");
        }

        Team team = teamRepository.findByProject(project)
                .orElseGet(() -> teamRepository.save(new Team(project, project.getName() + " Team")));

        if (team.getMembers().size() >= project.getTeamSize()) {
            throw new BadRequestException("This project team is already full (maximum size: " + project.getTeamSize() + ")");
        }

        boolean isAlreadyMember = team.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(candidate.getId()));
        if (isAlreadyMember) {
            throw new ConflictException("You are already a member of this project team");
        }

        if (teamRequestRepository.existsByProjectAndSenderAndStatus(project, candidate, "PENDING")) {
            throw new ConflictException("You already have a pending join request for this project");
        }

        if (teamRequestRepository.existsByProjectAndReceiverAndStatus(project, candidate, "PENDING")) {
            throw new ConflictException("You have an existing pending invitation to join this project. Please accept the invitation instead.");
        }

        String roleStr = (dto != null && dto.getPreferredRole() != null && !dto.getPreferredRole().isBlank())
                ? dto.getPreferredRole().trim()
                : (candidate.getProfile() != null && candidate.getProfile().getPreferredRole() != null ? candidate.getProfile().getPreferredRole() : "Teammate");

        String msg = (dto != null && dto.getMessage() != null && !dto.getMessage().isBlank())
                ? dto.getMessage().trim()
                : "Hello " + project.getOwner().getFullName() + ", I would like to join " + project.getName() + " as a " + roleStr + ".";

        TeamRequest request = new TeamRequest(
                candidate,
                project.getOwner(),
                project,
                msg,
                "JOIN_REQUEST"
        );

        TeamRequest saved = teamRequestRepository.save(request);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public UserProjectStatusDto getUserProjectStatus(User user, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        boolean isOwner = project.getOwner().getId().equals(user.getId());

        Team team = teamRepository.findByProject(project).orElse(null);
        int currentSize = (team != null) ? team.getMembers().size() : 0;
        boolean isMember = (team != null) && team.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()));
        boolean isFull = currentSize >= project.getTeamSize();

        Optional<TeamRequest> pendingJoin = teamRequestRepository.findByProjectAndSenderAndStatus(project, user, "PENDING");
        Optional<TeamRequest> pendingInvite = teamRequestRepository.findByProjectAndReceiverAndStatus(project, user, "PENDING");

        boolean hasPending = false;
        Long pendingRequestId = null;
        String requestType = null;

        if (pendingJoin.isPresent()) {
            hasPending = true;
            pendingRequestId = pendingJoin.get().getId();
            requestType = "JOIN_REQUEST";
        } else if (pendingInvite.isPresent()) {
            hasPending = true;
            pendingRequestId = pendingInvite.get().getId();
            requestType = "INVITATION";
        }

        return new UserProjectStatusDto(isOwner, isMember, hasPending, pendingRequestId, requestType, isFull);
    }

    @Transactional(readOnly = true)
    public List<TeamRequestResponseDto> getReceivedRequests(User user) {
        return teamRequestRepository.findByReceiverOrderByCreatedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamRequestResponseDto> getSentRequests(User user) {
        return teamRequestRepository.findBySenderOrderByCreatedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamRequestResponseDto acceptRequest(Long requestId, User user) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Team request not found with id: " + requestId));

        if (!request.getReceiver().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to accept this request");
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("This request is already " + request.getStatus().toLowerCase());
        }

        Project project = request.getProject();
        Team team = teamRepository.findByProject(project)
                .orElseGet(() -> teamRepository.save(new Team(project, project.getName() + " Team")));

        // Determine who joins the team:
        // INVITATION: Receiver was invited by project owner -> Receiver joins team.
        // JOIN_REQUEST: Sender applied to project -> Project owner accepts -> Sender joins team.
        User joiningUser = "JOIN_REQUEST".equalsIgnoreCase(request.getRequestType())
                ? request.getSender()
                : request.getReceiver();

        String preferredRole = joiningUser.getProfile() != null && joiningUser.getProfile().getPreferredRole() != null ?
                joiningUser.getProfile().getPreferredRole() : "Member";

        // Add member to team (checks capacity and uniqueness)
        teamService.addMember(team, joiningUser, preferredRole);

        request.setStatus("ACCEPTED");
        TeamRequest saved = teamRequestRepository.save(request);
        return toDto(saved);
    }

    @Transactional
    public TeamRequestResponseDto rejectRequest(Long requestId, User user) {
        TeamRequest request = teamRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Team request not found with id: " + requestId));

        if (!request.getReceiver().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to respond to this request");
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("This request is already " + request.getStatus().toLowerCase());
        }

        request.setStatus("REJECTED");
        TeamRequest saved = teamRequestRepository.save(request);
        return toDto(saved);
    }

    private TeamRequestResponseDto toDto(TeamRequest tr) {
        TeamRequestResponseDto dto = new TeamRequestResponseDto();
        dto.setId(tr.getId());
        dto.setSenderId(tr.getSender().getId());
        dto.setSenderName(tr.getSender().getFullName());
        dto.setSenderEmail(tr.getSender().getEmail());
        if (tr.getSender().getProfile() != null) {
            dto.setSenderRole(tr.getSender().getProfile().getPreferredRole());
        }
        dto.setReceiverId(tr.getReceiver().getId());
        dto.setReceiverName(tr.getReceiver().getFullName());
        dto.setReceiverEmail(tr.getReceiver().getEmail());
        if (tr.getReceiver().getProfile() != null) {
            dto.setReceiverRole(tr.getReceiver().getProfile().getPreferredRole());
        }
        dto.setProjectId(tr.getProject().getId());
        dto.setProjectName(tr.getProject().getName());
        dto.setMessage(tr.getMessage());
        dto.setStatus(tr.getStatus());
        dto.setRequestType(tr.getRequestType());
        dto.setCreatedAt(tr.getCreatedAt());
        dto.setUpdatedAt(tr.getUpdatedAt());
        return dto;
    }
}
