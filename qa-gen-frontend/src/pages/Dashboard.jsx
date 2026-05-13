import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuizConfigModal from '../components/QuizConfigModal.jsx';

export default function Dashboard() {
    // 1. State Management
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Phase 6 Modal State ---
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState(null);

    const navigate = useNavigate();

    // 2. Fetch Data on Mount
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await api.get('/api/quizzes');
                setQuizzes(response.data);
            } catch (err) {
                console.error("Error fetching quizzes:", err);
                setError("Failed to load your quizzes. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    // 3. Delete Handler Logic (From Phase 4)
    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.");
        if (!isConfirmed) return;

        try {
            await api.delete(`/api/quizzes/${id}`);
            setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.id !== id));
        } catch (err) {
            console.error("Error deleting quiz:", err);
            setError("Failed to delete the quiz. Please try again.");
        }
    };

    // Handlers
    const handleOpenModal = (quizId) => {
        setSelectedQuizId(quizId);
        setShowConfigModal(true);
    };

    // Catches the config object passed up from our new child component!
    const handleStartQuiz = (config) => {
        navigate(`/quiz/${selectedQuizId}`, { state: config });
    };

    // 4. UI Renders
    if (isLoading) {
        return <div className="min-h-screen bg-gray-100 p-8 flex justify-center"><p className="text-xl">Loading your quizzes...</p></div>;
    }

    return (
        <div className="min-h-screen bg-page p-6 sm:p-10 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">

                {/* - mb-10: Large bottom margin for clear separation.
                   - items-end: Aligns the "New Quiz" button to the bottom of the title row.
                */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-textMain tracking-tighter uppercase">Your Quizzes</h1>
                    </div>

                    <button
                        onClick={() => navigate('/create')}
                        className="bg-primary text-textMain border-[3px] border-textMain px-4 py-2 font-black text-xl shadow-brutal active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase"
                    >
                        + NEW QUIZ
                    </button>
                </div>

                {error && <div className="bg-red-100 border-[3px] border-red-500 p-4 mb-6 font-bold shadow-brutal-sm">{error}</div>}

                {/* - grid-cols-1 md:grid-cols-2 lg:grid-cols-3: Responsive columns.
                   - gap-8: Generous spacing between cards.
                */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quizzes.map((quiz) => (
                        /* - shadow-brutal: Our signature 4px hard shadow.
                           - hover:-translate-y-1: Subtle "lift" when hovering over a card.
                        */
                        <div
                            key={quiz.id}
                            className="bg-container border-[3px] border-textMain p-6 flex flex-col shadow-brutal hover:-translate-y-1 transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-black text-textMain leading-tight uppercase">{quiz.title}</h3>
                                <button
                                    onClick={() => handleDelete(quiz.id)}
                                    className="border-2 border-textMain p-1 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                </button>
                            </div>

                            <div className="text-md font-bold text-textSub mb-8 flex-grow">
                                Last Score: <span className="text-textMain">{quiz.lastScore !== null ? `${quiz.lastScore}%` : 'N/A'}</span>
                            </div>

                            <button
                                onClick={() => handleOpenModal(quiz.id)}
                                className="w-full bg-primary border-[3px] border-textMain py-3 font-black text-lg shadow-brutal active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-widest"
                            >
                                Take Quiz
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <QuizConfigModal
                isOpen={showConfigModal}
                onClose={() => setShowConfigModal(false)}
                onStart={handleStartQuiz}
            />
        </div>
    );
}