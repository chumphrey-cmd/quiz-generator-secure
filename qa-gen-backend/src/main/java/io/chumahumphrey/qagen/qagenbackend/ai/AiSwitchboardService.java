package io.chumahumphrey.qagen.qagenbackend.ai;

import io.chumahumphrey.qagen.qagenbackend.dto.ChatMessage;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AiSwitchboardService {

    // Spring automatically injects every @Component that implements AiProvider here
    private final List<AiProvider> providers;

    public AiSwitchboardService(List<AiProvider> providers) {
        this.providers = providers;
    }

    /**
     * Routes the AI request to the correct provider dynamically.
     *
     * @param prompt       The formatted question/context for the LLM.
     * @param providerName The name of the provider (e.g., "openai", "gemini").
     * @param apiKey       The user's specific API key for that provider.
     * @return The AI-generated explanation.
     */
    public String explain(String prompt, String providerName, String apiKey) {
        // 1. Find the matching provider based on the name from the frontend
        AiProvider selectedProvider = providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported AI Provider: " + providerName));

        // 2. Route the request to that specific implementation
        return selectedProvider.generateExplanation(prompt, apiKey);
    }

    /**
     * Routes the conversational AI request to the correct provider.
     * Because 'providers' is populated via Spring Dependency Injection,
     * this method never needs to change, even if you add 10 new AI models!
     */
    public String chat(List<ChatMessage> messages, String providerName, String apiKey) {
        AiProvider selectedProvider = providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported AI Provider: " + providerName));

        return selectedProvider.generateChatResponse(messages, apiKey);
    }
}