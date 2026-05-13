package io.chumahumphrey.qagen.qagenbackend.dto;

import java.util.List;

public class ChatRequestDTO {
    private List<ChatMessage> messages;

    public ChatRequestDTO() {}

    public ChatRequestDTO(List<ChatMessage> messages) {
        this.messages = messages;
    }

    public List<ChatMessage> getMessages() { return messages; }
    public void setMessages(List<ChatMessage> messages) { this.messages = messages; }
}