import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// "children" represents the protected page (like Dashboard) nested inside this component
export default function ProtectedRoute({ children }) {
    // Check our global state
    const { isAuthenticated } = useAuth();

    // If there is no token in local storage, kick them back to the login page immediately
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If they are authenticated, render the page they asked for
    return children;
}