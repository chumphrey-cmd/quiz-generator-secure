import React, { createContext, useContext, useState, useEffect } from 'react';

const AiSettingsContext = createContext();

export const AiSettingsProvider = ({ children }) => {
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Initialize from sessionStorage so settings persist through refreshes
    const [aiProvider, setAiProvider] = useState(sessionStorage.getItem('ai_provider') || 'gemini');
    const [apiKey, setApiKey] = useState(sessionStorage.getItem('ai_api_key') || '');

    // Centralized logic for saving
    const saveSettings = (provider, key) => {
        sessionStorage.setItem('ai_provider', provider);
        sessionStorage.setItem('ai_api_key', key);
        setAiProvider(provider);
        setApiKey(key);
        setShowSettingsModal(false);
    };

    const value = {
        showSettingsModal,
        setShowSettingsModal,
        aiProvider,
        apiKey,
        saveSettings
    };

    return (
        <AiSettingsContext.Provider value={value}>
            {children}
        </AiSettingsContext.Provider>
    );
};

// Custom hook so components can "tune in" easily
export const useAiSettings = () => {
    const context = useContext(AiSettingsContext);
    if (!context) {
        throw new Error("useAiSettings must be used within an AiSettingsProvider");
    }
    return context;
};