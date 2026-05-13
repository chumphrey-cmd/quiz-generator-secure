import React from 'react';

const ExamFooterActions = ({
                               examMode,
                               currentIndex,
                               totalQuestions,
                               onPrevious,
                               onNext,
                               onReview
                           }) => {
    return (
        /* Thick top border acts as a visual separator for the footer area */
        <div className="flex justify-between items-center border-t-[3px] border-textMain pt-6 mt-8">

            {/* Next/Prev buttons ONLY show in Exam Mode */}
            {examMode === 'exam' ? (
                <div className="flex gap-4">
                    {/* PREVIOUS BUTTON
                        - disabled state: flattens the shadow and lowers opacity so it looks unclickable.
                    */}
                    <button
                        onClick={onPrevious}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 bg-container border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal-sm hover:bg-page active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px] disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {/* NEXT BUTTON
                        - Uses Primary Lime Green
                    */}
                    <button
                        onClick={onNext}
                        disabled={currentIndex === totalQuestions - 1}
                        className="px-8 py-3 bg-primary border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px] disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            ) : (
                <div>{/* Empty placeholder to keep Submit button pushed right using flex-between */}</div>
            )}

            {/* Submit / Review Summary Button
                - Uses Secondary Green to distinguish it as a final/different action type
            */}
            {(examMode === 'study' || currentIndex === totalQuestions - 1) && (
                <button
                    onClick={onReview}
                    className="px-8 py-3 bg-secondary border-[3px] border-textMain text-textMain font-black uppercase tracking-wider shadow-brutal hover:bg-primary active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    Review Summary
                </button>
            )}
        </div>
    );
};

export default ExamFooterActions;