package com.aiteammatcher.repository;

import com.aiteammatcher.entity.Interest;
import com.aiteammatcher.entity.Profile;
import com.aiteammatcher.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    List<UserInterest> findByProfile(Profile profile);
    Optional<UserInterest> findByProfileAndInterest(Profile profile, Interest interest);
    void deleteByProfileAndInterest(Profile profile, Interest interest);
}
