import { useState } from 'react';
import api from '../services/api';
import { useAiSettings } from '../context/AiSettingsContext';

export const useAiTutor = () => {
    const { apiKey, setShowSettingsModal } = useAiSettings();

    // --- State for Static Explanations ---
    const [aiExplanations, setAiExplanations] = useState({});
    const [loadingAiFor, setLoadingAiFor] = useState(null);
    const [aiError, setAiError] = useState(null);

    // --- State for Socratic Chat ---
    // Maps questionId to an array of messages: { 'uuid-123': [{role: 'user', content: '...'}, {role: 'model', content: '...'}] }
    const [chatHistories, setChatHistories] = useState({});
    const [isChatLoadingFor, setIsChatLoadingFor] = useState(null);

    const handleExplain = async (questionId) => {
        if (!apiKey) {
            setShowSettingsModal(true);
            return;
        }

        setLoadingAiFor(questionId);
        setAiError(null);

        try {
            const response = await api.get(`/api/questions/${questionId}/explain`);
            setAiExplanations(prev => ({
                ...prev,
                [questionId]: response.data.explanation
            }));
        } catch (error) {
            console.error("AI Error:", error);
            if (error.response?.status === 401 || error.response?.status === 400) {
                setAiError("Invalid AI Provider or API Key. Please check your settings.");
                setShowSettingsModal(true);
            } else {
                setAiError("Failed to fetch explanation. Please try again.");
            }
        } finally {
            setLoadingAiFor(null);
        }
    };

    // --- Socratic Chat Function ---
    const handleSocraticChat = async (questionId, userMessage, questionContext) => {
        if (!apiKey) {
            setShowSettingsModal(true);
            return;
        }

        const currentHistory = chatHistories[questionId] || [];

        // Frontend Guardrail: Max 10 turns (20 messages total) to protect BYOK tokens
        if (currentHistory.length >= 20) {
            setAiError("Maximum conversation limit reached for this question.");
            return;
        }

        let updatedHistory = [...currentHistory];

        // --- THE CONTEXT INJECTION ---
        // If the array is empty, this is the very first message!
        // We MUST give the AI the exact question and correct answer here, otherwise the stateless LLM has no idea what the user is asking about.
        if (updatedHistory.length === 0) {
            const systemPrompt = {
                role: "system",
                content: `You are an expert AI Socratic Tutor. 
                The user is asking follow-up questions about this specific quiz question: "${questionContext.questionText}"
                The correct answer(s) to this question are: ${questionContext.correctAnswers.join(', ')}.
                The user has already been given a basic explanation of the correct answer.
                Your goal now is to answer follow-up questions using a Socratic teaching style. 
                Do NOT give the answer away directly if they ask; instead, guide the user to understand the underlying concepts.`
            };
            // Push the system instructions to the very beginning of the chat history
            updatedHistory.push(systemPrompt);
        }

        // Append the user's actual typed message AFTER the system prompt
        const newMessage = { role: "user", content: userMessage };
        updatedHistory.push(newMessage);

        // Optimistically update the UI so the user sees their message instantly
        setChatHistories(prev => ({
            ...prev,
            [questionId]: updatedHistory
        }));

        setIsChatLoadingFor(questionId);
        setAiError(null);

        try {
            // Send the entire history array (including our new system prompt) to Spring Boot
            const response = await api.post(`/api/questions/${questionId}/chat`, {
                messages: updatedHistory
            }, {
                headers: {
                    'X-API-Key': apiKey
                }
            });

            // Append the AI's successful response
            const modelReply = { role: "model", content: response.data.reply };

            setChatHistories(prev => ({
                ...prev,
                [questionId]: [...updatedHistory, modelReply]
            }));

        } catch (error) {
            console.error("AI Chat Error:", error);
            if (error.response?.status === 401 || error.response?.status === 400) {
                // Check if the backend sent a specific error message (like token limit reached)
                setAiError(error.response?.data?.error || "Invalid AI Provider or API Key.");
                if (error.response?.status === 401) setShowSettingsModal(true);
            } else {
                setAiError("Failed to fetch tutor response. Please try again.");
            }
        } finally {
            setIsChatLoadingFor(null);
        }
    };

    return {
        // Static Exports
        aiExplanations,
        loadingAiFor,
        aiError,
        handleExplain,
        // Chat Exports
        chatHistories,
        isChatLoadingFor,
        handleSocraticChat
    };
};