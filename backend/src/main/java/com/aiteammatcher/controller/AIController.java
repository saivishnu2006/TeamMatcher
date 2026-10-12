package com.aiteammatcher.controller;

import com.aiteammatcher.dto.*;
import com.aiteammatcher.service.AIOrchestrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIOrchestrationService aiOrchestrationService;

    public AIController(AIOrchestrationService aiOrchestrationService) {
        this.aiOrchestrationService = aiOrchestrationService;
    }

    @PostMapping("/analyze-project")
    public ResponseEntity<AiProjectAnalysisResponse> analyzeProject(@RequestBody AiProjectAnalysisRequest request) {
        return ResponseEntity.ok(aiOrchestrationService.analyzeProject(request));
    }

    @PostMapping("/analyze-profile")
    public ResponseEntity<AiProfileAnalysisResponse> analyzeProfile(@RequestBody AiProfileAnalysisRequest request) {
        return ResponseEntity.ok(aiOrchestrationService.analyzeProfile(request));
    }

    @PostMapping("/build-team")
    public ResponseEntity<AiTeamBuildResponse> buildTeam(@RequestBody AiTeamBuildRequest request) {
        return ResponseEntity.ok(aiOrchestrationService.buildTeam(request));
    }

    @PostMapping("/analyze-team")
    public ResponseEntity<AiTeamAnalysisResponse> analyzeTeam(@RequestBody Map<String, Long> payload) {
        Long projectId = payload.get("projectId");
        return ResponseEntity.ok(aiOrchestrationService.analyzeTeam(projectId));
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiOrchestrationService.chat(request));
    }
}
