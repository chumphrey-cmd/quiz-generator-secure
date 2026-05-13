import React from 'react';
import QuestionNavigator from './QuestionNavigator';

const ReviewSummaryScreen = ({
                                 questions,
                                 userAnswers,
                                 flagged,
                                 jumpToQuestion,
                                 onGradeExam,
                                 isSubmitting
                             }) => {
    return (
        <div className="py-8">
            <div className="bg-container border-[3px] border-textMain p-6 md:p-10 shadow-brutal mb-10">

                <h2 className="text-4xl font-black text-textMain mb-4 text-center uppercase tracking-tighter">
                    Summary
                </h2>

                <p className="text-center font-bold text-textMain mb-10 text-lg border-b-[3px] border-textMain pb-6">
                    Click any question to review your answer before final submission.
                </p>

                {/* Nested Component! */}
                <div className="mb-10">
                    <QuestionNavigator
                        questions={questions}
                        userAnswers={userAnswers}
                        flagged={flagged}
                        jumpToQuestion={jumpToQuestion}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-base font-black text-textMain mb-10 uppercase tracking-wide">
                    <span className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-container border-[3px] border-textMain shadow-brutal-sm"></div>
                        Unanswered
                    </span>
                    <span className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary border-[3px] border-textMain shadow-brutal-sm"></div>
                        Answered
                    </span>
                    <span className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-yellow-300 border-[3px] border-textMain shadow-brutal-sm"></div>
                        Flagged
                    </span>
                </div>

                <div className="flex justify-center border-t-[3px] border-textMain pt-8">
                    <button
                        onClick={onGradeExam}
                        disabled={isSubmitting}
                        className="h-fit bg-secondary border-[3px] border-textMain text-textMain text-xl font-black uppercase tracking-wider shadow-brutal hover:bg-primary active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all w-full md:w-2/3 disabled:opacity-50 disabled:shadow-none disabled:translate-x-[4px] disabled:translate-y-[4px] disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Grading...' : 'Final Submission'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewSummaryScreen;