package com.aiteammatcher.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AIResponseParser {

    private static final Logger logger = LoggerFactory.getLogger(AIResponseParser.class);
    private final ObjectMapper objectMapper;

    public AIResponseParser() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public String extractJsonString(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "{}";
        }

        String cleaned = rawResponse.trim();

        // Remove markdown code fences like ```json ... ``` or ``` ... ```
        if (cleaned.startsWith("```")) {
            int firstNewline = cleaned.indexOf('\n');
            if (firstNewline != -1) {
                cleaned = cleaned.substring(firstNewline + 1);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
        }

        // Search for JSON boundaries { ... } or [ ... ]
        int startBrace = cleaned.indexOf('{');
        int startBracket = cleaned.indexOf('[');
        int startIndex = -1;

        if (startBrace != -1 && startBracket != -1) {
            startIndex = Math.min(startBrace, startBracket);
        } else if (startBrace != -1) {
            startIndex = startBrace;
        } else if (startBracket != -1) {
            startIndex = startBracket;
        }

        if (startIndex != -1) {
            int endBrace = cleaned.lastIndexOf('}');
            int endBracket = cleaned.lastIndexOf(']');
            int endIndex = Math.max(endBrace, endBracket);

            if (endIndex > startIndex) {
                return cleaned.substring(startIndex, endIndex + 1).trim();
            }
        }

        return cleaned.trim();
    }

    public <T> T parse(String rawResponse, Class<T> clazz) {
        String json = extractJsonString(rawResponse);
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            logger.error("Failed to parse AI response into {}: raw='{}', error={}", clazz.getSimpleName(), rawResponse, e.getMessage());
            return null;
        }
    }

    public <T> T parseWithTypeRef(String rawResponse, TypeReference<T> typeReference) {
        String json = extractJsonString(rawResponse);
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (Exception e) {
            logger.error("Failed to parse AI response with TypeReference: raw='{}', error={}", rawResponse, e.getMessage());
            return null;
        }
    }

    public JsonNode parseTree(String rawResponse) {
        String json = extractJsonString(rawResponse);
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            logger.error("Failed to parse AI response into JsonNode: {}", e.getMessage());
            return null;
        }
    }
}
