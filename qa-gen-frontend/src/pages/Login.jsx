import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
    // 1. State: Variables to hold what the user types and any errors we get back
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 2. Hooks: Bring in our global login function and the React Router navigator
    const { login } = useAuth();
    const navigate = useNavigate();

    // 3. The Submit Handler: Fires when the user clicks "Sign In"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Stops the browser from refreshing the page
        setError(''); // Clear any previous errors

        try {
            // Ask Axios to POST the email/password to Spring Boot
            const response = await api.post('/api/auth/login', { email, password });

            // If successful, Spring Boot returns the raw JWT string. We grab it here.
            const token = response.data;

            // Send the token to our AuthContext (which saves it to LocalStorage)
            login(token);

            // Redirect the user to the protected Dashboard
            navigate('/dashboard');
        } catch (err) {
            // If Spring Boot throws a 401 Unauthorized, catch it and show a friendly message
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password.');
            } else {
                setError('Invalid email or password.');
            }
        }
    };

    return (
        // Wrapper: centers the card on the screen with our new page background color
        <div className="min-h-screen bg-page flex items-center justify-center p-4">

            {/* Card */}
            <div className="bg-container p-8 rounded-md w-full max-w-md border-2 border-textMain shadow-brutal transition-colors duration-300">
                <h2 className="text-3xl font-black text-center mb-6 text-textMain">Welcome Back</h2>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 font-bold px-4 py-3 rounded-md mb-6 shadow-brutal-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5" id={"loginForm"}>
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

                    {/* Submit Button:
                      - bg-primary: Uses our vibrant lime green.
                    */}
                    <button
                        type="submit"
                        className="mt-4 w-full h-12 rounded-md border-2 border-textMain bg-primary text-textMain font-bold text-lg shadow-brutal cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center mt-6 font-medium text-textSub">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-textMain font-bold underline decoration-2 hover:text-inputFocus transition-colors">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}