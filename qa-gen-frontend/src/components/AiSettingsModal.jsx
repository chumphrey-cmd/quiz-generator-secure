import React, { useState, useEffect } from 'react';
import { useAiSettings } from "../context/AiSettingsContext.jsx";
import {AI_PROVIDERS} from "../config/AiProvider.js";

const AiSettingsModal = () => {

    const {
        showSettingsModal,
        setShowSettingsModal,
        aiProvider,
        apiKey: globalApiKey,
        saveSettings
    } = useAiSettings();

    const [provider, setProvider] = useState('gemini');
    const [apiKey, setApiKey] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Add error state for validation
    const [error, setError] = useState('');

    useEffect(() => {
        if (showSettingsModal) {
            setProvider(aiProvider || 'gemini');
            setApiKey(globalApiKey || '');
            setIsDropdownOpen(false);
            setError(''); // Clear errors when modal opens
        }
    }, [showSettingsModal, aiProvider, globalApiKey]);

    // Auto-dismiss the error message after 4 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 4000); // 4000 milliseconds = 4 seconds

            // Cleanup function: clears the timer if the component closes or if a new error is triggered before the 4 seconds are up
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (!showSettingsModal) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowSettingsModal(false);
        }
    };

    // Find the current provider object so we can use its label and placeholder dynamically
    const currentProvider = AI_PROVIDERS.find(p => p.id === provider) || AI_PROVIDERS[0];

    // Validation Handler before saving
    const handleSave = () => {
        if (!apiKey || apiKey.trim() === '') {
            setError('An API Key is required to use the AI Tutor.');
            return;
        }
        setError(''); // Clear error if valid
        saveSettings(provider, apiKey);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
            onClick={handleBackdropClick}
        >
            <div className="bg-container border-[3px] border-textMain p-8 w-full max-w-md shadow-brutal">

                <div className="flex items-center gap-3 mb-6 border-b-[3px] border-textMain pb-3">
                    <h3 className="text-3xl font-black text-textMain uppercase tracking-tighter">
                        AI Tutor
                    </h3>

                    <div className="relative group flex items-center justify-center cursor-help">
                        <span className="w-7 h-7 rounded-full border-[3px] border-textMain text-textMain font-black text-sm flex items-center justify-center bg-container group-hover:bg-primary transition-colors shadow-brutal-sm">
                            i
                        </span>

                        <div className="absolute left-10 top-0 w-64 p-3 bg-container border-[3px] border-textMain shadow-brutal-sm text-sm font-bold text-textMain hidden group-hover:block z-50">
                            Select your preferred AI Provider and enter your API key. This key is securely stored in your browser's session and is wiped when you close the tab.
                        </div>
                    </div>
                </div>

                {/* Themed Error Banner */}
                {error && (
                    <div className="bg-red-100 border-[3px] border-red-500 p-3 mb-6 shadow-brutal-sm flex items-center gap-2">
                        <span className="text-red-700 font-black text-xl">!</span>
                        <p className="font-black text-red-700 uppercase text-sm">{error}</p>
                    </div>
                )}

                <div className="mb-6 relative">
                    <label className="block text-lg font-black text-textMain mb-2 uppercase">AI Provider</label>

                    <div className="relative w-full">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full text-left px-4 py-3 border-[3px] border-textMain bg-container text-textMain font-bold text-lg transition-all flex justify-between items-center
                                ${isDropdownOpen ? 'translate-x-[2px] translate-y-[2px] shadow-none' : 'shadow-brutal-sm focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none'}`}
                        >
                            {/* [UPDATE 6]: Dynamically render the selected label */}
                            <span>{currentProvider.label}</span>

                            <svg className={`w-6 h-6 inline transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m19 9-7 7-7-7"/>
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <ul className="absolute z-10 w-full bg-container border-[3px] border-textMain shadow-brutal mt-1 py-1 max-h-60 overflow-y-auto">
                                {/* [UPDATE 7]: Map over AI_PROVIDERS array instead of hardcoded <li>s */}
                                {AI_PROVIDERS.map((p, index) => (
                                    <li
                                        key={p.id}
                                        className={`px-4 py-3 hover:bg-primary text-textMain font-bold text-lg cursor-pointer transition-colors ${
                                            index > 0 ? 'border-t-[3px] border-textMain' : ''
                                        }`}
                                        onClick={() => {
                                            setProvider(p.id);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {p.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-lg font-black text-textMain mb-2 uppercase">API Key</label>
                    <input
                        type="password"
                        /* Dynamically render the placeholder based on the current selection */
                        placeholder={currentProvider.placeholder}
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            if (error) setError(''); // Clear error as user types
                        }}
                        className={`w-full h-12 px-4 border-[3px] font-mono text-lg transition-all placeholder:text-textSub placeholder:opacity-50
                            ${error ? 'border-red-500 bg-red-50 focus:border-red-600' : 'border-textMain bg-container focus:border-inputFocus'}
                            shadow-brutal-sm focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none`}
                    />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={() => setShowSettingsModal(false)}
                        className="px-6 py-3 bg-container border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal hover:bg-red-100 hover:text-red-700 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    {/* Use the custom handleSave function instead of direct saveSettings */}
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-primary border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiSettingsModal;