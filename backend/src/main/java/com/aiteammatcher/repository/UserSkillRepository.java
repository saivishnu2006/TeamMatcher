package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Profile;
import com.aiteammatcher.entity.Skill;
import com.aiteammatcher.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByProfile(Profile profile);
    Optional<UserSkill> findByProfileAndSkill(Profile profile, Skill skill);
    void deleteByProfileAndSkill(Profile profile, Skill skill);
}
