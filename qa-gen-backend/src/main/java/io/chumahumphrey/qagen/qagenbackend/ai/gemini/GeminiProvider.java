package io.chumahumphrey.qagen.qagenbackend.ai.gemini;

import com.google.genai.Client;
import io.chumahumphrey.qagen.qagenbackend.ai.AiProvider;
import io.chumahumphrey.qagen.qagenbackend.dto.ChatMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class GeminiProvider implements AiProvider {

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public String generateExplanation(String prompt, String apiKey) {
        // 1. Build the official Google GenAI Client dynamically with the BYOK key
        Client genAiClient = Client.builder()
                .apiKey(apiKey)
                .build();

        // 2. Set up the specific model options
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model("gemini-2.5-flash-lite")
                .build();

        // 3. Build the Spring AI Chat Model wrapper
        GoogleGenAiChatModel chatModel = GoogleGenAiChatModel.builder()
                .genAiClient(genAiClient)
                .defaultOptions(options)
                .build();

        // 4. Call the model and return the generated explanation
        return chatModel.call(prompt);
    }

    @Override
    public String generateChatResponse(List<ChatMessage> incomingMessages, String apiKey) {
        // Initialize BYOK Client for this specific request
        Client genAiClient = Client.builder().apiKey(apiKey).build();

        // Add our new Socratic Tutor configurations here!
        GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder()
                .model("gemini-2.5-flash-lite")
                .temperature(0.7) // Increases creativity for conversational responses
                .maxTokens(250)   // Keeps the AI concise and protects BYOK quota
                .build();

        // Build the Spring AI Chat Model wrapper
        GoogleGenAiChatModel chatModel = GoogleGenAiChatModel.builder()
                .genAiClient(genAiClient)
                .defaultOptions(options)
                .build();

        // Map our custom DTOs into Spring AI's official Message types.
        List<Message> springAiMessages = incomingMessages.stream().map(msg -> {
            Message springMsg = switch (msg.getRole().toLowerCase()) {
                case "system" -> new SystemMessage(msg.getContent());
                case "assistant", "model" -> new AssistantMessage(msg.getContent());
                default -> new UserMessage(msg.getContent());
            };
            return springMsg;
        }).toList();

        // Wrap the messages in a Prompt and execute the call
        Prompt prompt = new Prompt(springAiMessages);
        return Objects.requireNonNull(chatModel.call(prompt).getResult()).getOutput().getText();
    }
}
