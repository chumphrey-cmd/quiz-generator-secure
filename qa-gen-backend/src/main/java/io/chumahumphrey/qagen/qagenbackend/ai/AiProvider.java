package io.chumahumphrey.qagen.qagenbackend.ai;

import io.chumahumphrey.qagen.qagenbackend.dto.ChatMessage;

/**
 * The core contract for all AI integrations.
 * Any new AI model or library must implement this interface.
 */
public interface AiProvider {

    /**
     * Identifies the provider for our Switchboard routing.
     * * @return A standard string identifier (e.g., "openai", "gemini", "ollama")
     */
    String getProviderName();

    /**
     * Generates a static educational explanation for a given prompt.
     * Because we are using a BYOK (Bring Your Own Key) model, the API key
     * is passed dynamically per request rather than stored in application properties.
     *
     * @param prompt The formatted question and context for the LLM.
     * @param apiKey The specific API key provided by the user in the frontend.
     * @return The AI-generated explanation.
     */
    String generateExplanation(String prompt, String apiKey);

    /**
     * Generates a conversational response based on a history of messages.
     *
     * @param messages The history of the conversation (System, User, and Model messages).
     * @param apiKey The specific API key provided by the user.
     * @return The AI-generated chat response.
     */
    String generateChatResponse(java.util.List<ChatMessage> messages, String apiKey);
}