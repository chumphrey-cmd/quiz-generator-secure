import { useState } from 'react';
import api from "../services/api.js";

export const useQuizEngine = (quizId, questions, examMode) => {
    // Core Engine State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());

    // Grader State
    const [isGraded, setIsGraded] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Navigation Handlers
    const jumpToQuestion = (index) => {
        setCurrentIndex(index);
        setIsReviewing(false);
    };

    // Interaction Handlers
    const handleOptionSelect = (questionId, option, isMulti) => {
        if (isGraded) return; // Lock inputs if already graded

        setUserAnswers(prev => {
            const current = prev[questionId] || [];
            if (isMulti) {
                return {
                    ...prev,
                    [questionId]: current.includes(option)
                        ? current.filter(item => item !== option)
                        : [...current, option]
                };
            } else {
                return { ...prev, [questionId]: [option] };
            }
        });
    };

    const toggleFlag = (questionId) => {
        setFlagged(prev => {
            const newFlagged = new Set(prev);
            if (newFlagged.has(questionId)) {
                newFlagged.delete(questionId);
            } else {
                newFlagged.add(questionId);
            }
            return newFlagged;
        });
    };

    // Grading Logic
    const handleGradeExam = async () => {
        setIsSubmitting(true);
        let correctCount = 0;

        questions.forEach(q => {
            const selected = userAnswers[q.id] || [];
            const correct = q.correctAnswers || [];

            const isCorrect =
                selected.length === correct.length &&
                selected.every(ans => correct.includes(ans));

            if (isCorrect) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / questions.length) * 100);

        try {
            if(examMode === 'exam') {
                await api.put(`/api/quizzes/${quizId}/score`, { lastScore : score });
            }
        }catch (error) {
            console.error("Failed to save final score to database: ", error);
        }

        // Slight delay to make the grading feel substantial
        setTimeout(() => {
            setFinalScore(score);
            setIsGraded(true);
            setIsSubmitting(false);
            setIsReviewing(false);
        }, 800);
    };

    return {
        currentIndex, setCurrentIndex,
        userAnswers,
        flagged,
        isGraded,
        isReviewing, setIsReviewing,
        finalScore,
        isSubmitting,
        jumpToQuestion,
        handleOptionSelect,
        toggleFlag,
        handleGradeExam
    };
};