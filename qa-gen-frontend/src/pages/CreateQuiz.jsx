import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { parseAndMapQuestions } from '../utils/parser';

export default function CreateQuiz() {
    // 1. State Management
    const [title, setTitle] = useState('');          // Holds the quiz title
    const [rawText, setRawText] = useState('');      // Holds the massive block of pasted text
    const [errors, setErrors] = useState([]);        // Holds the array of errors from our parser
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevents spam-clicking the save button

    const navigate = useNavigate();

    // 2. The Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset our errors and lock the button
        setErrors([]);
        setIsSubmitting(true);

        try {
            // STEP A: Pass the raw text to our pure function
            const parseResult = parseAndMapQuestions(rawText);

            // STEP B: Check if the parser found formatting errors
            if (!parseResult.success) {
                // If it failed, dump the errors into React state to show the user, then stop execution
                setErrors(parseResult.errors);
                setIsSubmitting(false);
                return;
            }

            // STEP C: Construct the exact payload Spring Boot expects (CreateQuizRequestDTO)
            const payload = {
                title: title,
                questions: parseResult.data
            };

            // STEP D: POST to the backend
            await api.post('/api/quizzes', payload);

            // Redirect back home on success
            navigate('/dashboard');
        } catch (err) {
            console.error("Error saving quiz:", err);
            setErrors(["Failed to save quiz. Please ensure your backend is running."]);
            setIsSubmitting(false);
        }
    };

    return (
        /* bg-page: Maps to our theme's background color.
           transition-colors: Ensures smooth switching if we toggle Dark Mode. */
        <div className="min-h-screen bg-page p-6 sm:p-10 transition-colors duration-300">

            {/* Main Card:
                - border-[3px]: The signature thick border.
                - shadow-brutal: Our 4px hard solid shadow.
                - max-w-4xl: Keeps the form readable and centered.
            */}
            <div className="max-w-4xl mx-auto bg-container border-[3px] border-textMain p-8 shadow-brutal">

                <h2 className="text-4xl font-black text-textMain mb-2 uppercase tracking-tighter">
                    Create New Quiz
                </h2>

                {/* Error Section: Styled as a "Brutal" alert box */}
                {errors.length > 0 && (
                    <div className="bg-red-100 border-[3px] border-red-500 p-4 mb-8 shadow-brutal-sm">
                        <p className="font-black text-red-700 uppercase mb-2">Parsing Errors Found:</p>
                        <ul className="list-disc list-inside text-red-700 font-bold">
                            {errors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    {/* Title Input Group */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xl font-black text-textMain uppercase">Quiz Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Demo Quiz 1"
                            /* shadow-brutal-sm: A 2px hard shadow for a tactile feel.
                               focus:translate-x: Moves the input slightly when clicked to feel "pressed". */
                            className="w-full h-14 px-4 border-[3px] border-textMain bg-container text-textMain font-bold text-lg shadow-brutal-sm focus:outline-none focus:border-inputFocus focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:text-textSub placeholder:opacity-50"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Text Area Group */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xl font-black text-textMain uppercase">Paste Quiz Text</label>

                        {/* Instructional Tip Box */}
                        <div className="bg-yellow-50 border-2 border-textMain p-3 mb-2 shadow-brutal-sm text-sm font-bold text-textMain italic">
                            Format Tip: Use (*) to indicate correct answer(s).
                        </div>

                        <textarea
                            id="quizTextBox"
                            required
                            rows="12"
                            placeholder="1. What is the capital of France?&#10;A. Berlin&#10;B. Madrid&#10;C. Paris*&#10;D. Rome"
                            /* font-mono: Makes formatted text easier to read for structural checks. */
                            className="w-full border-[3px] border-textMain p-4 bg-container text-textMain font-mono text-base shadow-brutal-sm focus:outline-none focus:border-inputFocus focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:text-textSub placeholder:opacity-40"
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                        />
                    </div>

                    {/* Submit Button:
                        - bg-primary: Uses your vibrant Lime Green.
                        - active:translate-x-[4px]: The physical "push-down" button effect.
                    */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-5 border-[3px] border-textMain font-black text-2xl uppercase tracking-widest transition-all shadow-brutal
                            ${isSubmitting
                            ? 'bg-textSub cursor-not-allowed opacity-50'
                            : 'bg-primary text-textMain hover:bg-secondary active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'}`}
                    >
                        {isSubmitting ? 'Parsing & Saving...' : 'Save Quiz'}
                    </button>
                </form>

            </div>
        </div>
    );
}