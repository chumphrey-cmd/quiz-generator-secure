import React from 'react';

const QuizHeader = ({
                        title,
                        examMode,
                        timeLeft,
                        currentIndex,
                        totalQuestions,
                        answeredCount,
                        isGraded,
                        progressPercent
                    }) => {
    return (
        <div className="mb-8">
            {/* 1. Header Row: Title & Status Badges */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

                {/* Heavy, uppercase, tight tracking */}
                <h1 className="text-4xl font-black text-textMain uppercase tracking-tighter">
                    {title || "Assessment"}
                </h1>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Only renders if a time limit was set AND the exam isn't over */}
                    {timeLeft && !isGraded && (
                        /* Timer: Chunky red alert style */
                        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1 border-[3px] border-red-500 font-mono font-bold text-lg shadow-brutal-sm tracking-widest">
                            {timeLeft}
                        </div>
                    )}

                    {/* Locked Mode Badge: Physical tag appearance */}
                    <div className={`px-4 py-2 border-[3px] border-textMain shadow-brutal-sm font-black text-sm uppercase tracking-wider text-textMain
                        ${examMode === 'exam' ? 'bg-primary' : 'bg-secondary'}`}
                    >
                        {examMode} MODE
                    </div>
                </div>
            </div>

            {/* 2. Progress Bar Section */}
            {/* Themed Container: Thick border and solid shadow */}
            <div className="bg-container p-5 border-[3px] border-textMain shadow-brutal">

                <div className="flex justify-between text-sm md:text-base font-black text-textMain mb-3 uppercase tracking-wide">
                    <span>
                        {isGraded ? 'Final Review' : `Question ${(currentIndex || 0) + 1} of ${totalQuestions}`}
                    </span>
                    <span>
                        {answeredCount} of {totalQuestions} Answered
                    </span>
                </div>

                {/* Progress Bar: Square corners, high contrast track/fill */}
                <div className="w-full bg-page border-[3px] border-textMain h-6 relative overflow-hidden">
                    <div
                        /* The Fill: Uses our lime green, with a hard right border to look like a physical block sliding over */
                        className="bg-primary h-full transition-all duration-500 ease-out border-r-[3px] border-textMain"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default QuizHeader;