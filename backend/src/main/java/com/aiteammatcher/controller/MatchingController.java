package com.aiteammatcher.controller;

import com.aiteammatcher.dto.MatchCandidateDto;
import com.aiteammatcher.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /**
     * Level 1: Normal Rule-based matching
     */
    @GetMapping("/matches")
    public ResponseEntity<List<MatchCandidateDto>> getRuleMatches(@PathVariable Long projectId) {
        return ResponseEntity.ok(matchingService.getRuleBasedMatches(projectId));
    }

    /**
     * Level 2 & Hybrid: AI Recommended Teammates (Rule 60% + AI 40%)
     */
    @GetMapping("/ai-matches")
    public ResponseEntity<List<MatchCandidateDto>> getAiMatches(@PathVariable Long projectId) {
        return ResponseEntity.ok(matchingService.getAiHybridMatches(projectId));
    }
}
