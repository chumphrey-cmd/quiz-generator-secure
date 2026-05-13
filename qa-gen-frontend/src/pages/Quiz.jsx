import {useEffect, useState} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { useQuizData } from "../hooks/useQuizData.js";
import { useAiTutor } from '../hooks/useAiTutor.js';
import { useQuizEngine } from "../hooks/useQuizEngine.js";

import ExamFooterActions from "../components/ExamFooterActions.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import ReviewSummaryScreen from "../components/ReviewSummaryScreen.jsx";
import QuestionNavigator from "../components/QuestionNavigator.jsx";
import QuizHeader from "../components/QuizHeader.jsx";
import ResultsScreen from "../components/ResultsScreen.jsx";

export default function Quiz() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 1. Catch Route State & Initialize Settings
    const location = useLocation();
    const config = location.state || { mode: 'exam', timeLimit: 0 };

    const [examMode, setExamMode] = useState(config.mode);
    const [timeLimit, setTimeLimit] = useState(config.timeLimit);
    const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);

    // 2. UI Display Toggles (Fixes the showNavigator undefined error!)
    const [showNavigator, setShowNavigator] = useState(false);

    // 3. Data Hooks
    const { quiz, questions, isLoading, error } = useQuizData(id);

    // 4. Ai Tutor Hook
    const {
        aiExplanations,
        loadingAiFor,
        handleExplain,
        chatHistories,
        isChatLoadingFor,
        handleSocraticChat
    } = useAiTutor();

    // 5. Quiz Engine Hook (MUST be called BEFORE the Timer useEffect)
    const {
        currentIndex, setCurrentIndex, userAnswers, flagged,
        isGraded, isReviewing, setIsReviewing, finalScore, isSubmitting,
        jumpToQuestion, handleOptionSelect, toggleFlag, handleGradeExam
    } = useQuizEngine(id, questions, examMode);

    // 6. Timer Logic
    useEffect(() => {
        if (timeLimit === 0 || isGraded || isReviewing) return;

        if (timeLeft <= 0) {
            handleGradeExam();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, timeLimit, isGraded, isReviewing, handleGradeExam]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // 7. Loading / Error States
    if (isLoading) return <div className="min-h-screen bg-gray-100 p-8 text-center text-xl font-bold">Loading Arena...</div>;
    if (error) return <div className="min-h-screen bg-gray-100 p-8 text-center text-red-600 font-bold">{error}</div>;
    if (questions.length === 0) return <div className="min-h-screen bg-gray-100 p-8 text-center font-bold">No questions found.</div>;

    // --- Safe Progress Calculation ---
    // This ensures we only count questions that actually have a selected value
    const answeredCount = Object.values(userAnswers).filter(ans => {
        if (Array.isArray(ans)) return ans.length > 0; // For multi-select
        return ans !== null && ans !== undefined && ans !== ''; // For single-select
    }).length;

    // Prevent dividing by zero and ensure a clean percentage
    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-page text-textMain flex flex-col font-sans transition-colors">
            <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col">

                {/* --- EXTRACTED HEADER & PROGRESS BAR --- */}
                <QuizHeader
                    title={quiz.title}
                    examMode={examMode}
                    // Notice we deleted setExamMode={setExamMode} here!
                    timeLeft={timeLimit > 0 ? formatTime(timeLeft) : null} // Passing our formatted time
                    currentIndex={currentIndex}
                    totalQuestions={questions.length}
                    answeredCount={answeredCount}
                    isGraded={isGraded}
                    progressPercent={progressPercent}
                />

                {/* --- THE TOGGLEABLE NAVIGATOR PANEL --- */}
                {(examMode === 'study' || !isReviewing) && (
                    <div className="mb-8">

                        {/* Toggle Button */}
                        <button
                            onClick={() => setShowNavigator(!showNavigator)}
                            className="px-6 py-3 border-[3px] border-textMain bg-container text-textMain font-black uppercase tracking-wider shadow-brutal-sm hover:bg-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
                        >
                            {/* Added a dynamic icon for better tactile feel */}
                            <span className="text-xl leading-none">{showNavigator ? '▼' : '▶'}</span>
                            {showNavigator ? 'Hide Question Map' : 'Show Question Map & Flags'}
                        </button>

                        {showNavigator && (
                            <div className="mt-6 transition-all">
                                <QuestionNavigator
                                    questions={questions}
                                    userAnswers={userAnswers}
                                    flagged={flagged}
                                    jumpToQuestion={(idx) => {
                                        jumpToQuestion(idx);
                                        setShowNavigator(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Question UI & Review Screen */}
                {!isGraded ? (
                    isReviewing ? (
                        /* --- EXTRACTED REVIEW SUMMARY SCREEN --- */
                        <ReviewSummaryScreen
                            questions={questions}
                            userAnswers={userAnswers}
                            flagged={flagged}
                            jumpToQuestion={jumpToQuestion}
                            onGradeExam={handleGradeExam}
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        
                        // Question card rendering for Quiz/Exam modes
                        <div>

                            {/* Quiz Render Area */}
                            {examMode === 'exam' ? (

                                /* EXAM MODE: Single Question, Paginated */
                                <div className="mb-6">
                                    <QuestionCard
                                        q={questions[currentIndex]}
                                        displayNumber={currentIndex + 1}
                                        examMode={examMode}
                                        currentSelections={userAnswers[questions[currentIndex].id] || []}
                                        isFlagged={flagged.has(questions[currentIndex].id)}
                                        isAiLoading={loadingAiFor === questions[currentIndex].id}
                                        aiExplanation={aiExplanations[questions[currentIndex].id]}
                                        onOptionSelect={handleOptionSelect}
                                        onToggleFlag={toggleFlag}
                                        onExplain={handleExplain}
                                    />
                                </div>
                            ) : (

                                /* STUDY MODE: All Questions, Scrolling */
                                <div className="space-y-8 flex-1 overflow-y-auto pr-4 mb-6">
                                    {questions.map((q, index) => {
                                        return (
                                            <QuestionCard
                                                key={q.id}
                                                q={q}
                                                displayNumber={index + 1}
                                                examMode={examMode}
                                                currentSelections={userAnswers[q.id] || []}
                                                isFlagged={flagged.has(q.id)}
                                                isAiLoading={loadingAiFor === q.id}
                                                aiExplanation={aiExplanations[q.id]}
                                                onOptionSelect={handleOptionSelect}
                                                onToggleFlag={toggleFlag}
                                                onExplain={handleExplain}
                                                chatHistory={chatHistories[q.id] || []}
                                                isChatLoading={isChatLoadingFor === q.id}
                                                onSendChatMessage={handleSocraticChat}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* Navigation & Submission Actions */}
                            <ExamFooterActions
                                examMode={examMode}
                                currentIndex={currentIndex}
                                totalQuestions={questions.length}
                                onPrevious={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                onNext={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                onReview={() => setIsReviewing(true)}
                            />

                        </div>
                    )
                ) : (
                    /* Results Screen */
                    <ResultsScreen
                        finalScore={finalScore}
                        onReturnHome={() => navigate('/dashboard')}
                    />
                )}

            </div>

        </div>
    );

}