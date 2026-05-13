import { createContext, useState, useContext } from 'react';

// Create the Context object
const AuthContext = createContext();

// Create the Provider component that will wrap our application
export const AuthProvider = ({ children }) => {
    // Initialize state by checking if a token already exists in local storage
    const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);

    // Saves token to storage and updates React state
    const login = (newToken) => {
        localStorage.setItem('jwt_token', newToken);
        setToken(newToken);
    };

    // Wipes the token from storage and state
    const logout = () => {
        localStorage.removeItem('jwt_token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// A custom hook so we can easily grab auth data from any component later
export const useAuth = () => useContext(AuthContext);