import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Auth() {
    // --- 1. Routing & Global State ---
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // --- 2. Local UI State ---
    // Controls which side of the 3D card is facing the user
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // --- 3. Form Data State ---
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    // --- 4. Effects ---
    // If the user navigates to "/register" directly, start with the card flipped
    useEffect(() => {
        if (location.pathname === '/register') {
            setIsFlipped(true);
        } else {
            setIsFlipped(false);
        }
        // Clear messages when route changes
        setError('');
        setSuccessMsg('');
    }, [location.pathname]);

    // --- 5. Handlers ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            const response = await api.post('/api/auth/login', { email: loginEmail, password: loginPassword });
            const token = response.data;
            login(token); // Save to LocalStorage via Context
            navigate('/dashboard'); // Route to protected area
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid email or password.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            await api.post('/api/auth/register', { email: registerEmail, password: registerPassword });

            // On success: Clear form, show success message, and organically flip back to login side!
            setRegisterEmail('');
            setRegisterPassword('');
            setSuccessMsg('Account created! You can now log in.');
            setIsFlipped(false);
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-page flex flex-col items-center justify-center p-4 font-sans text-textMain">

            {/* Global Error/Success Messages */}
            {error && (
                <div className="mb-6 px-4 py-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold rounded shadow-brutal-sm text-center max-w-sm w-full">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-6 px-4 py-3 bg-green-100 border-2 border-green-500 text-green-700 font-bold rounded shadow-brutal-sm text-center max-w-sm w-full">
                    {successMsg}
                </div>
            )}

            {/* --- The Switch Container --- */}
            <div className="relative flex flex-col items-center justify-center gap-7 mb-12">
                <span className={`absolute -left-20 top-0 w-[100px] font-bold transition-all ${!isFlipped ? 'underline' : 'opacity-70'}`}>
                    Log in
                </span>
                <span className={`absolute left-16 top-0 w-[100px] font-bold transition-all ${isFlipped ? 'underline' : 'opacity-70'}`}>
                    Sign up
                </span>

                <button
                    type="button"
                    onClick={() => {
                        setIsFlipped(!isFlipped);
                        navigate(isFlipped ? '/login' : '/register');
                    }}
                    style={{ width: '50px', height: '24px' }}
                    className="relative rounded-[5px] border-2 border-textMain shadow-brutal bg-container cursor-pointer transition-colors duration-300 focus:outline-none"
                    aria-label="Toggle Login and Register"
                >
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            transform: isFlipped ? 'translateX(26px)' : 'translateX(0px)'
                        }}
                        className={`absolute -left-[2px] -bottom-[-8px] border-2 border-textMain rounded-[5px] shadow-[0_3px_0_var(--main-border)] transition-transform duration-300 ${isFlipped ? 'bg-inputFocus' : 'bg-container'}`}
                    ></div>
                </button>
            </div>

            {/* --- The 3D Flip Card Container --- */}
            <div
                className="relative bg-transparent"
                style={{ width: '320px', height: '400px', perspective: '1000px' }}
            >
                <div
                    className="w-full h-full relative text-center transition-transform duration-700 ease-in-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >

                    {/* --- FRONT SIDE: LOGIN --- */}
                    <div
                        className="absolute w-full h-full p-5 bg-container rounded-md border-2 border-textMain shadow-brutal flex flex-col justify-center items-center gap-5"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <h2 className="text-4xl font-black text-textMain mb-4">Log in</h2>
                        <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full">
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full max-w-[250px] h-10 px-3 rounded border-2 border-textMain bg-container text-textMain shadow-brutal font-semibold outline-none focus:border-inputFocus placeholder:text-textSub transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full max-w-[250px] h-10 px-3 rounded border-2 border-textMain bg-container text-textMain shadow-brutal font-semibold outline-none focus:border-inputFocus placeholder:text-textSub transition-colors"
                            />
                            <button
                                type="submit"
                                className="mt-4 w-[120px] h-10 rounded border-2 border-textMain bg-primary text-textMain font-bold text-lg shadow-brutal cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                            >
                                Sign In!
                            </button>
                        </form>
                    </div>

                    {/* --- BACK SIDE: REGISTER --- */}
                    <div
                        className="absolute w-full h-full p-5 bg-container rounded-md border-2 border-textMain shadow-brutal flex flex-col justify-center items-center gap-5"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <h2 className="text-4xl font-black text-textMain mb-4">Sign up</h2>
                        <form onSubmit={handleRegister} className="flex flex-col items-center gap-4 w-full">
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                className="w-full max-w-[250px] h-10 px-3 rounded border-2 border-textMain bg-container text-textMain shadow-brutal font-semibold outline-none focus:border-inputFocus placeholder:text-textSub transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                className="w-full max-w-[250px] h-10 px-3 rounded border-2 border-textMain bg-container text-textMain shadow-brutal font-semibold outline-none focus:border-inputFocus placeholder:text-textSub transition-colors"
                            />
                            <button
                                type="submit"
                                className="mt-4 w-[120px] h-10 rounded border-2 border-textMain bg-secondary text-textMain font-bold text-lg shadow-brutal cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                            >
                                Confirm!
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}