import React from 'react';

const ResultsScreen = ({ finalScore, onReturnHome }) => {
    return (
        <div className="py-12 text-center bg-container border-[3px] border-textMain shadow-brutal p-8 mb-8 mt-4 transition-all">

            <h2 className="text-2xl md:text-5xl font-black text-textMain uppercase mb-8 border-b-[3px] border-textMain pb-6">
                Exam Complete!
            </h2>

            {/* Score block styled as a physical ticket/stamp */}
            <div className="text-3xl md:text-4xl font-black text-textMain mb-12 uppercase bg-page inline-block px-8 py-4 border-[3px] border-textMain shadow-brutal-sm">
                Final Score: <span className={finalScore >= 80 ? "text-green-600" : finalScore >= 60 ? "text-yellow-600" : "text-red-600"}>{finalScore}%</span>
            </div>

            <div>
                <button
                    onClick={onReturnHome}
                    className="px-10 py-5 bg-primary border-[3px] border-textMain text-textMain font-black text-xl uppercase tracking-wider shadow-brutal hover:bg-secondary active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ResultsScreen;