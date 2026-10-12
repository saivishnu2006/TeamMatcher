package com.aiteammatcher.dto;

import java.util.ArrayList;
import java.util.List;

public class AiChatResponse {
    private String answer;
    private List<String> suggestedFollowUps = new ArrayList<>();

    public AiChatResponse() {
    }

    public AiChatResponse(String answer, List<String> suggestedFollowUps) {
        this.answer = answer;
        this.suggestedFollowUps = suggestedFollowUps;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getSuggestedFollowUps() {
        return suggestedFollowUps;
    }

    public void setSuggestedFollowUps(List<String> suggestedFollowUps) {
        this.suggestedFollowUps = suggestedFollowUps;
    }
}
