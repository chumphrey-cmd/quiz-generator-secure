package io.chumahumphrey.qagen.qagenbackend.ai.openai;

import io.chumahumphrey.qagen.qagenbackend.ai.AiProvider;
import io.chumahumphrey.qagen.qagenbackend.dto.ChatMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class OpenAiProvider implements AiProvider {

    @Override
    public String getProviderName() {
        return "openai";
    }

    @Override
    public String generateExplanation(String prompt, String apiKey) {
        // 1. Pass the dynamic BYOK key into the new Options builder
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .apiKey(apiKey)
                .model("gpt-4o-2024-08-06")
                .build();

        // 2. Build the model. It automatically sets up the official OpenAI client using your options.
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .options(options)
                .build();

        // 3. Call the model and return the static explanation
        return chatModel.call(prompt);
    }

    @Override
    public String generateChatResponse(List<ChatMessage> incomingMessages, String apiKey) {
        // 1. Pass the dynamic BYOK key into the Options builder for this specific request
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .apiKey(apiKey)
                .model("gpt-4o-2024-08-06")
                .temperature(0.7)        // Creativity
                .maxTokens(250)          // Forces concise, Socratic questions
                .frequencyPenalty(0.5)   // Prevents repetitive "robot" phrasing
                .build();

        // 2. Build the model. Spring AI handles the raw REST calls to OpenAI natively.
        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .options(options)
                .build();

        // 3. Map DTOs to Spring AI Messages, explicitly defining the Message interface
        List<Message> springAiMessages = incomingMessages.stream().map(msg -> {
            Message springMsg = switch (msg.getRole().toLowerCase()) {
                case "system" -> new SystemMessage(msg.getContent());
                case "assistant", "model" -> new AssistantMessage(msg.getContent());
                default -> new UserMessage(msg.getContent());
            };
            return springMsg;
        }).toList();

        // 4. Wrap the formatted conversation history in a Prompt object
        Prompt prompt = new Prompt(springAiMessages);

        return Objects.requireNonNull(chatModel.call(prompt).getResult()).getOutput().getText();
    }
}