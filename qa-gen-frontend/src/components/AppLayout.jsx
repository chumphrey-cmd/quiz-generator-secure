import React, {useState} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {useAiSettings} from "../context/AiSettingsContext.jsx";

export default function AppLayout({children}) {
    const {isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {setShowSettingsModal} = useAiSettings();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen w-full bg-page flex items-center justify-center">
                {children}
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen w-full bg-page text-textMain font-sans overflow-hidden relative">

            {/* --- MOBILE OVERLAY --- */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-textMain/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* --- THE NEOBRUTALIST SIDEBAR --- */}
            <nav className={`
                w-fit fixed inset-y-0 left-0 z-50 bg-container border-r-[3px] border-textMain flex flex-col transition-transform duration-300 ease-in-out
                lg:static lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0 shadow-[8px_0_0_rgba(0,0,0,1)]' : '-translate-x-full'}
            `}>

                {/* Logo Area */}
                <div
                    className="h-10 border-b-[3px] border-textMain flex items-center justify-between px-6 bg-secondary shrink-0">
                    <div className="flex items-center gap-3">
                        {/* LOGO */}
                        <svg className="w-11 h-8 text-textMain shrink-0" viewBox="0 0 44 24" fill="currentColor">
                            <text x="0" y="20" className="font-black italic tracking-tighter" fontSize="24">
                                QA
                            </text>
                        </svg>
                        {/*<span className="text-2xl font-black italic tracking-tighter text-textMain mt-1">*/}
                        {/*    QA-GEN*/}
                        {/*</span>*/}
                    </div>

                    <button
                        onClick={closeSidebar}
                        className="lg:hidden text-textMain hover:text-red-500 transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto mt-2">

                    <Link
                        to="/dashboard"
                        onClick={closeSidebar}
                        className={`w-fit inline-flex items-center justify-start gap-3 py-2 px-4 border-[3px] border-textMain transition-all shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        ${isActive('/dashboard') ? 'bg-primary translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-page hover:bg-primary'}`}
                    >
                        <svg className="w-6 h-6 shrink-0" fill="currentColor" stroke="currentColor" strokeWidth="1" viewBox="0 0 16 16">
                            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
                        </svg>
                        {/*<span className="font-black text-textMain uppercase tracking-wider hidden lg:block mt-0.5">Dashboard</span>*/}
                    </Link>

                    <Link
                        to="/create"
                        onClick={closeSidebar}
                        // Updated: w-fit inline-flex justify-start
                        className={`w-fit inline-flex items-center justify-start gap-3 py-2 px-4 border-[3px] border-textMain transition-all shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
            ${isActive('/create') ? 'bg-primary translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-page hover:bg-primary'}`}
                    >
                        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             strokeWidth="3">
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4"/>
                        </svg>
                        {/*<span className="font-black text-textMain uppercase tracking-wider hidden lg:block mt-0.5">Create</span>*/}
                    </Link>

                    <button
                        onClick={() => {
                            setShowSettingsModal(true);
                            closeSidebar();
                        }}
                        // Updated: w-fit inline-flex justify-start
                        className="w-fit inline-flex items-center justify-start gap-3 py-2 px-4 border-[3px] border-textMain bg-page hover:bg-primary transition-all shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             strokeWidth="2.5">
                            <path strokeLinecap="square" strokeLinejoin="miter"
                                  d="M4 6h16M4 12h16M4 18h16M8 4v4M16 10v4M8 16v4"/>
                        </svg>
                        {/*<span className="font-black text-textMain uppercase tracking-wider hidden lg:block mt-0.5">Settings</span>*/}
                    </button>
                </div>

                {/* Logout Button */}
                <div className="w-full p-4 border-t-[3px] border-textMain bg-container shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 py-2 px-4 border-[3px] border-textMain bg-red-400 hover:bg-red-500 transition-all shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-textMain"
                    >
                        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             strokeWidth="2.5">
                            <path strokeLinecap="square" strokeLinejoin="miter"
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
                        </svg>
                        {/*<span className="font-black uppercase tracking-wider hidden lg:block mt-0.5">Logout</span>*/}
                    </button>
                </div>
            </nav>

            {/* --- THE MAIN CONTENT AREA --- */}
            <main className="flex-1 h-full flex flex-col overflow-hidden bg-transparent relative">

                {/* Mobile Hamburger Header */}
                <div
                    className="lg:hidden h-20 border-b-[3px] border-textMain bg-container flex items-center px-4 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 border-[3px] border-textMain bg-page hover:bg-primary transition-all shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center text-textMain"
                        aria-label="Open Menu"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>

                    <span className="text-2xl font-black italic tracking-tighter text-textMain ml-4 mt-1">
                        QA
                    </span>
                </div>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

            </main>
        </div>
    );
}