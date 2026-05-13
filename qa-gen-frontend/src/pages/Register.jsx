import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // POST to the Spring Boot registration endpoint
            await api.post('/api/auth/register', { email, password });

            // Spring Boot returns a 201 Created on success.
            // We immediately route them to login so they can use their new credentials.
            navigate('/login');
        } catch (err) {
            // Catch bad requests (like if the email is already taken)
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        // Wrapper: centers the card on the screen with our theme background color
        <div className="min-h-screen bg-page flex items-center justify-center p-4 transition-colors duration-300">

            {/* The Card: Neobrutalist "Big Dodo" style.
              - bg-container: Uses light/dark mode background.
              - border-2 border-textMain: Thick solid border.
              - shadow-brutal: Custom 4px offset solid shadow.
            */}
            <div className="bg-container p-8 rounded-md w-full max-w-md border-2 border-textMain shadow-brutal transition-colors duration-300">
                <h2 className="text-3xl font-black text-center mb-6 text-textMain">Create an Account</h2>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 font-bold px-4 py-3 rounded-md mb-6 shadow-brutal-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Email Input Group */}
                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-textMain">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            className="w-full h-10 px-3 rounded-md border-2 border-textMain bg-container text-textMain shadow-brutal focus:outline-none focus:border-inputFocus transition-colors placeholder:text-textSub placeholder:opacity-70"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Input Group */}
                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-textMain">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full h-10 px-3 rounded-md border-2 border-textMain bg-container text-textMain shadow-brutal focus:outline-none focus:border-inputFocus transition-colors placeholder:text-textSub placeholder:opacity-70"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Submit Button:*/}
                    <button
                        type="submit"
                        className="mt-4 w-full h-12 rounded-md border-2 border-textMain bg-primary text-textMain font-bold text-lg shadow-brutal cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center mt-6 font-medium text-textSub">
                    Already have an account?{' '}
                    <Link to="/login" className="text-textMain font-bold underline decoration-2 hover:text-inputFocus transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}