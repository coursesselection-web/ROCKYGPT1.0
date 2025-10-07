import React, { useState } from 'react';
import { User } from '../types';
import { NeuralSuiteIcon } from './Icons';

interface AuthViewProps {
    onLoginSuccess: (username: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // In a real application, this user data would come from a secure backend.
    // For this simulation, we use localStorage as a simple "database".
    const getUsers = (): User[] => {
        try {
            const usersJson = localStorage.getItem('users');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (e) {
            console.error("Failed to parse users from localStorage", e);
            return [];
        }
    };

    const saveUsers = (users: User[]) => {
        try {
            localStorage.setItem('users', JSON.stringify(users));
        } catch (e) {
            console.error("Failed to save users to localStorage", e);
            setError("Could not save user data. Your browser might be in private mode or storage is full.");
        }
    };

    const handleAuth = async (action: 'login' | 'signup') => {
        if (!username.trim() || !password.trim()) {
            setError("Username and password cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);

        // Simulate network delay
        await new Promise(res => setTimeout(res, 500));

        const users = getUsers();
        const userExists = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (action === 'signup') {
            if (userExists) {
                setError("Username already taken. Please choose another one or log in.");
                setIsLoading(false);
                return;
            }
            const newUser: User = { username, password };
            saveUsers([...users, newUser]);
            onLoginSuccess(username);

        } else { // Login
            if (!userExists) {
                setError("User not found. Please check your username or sign up.");
                setIsLoading(false);
                return;
            }
            if (userExists.password !== password) {
                setError("Incorrect password. Please try again.");
                setIsLoading(false);
                return;
            }
            onLoginSuccess(username);
        }
        
        // No need to set isLoading to false on success, as the component will unmount
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Default action is login
        handleAuth('login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                    <NeuralSuiteIcon className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-100">Welcome to Studio</h1>
                    <p className="text-slate-400">Sign in or create an account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md p-3 text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-slate-400 mb-2"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            placeholder="e.g., alan_turing"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-400 mb-2"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => handleAuth('signup')}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-slate-700 text-slate-200 font-semibold rounded-md hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '...' : 'Sign Up'}
                        </button>
                         <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '...' : 'Login'}
                        </button>
                    </div>
                </form>
                 <p className="text-xs text-slate-600 text-center mt-8">
                    Note: User data is stored locally in your browser. This is a demonstration and not a secure system for production use.
                </p>
            </div>
        </div>
    );
};

export default AuthView;