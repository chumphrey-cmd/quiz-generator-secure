import { useState, useEffect } from 'react';
import api from '../services/api';

// Fisher-Yates Shuffler
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const useQuizData = (id) => {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchQuiz = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/api/quizzes/${id}`);
                const fetchedQuiz = response.data;

                const preppedQuestions = fetchedQuiz.questions.map(q => {
                    const prefixRegex = /^[A-Z]\.\s*/;
                    const cleanOptions = q.options.map(opt => opt.replace(prefixRegex, ''));
                    const cleanCorrect = q.correctAnswers.map(ans => ans.replace(prefixRegex, ''));

                    return {
                        ...q,
                        options: shuffleArray(cleanOptions),
                        correctAnswers: cleanCorrect
                    };
                });

                setQuiz(fetchedQuiz);
                setQuestions(preppedQuestions);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load quiz.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [id]);

    return { quiz, questions, isLoading, error };
};