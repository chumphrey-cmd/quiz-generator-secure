import React, {useEffect, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';

const QuestionCard = ({
                          q,
                          displayNumber,
                          examMode,
                          currentSelections = [],
                          isFlagged,
                          isAiLoading,
                          aiExplanation,
                          onOptionSelect,
                          onToggleFlag,
                          onExplain,
                          chatHistory = [],
                          isChatLoading = false,
                          onSendChatMessage
                      }) => {
    // Calculate if it's a multi-select question for this specific card
    const isMulti = q.correctAnswers.length > 1;

    // Removes any leading numbers and periods (e.g., "1. What is..." becomes "What is...")
    const cleanQuestionText = q.questionText.replace(/^\d+\.\s*/, '');

    // Toggle for the Socratic Chat
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        // Because 'q' is a prop passed down to this card, it contains the full database record (q.questionText and q.correctAnswers) that the hook needs to build the context.
        onSendChatMessage(q.id, chatInput, q);
        setChatInput(""); // Clear input after sending
    };

    return (
        <div id={`question-${q.id}`} className="bg-transparent py-4 md:py-8 mb-8 transition-colors">
            
            {/* Top Question Header and Flag */}
            <div className="flex justify-between items-start mb-6 border-b-[3px] border-textMain pb-4">
                <h2 className="text-2xl font-black text-textMain">
                    {displayNumber}. {cleanQuestionText}
                </h2>
                <button
                    onClick={() => onToggleFlag(q.id)}
                    className={`p-2 border-[3px] border-textMain font-black text-lg shadow-brutal-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${isFlagged ? 'bg-yellow-300 text-textMain' : 'bg-container hover:bg-page'}`}
                    title="Flag for review"
                >
                    {isFlagged ? 'FLAGGED' : 'FLAG'}
                </button>
            </div>

            {isMulti && <p className="w-fit ml-4 mb-6 bg-secondary border-[3px] border-textMain shadow-brutal-sm px-3 py-1 font-black text-xs uppercase tracking-widest text-textMain"> (Select all that apply)</p>}

            {/* The Multiple Choice Options */}
            <div className="space-y-3 mb-4">
                {q.options.map((option, idx) => {
                    const isSelected = currentSelections.includes(option);

                    return (
                        <label
                            key={idx}
                            // Added 'cursor-pointer' so the user knows the whole block is clickable
                            className={`cursor-pointer w-full text-left p-4 border-[3px] border-textMain font-bold text-lg flex items-center transition-all 
                            ${isSelected
                                ? 'bg-primary translate-x-[2px] translate-y-[2px] shadow-none'
                                : 'bg-container shadow-brutal-sm hover:bg-page active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                            }`}
                        >
                            {/* Input here is hidden visually, but keeps the logic perfectly intact */}
                            <input
                                type={isMulti ? "checkbox" : "radio"}
                                name={`question-${q.id}`}
                                value={option}
                                checked={isSelected}
                                onChange={() => onOptionSelect(q.id, option, isMulti)}
                                className="sr-only"
                            />

                            {/* 2. Visual Box/Circle */}
                            <div className={`
                            mr-4 flex items-center justify-center shrink-0 border-[3px] border-textMain transition-colors
                            ${isMulti ? 'w-4 h-4' : 'w-4 h-4 rounded-full'} 
                            ${isSelected ? 'bg-textMain' : 'bg-container'}
                        `}>
                                {/* The "Check" or "Dot" that appears when selected */}
                                {isSelected && (
                                    isMulti
                                        ? <span className="text-page font-black text-xl leading-none -mt-1"></span>
                                        : <div className="w-2 h-2 bg-page rounded-full"></div>
                                )}
                            </div>

                            {/* 3. The Option Text */}
                            <span className="text-textMain">{option}</span>
                        </label>
                    );
                })}
            </div>

            {/* AI Explain Button */}
            {examMode === 'study' && (
                <div className="border-t-[3px] border-textMain pt-6 mt-6">
                    {!aiExplanation ? (
                        <button
                            onClick={() => onExplain(q.id)}
                            disabled={isAiLoading}
                            // Retained your exact button styling, just added a disabled state so it visually flattens when loading
                            className="w-full py-4 bg-secondary border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal-sm hover:bg-primary active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px] disabled:cursor-not-allowed"
                        >
                            {isAiLoading ? 'Analyzing...' : 'Explain with AI'}
                        </button>
                    ) : (

                        <div className="bg-gray-300 border-[3px] border-textMain shadow-brutal p-5 mt-2">

                            {/* Header with thick bottom border separator */}
                            <div className="flex justify-between items-center mb-4 border-b-[3px] border-textMain pb-3">
                                <h4 className="font-black text-xl text-textMain uppercase flex items-center gap-2">
                                    Explanation
                                </h4>
                            </div>

                            {/* Markdown text converted to heavy, bold text rather than soft gray prose */}
                            <div className="text-textMain text-base leading-relaxed">
                                <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                            </div>

                            {/* Phase 8: Discuss Further Toggle */}
                            <div className="mt-6 pt-4 border-t-[3px] border-textMain flex justify-end">
                                {/* Toggle button */}
                                <button
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    className="px-6 py-2 bg-page border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal-sm hover:bg-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    {isChatOpen ? 'Hide Discussion' : 'Discuss Further'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Phase 8: The Socratic Chat Interface */}
            {isChatOpen && aiExplanation && (
                <div className="border-[3px] border-textMain shadow-brutal-sm bg-container mt-4 flex flex-col overflow-hidden">

                    {/* Chat History Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory
                            .filter(msg => msg.role !== 'system')
                            .map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-3 border-[3px] border-textMain shadow-brutal-sm max-w-[85%] font-bold ${
                                        msg.role === 'user'
                                            ? 'bg-primary self-end'
                                            : 'bg-container self-start'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            ))}

                        {/* Floating Dots Loading Indicator */}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-container border-[3px] border-textMain p-3 shadow-brutal-sm self-start font-black uppercase flex items-center gap-2">
                                    <div className="w-2 h-2 bg-textMain animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-textMain animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-textMain animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>


                            </div>
                        )}
                    </div>

                    {/* Chat Input Box */}
                    <div className="p-3 bg-white border-t border-gray-200 rounded-b-lg shrink-0">
                        <form onSubmit={handleChatSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isChatLoading}
                                placeholder="Ask a follow-up question..."
                                className="flex-1 border-[3px] border-textMain px-4 py-2 font-bold text-sm shadow-brutal-sm focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all disabled:opacity-50 disabled:bg-page text-textMain"
                            />
                            <button
                                type="submit"
                                disabled={isChatLoading || !chatInput.trim()}
                                className="bg-textMain text-white border-[3px] border-textMain px-6 py-2 font-black uppercase tracking-wider shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionCard;