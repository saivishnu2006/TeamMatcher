package com.aiteammatcher.controller;

import com.aiteammatcher.dto.*;
import com.aiteammatcher.entity.User;
import com.aiteammatcher.repository.UserRepository;
import com.aiteammatcher.security.UserPrincipal;
import com.aiteammatcher.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    public ProfileController(ProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.getProfileByUser(user));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ProfileDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProfileUpdateRequest request) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.updateProfile(user, request));
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillDto>> getAllSkills() {
        return ResponseEntity.ok(profileService.getAllSkills());
    }

    @PostMapping("/profile/skills")
    public ResponseEntity<ProfileDto> addSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserSkillAddRequest request) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.addSkill(user, request));
    }

    @DeleteMapping("/profile/skills/{id}")
    public ResponseEntity<ProfileDto> removeSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(profileService.removeSkill(user, id));
    }

    @GetMapping("/interests")
    public ResponseEntity<List<InterestDto>> getAllInterests() {
        return ResponseEntity.ok(profileService.getAllInterests());
    }
}
