package com.aiteammatcher.service;

import com.aiteammatcher.dto.*;
import com.aiteammatcher.entity.*;
import com.aiteammatcher.exception.BadRequestException;
import com.aiteammatcher.exception.ResourceNotFoundException;
import com.aiteammatcher.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final InterestRepository interestRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserRepository userRepository;

    public ProfileService(
            ProfileRepository profileRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            InterestRepository interestRepository,
            UserInterestRepository userInterestRepository,
            UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.interestRepository = interestRepository;
        this.userInterestRepository = userInterestRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfileByUser(User user) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile p = new Profile(user);
                    return profileRepository.save(p);
                });

        return toDto(profile, user);
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user id: " + userId));

        return toDto(profile, user);
    }

    @Transactional
    public ProfileDto updateProfile(User user, ProfileUpdateRequest request) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> new Profile(user));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
            userRepository.save(user);
        }

        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getPreferredRole() != null) profile.setPreferredRole(request.getPreferredRole());
        if (request.getExperienceLevel() != null) profile.setExperienceLevel(request.getExperienceLevel());
        if (request.getAvailability() != null) profile.setAvailability(request.getAvailability());
        if (request.getPreviousProjects() != null) profile.setPreviousProjects(request.getPreviousProjects());

        // Update interests if provided
        if (request.getInterests() != null) {
            profile.getUserInterests().clear();
            for (String interestName : request.getInterests()) {
                if (interestName != null && !interestName.isBlank()) {
                    String trimmed = interestName.trim();
                    Interest interest = interestRepository.findByNameIgnoreCase(trimmed)
                            .orElseGet(() -> interestRepository.save(new Interest(trimmed)));
                    UserInterest ui = new UserInterest(profile, interest);
                    profile.getUserInterests().add(ui);
                }
            }
        }

        Profile saved = profileRepository.save(profile);
        return toDto(saved, user);
    }

    @Transactional
    public ProfileDto addSkill(User user, UserSkillAddRequest request) {
        if (request.getSkillName() == null || request.getSkillName().isBlank()) {
            throw new BadRequestException("Skill name is required");
        }

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> profileRepository.save(new Profile(user)));

        String skillName = request.getSkillName().trim();
        Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                .orElseGet(() -> skillRepository.save(new Skill(skillName, request.getCategory() != null ? request.getCategory() : "General")));

        boolean alreadyHas = profile.getUserSkills().stream()
                .anyMatch(us -> us.getSkill().getId().equals(skill.getId()));

        if (alreadyHas) {
            // Update proficiency
            profile.getUserSkills().stream()
                    .filter(us -> us.getSkill().getId().equals(skill.getId()))
                    .findFirst()
                    .ifPresent(us -> us.setProficiencyLevel(request.getProficiencyLevel() != null ? request.getProficiencyLevel() : "Intermediate"));
        } else {
            UserSkill userSkill = new UserSkill(
                    profile,
                    skill,
                    request.getProficiencyLevel() != null ? request.getProficiencyLevel() : "Intermediate"
            );
            profile.getUserSkills().add(userSkill);
        }

        Profile saved = profileRepository.save(profile);
        return toDto(saved, user);
    }

    @Transactional
    public ProfileDto removeSkill(User user, Long skillId) {
        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.getUserSkills().removeIf(us -> us.getSkill().getId().equals(skillId));
        Profile saved = profileRepository.save(profile);
        return toDto(saved, user);
    }

    @Transactional(readOnly = true)
    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(s -> new SkillDto(s.getId(), s.getName(), s.getCategory(), null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterestDto> getAllInterests() {
        return interestRepository.findAll().stream()
                .map(i -> new InterestDto(i.getId(), i.getName()))
                .collect(Collectors.toList());
    }

    private ProfileDto toDto(Profile profile, User user) {
        ProfileDto dto = new ProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setBio(profile.getBio());
        dto.setPreferredRole(profile.getPreferredRole());
        dto.setExperienceLevel(profile.getExperienceLevel());
        dto.setAvailability(profile.getAvailability());
        dto.setPreviousProjects(profile.getPreviousProjects());

        List<SkillDto> skills = profile.getUserSkills().stream()
                .map(us -> new SkillDto(
                        us.getSkill().getId(),
                        us.getSkill().getName(),
                        us.getSkill().getCategory(),
                        us.getProficiencyLevel()
                ))
                .collect(Collectors.toList());
        dto.setSkills(skills);

        List<InterestDto> interests = profile.getUserInterests().stream()
                .map(ui -> new InterestDto(ui.getInterest().getId(), ui.getInterest().getName()))
                .collect(Collectors.toList());
        dto.setInterests(interests);

        return dto;
    }
}
