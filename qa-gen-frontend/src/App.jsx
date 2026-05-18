import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {AiSettingsProvider} from "./context/AiSettingsContext.jsx";

import AppLayout from './components/AppLayout';
import AiSettingsModal from './components/AiSettingsModal';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import Auth from "./pages/Auth.jsx";
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';

function App() {
    return (
        <AuthProvider>
            <AiSettingsProvider>
                <BrowserRouter>

                    <AppLayout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Auth/>}/>
                            <Route path="/login" element={<Auth/>}/>
                            <Route path="/register" element={<Auth/>}/>

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard/>
                                </ProtectedRoute>
                            }/>

                            <Route path="/create" element={
                                <ProtectedRoute>
                                    <CreateQuiz/>
                                </ProtectedRoute>
                            }/>

                            <Route path="/quiz/:id" element={
                                <ProtectedRoute>
                                    <Quiz/>
                                </ProtectedRoute>
                            }/>
                        </Routes>
                    </AppLayout>

                    {/* The Modal lives outside the layout, but inside the providers */}
                    <AiSettingsModal/>

                </BrowserRouter>
            </AiSettingsProvider>
        </AuthProvider>
    );
}

export default App;