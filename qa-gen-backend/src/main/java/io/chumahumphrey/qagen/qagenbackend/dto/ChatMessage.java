package io.chumahumphrey.qagen.qagenbackend.dto;

/**
 * Represents a single message in a conversational AI chat.
 * This class maps directly to the JSON objects sent from the React frontend.
 */
public class ChatMessage {
    // The role of the speaker: "user", "model" (or "assistant"), or "system"
    private String role;
    // The actual text content of the message
    private String content;

    public ChatMessage() {}

    public ChatMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}