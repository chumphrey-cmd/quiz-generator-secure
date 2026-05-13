import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAiSettings } from "../context/AiSettingsContext.jsx";

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const { setShowSettingsModal } = useAiSettings();

    // LOGIC CHECK: If you are logged out, the Navbar is hidden.
    // If you are testing and want to see it regardless, comment out the line below.
    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        /* - sticky top-0: Keeps nav at the top while scrolling.
           - z-50: Ensures it stays on top of all other elements.
           - border-b-[3px]: A thick bottom border.
           - border-textMain: Uses our custom dark border color variable.
        */
        <nav className="sticky top-0 z-50 bg-container border-b-[3px] border-textMain p-2 transition-colors duration-300">
            <div className="container mx-auto flex justify-between items-center max-w-6xl">

                {/* - font-black: Extra-heavy weight.
                   - italic: Slanted style for a "brand" feel.
                   - tracking-tighter: Pushes letters together for a modern look.
                */}
                <Link to="/dashboard" className="text-3xl font-black italic tracking-tighter text-textMain">
                    QA-GEN
                </Link>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* - hover:bg-primary: Swaps background to lime green on hover.
                       - hover:border-textMain: Shows the border only when hovered.
                    */}
                    <Link to="/dashboard" className="font-bold text-textMain px-3 py-1 border-2 border-transparent hover:border-textMain hover:bg-primary rounded transition-all">
                        DASHBOARD
                    </Link>

                    <Link to="/create" className="font-bold text-textMain px-3 py-1 border-2 border-transparent hover:border-textMain hover:bg-primary rounded transition-all">
                        CREATE
                    </Link>

                    {/* AI Settings Toggle */}
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="font-bold text-textMain px-3 py-1 border-2 border-transparent hover:border-textMain hover:bg-primary rounded transition-all"
                    >
                        SETTINGS
                    </button>

                    {/* - shadow-brutal-sm: Our custom 2px hard shadow.
                       - active:translate-x-[2px]: Moves the button slightly when clicked.
                       - active:shadow-none: Removes the shadow on click to feel "pressed."
                    */}
                    <button
                        onClick={handleLogout}
                        className="ml-4 bg-red-500 text-white px-4 py-2 border-2 border-textMain font-bold shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </nav>
    );
}