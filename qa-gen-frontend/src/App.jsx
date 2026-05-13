import {useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import Navbar from './components/Navbar';
import AiSettingsModal from './components/AiSettingsModal';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Auth from "./pages/Auth.jsx";
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';
import {AiSettingsProvider} from "./context/AiSettingsContext.jsx";

function App() {
    return (
        <AuthProvider>
            <AiSettingsProvider>
                <BrowserRouter>
                    <Navbar/>

                    <Routes>
                         Public Routes
                        {/*<Route path="/" element={<Login/>}/>*/}
                        {/*<Route path="/login" element={<Login/>}/>*/}
                        {/*<Route path="/register" element={<Register/>}/>*/}

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
                    <AiSettingsModal/>
                </BrowserRouter>
            </AiSettingsProvider>
        </AuthProvider>
    );
}

export default App;