import React from 'react';

const QuestionNavigator = ({ questions, userAnswers, flagged, jumpToQuestion }) => {
    return (
        /* The thick frame around the navigator grid */
        <div className="mb-10 p-6 bg-container border-[3px] border-textMain shadow-brutal max-h-96 overflow-y-auto">

            <h3 className="font-black text-xl text-textMain uppercase mb-6 tracking-tighter border-b-[3px] border-textMain pb-2">
                Question Map
            </h3>

            <div className="flex flex-wrap justify-start gap-3 md:gap-4">
                {questions.map((q, idx) => {
                    // Determine the state of each question for styling
                    const isAnswered = (userAnswers[q.id] || []).length > 0;
                    const isFlagged = flagged.has(q.id);

                    return (
                        <button
                            key={q.id}
                            onClick={() => jumpToQuestion(idx)}
                            /* The Grid Buttons:
                               - Base: 3px borders, solid shadow, physical translation on click.
                               - State logic: Overrides colors based on Answered / Flagged status.
                            */
                            className={`
                                w-12 h-12 md:w-14 md:h-14 border-[3px] border-textMain font-black text-xl flex items-center justify-center transition-all shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${isFlagged
                                ? 'bg-yellow-300 hover:bg-yellow-400 text-textMain'
                                : isAnswered
                                    ? 'bg-primary hover:bg-secondary text-textMain'
                                    : 'bg-container hover:bg-page text-textMain'}
                            `}
                            title={isFlagged ? `Question ${idx + 1} (Flagged)` : `Question ${idx + 1}`}
                        >
                            {isFlagged ? '' : idx + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionNavigator;