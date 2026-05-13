import { useState } from 'react';

export default function QuizConfigModal({ isOpen, onClose, onStart }) {
    // 1. The modal manages its own temporary form state
    const [mode, setMode] = useState('exam');
    const [timeLimit, setTimeLimit] = useState(30); // Default to 30 minutes

    // NEW STATE: A toggle to explicitly turn the timer on/off instead of entering "0"
    const [hasTimeLimit, setHasTimeLimit] = useState(true);

    // If the modal isn't supposed to be open, render nothing
    if (!isOpen) return null;

    const handleStartClick = () => {
        // Pass the final configuration back to the parent component.
        // If mode is study, or if the user unchecked the timer toggle, we pass 0.
        onStart({
            mode: mode,
            timeLimit: (mode === 'exam' && hasTimeLimit) ? Number(timeLimit) : 0
        });
    };

    // FEATURE 1: Click-outside to close.
    // We check if the element clicked was the exact background div, NOT its children.
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        /* The Backdrop: Uses a semi-transparent black overlay.
           We attach handleBackdropClick here to allow clicking outside to close. */
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
            onClick={handleBackdropClick}
        >
            {/* The Modal Container: Brutalist styling with thick borders and a solid shadow */}
            <div className="bg-container border-[3px] border-textMain p-8 w-full max-w-md shadow-brutal">

                <h2 className="text-3xl font-black text-textMain mb-6 uppercase tracking-tighter border-b-[3px] border-textMain pb-2">
                    Setup
                </h2>

                {/* Mode Selection */}
                <div className="mb-8">
                    <label className="block text-lg font-black text-textMain mb-3 uppercase">Select Mode</label>
                    <div className="flex gap-4">

                        <label className={`w-full h-full flex-1 flex items-center justify-center cursor-pointer border-[3px] border-textMain py-1 transition-all shadow-brutal-sm text-lg font-bold
                            ${mode === 'exam' ? 'bg-primary translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-container hover:bg-page'}`}>

                            {/* Hide the actual HTML radio input */}
                            <input
                                type="radio"
                                name="mode"
                                value="exam"
                                className="hidden"
                                checked={mode === 'exam'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            EXAM
                        </label>

                        {/* BRUTALIST RADIO BUTTON 2: STUDY */}
                        <label className={`w-full h-full flex-1 flex items-center justify-center gap-2 cursor-pointer border-[3px] border-textMain py-1 transition-all shadow-brutal-sm text-lg font-bold
                            ${mode === 'study' ? 'bg-secondary translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-container hover:bg-page'}`}>
                            <input
                                type="radio"
                                name="mode"
                                value="study"
                                className="hidden"
                                checked={mode === 'study'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            STUDY
                        </label>
                    </div>
                </div>

                {/* FEATURE 2: Hide the Time Limit section completely if 'study' is selected. */}
                {mode === 'exam' && (
                    <div className="mb-8 border-[3px] border-textMain p-4 bg-page">
                        <label className="block text-lg font-black text-textMain mb-4 uppercase">Time Limit</label>

                        {/* FEATURE 3: Brutalist Checkbox Toggle instead of entering "0" */}
                        <label className="flex items-center gap-3 cursor-pointer mb-4 font-bold text-textMain">
                            {/* Custom Checkbox Square */}
                            <div className={`w-7 h-7 border-[3px] border-textMain flex items-center justify-center transition-colors ${hasTimeLimit ? 'bg-primary' : 'bg-container'}`}>
                                {hasTimeLimit && <span className="text-textMain font-black text-xl leading-none -mt-1">✓</span>}
                            </div>

                            {/* Hidden HTML Checkbox */}
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={hasTimeLimit}
                                onChange={(e) => setHasTimeLimit(e.target.checked)}
                            />
                            <span className="text-lg">Enable Timer</span>
                        </label>

                        {/* Only show the number input if the timer is actually enabled */}
                        {hasTimeLimit && (
                            <div className="flex items-center gap-3 mt-4">
                                <input
                                    type="number"
                                    min="1"
                                    className="w-20 h-12 px-3 border-[3px] border-textMain bg-container text-textMain font-black text-xl shadow-brutal-sm focus:outline-none focus:border-inputFocus focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value)}
                                />
                                <span className="font-bold text-textSub uppercase">Minutes</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end gap-4 mt-8">
                    {/* Cancel Button: Styled to look distinctly different from the primary action */}
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-container border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal hover:bg-red-100 hover:text-red-700 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        Cancel
                    </button>
                    {/* Begin Button: Uses the lime green primary color */}
                    <button
                        onClick={handleStartClick}
                        className="px-8 py-3 bg-primary border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        Begin
                    </button>
                </div>
            </div>
        </div>
    );
}