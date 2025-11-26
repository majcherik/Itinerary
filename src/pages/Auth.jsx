import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate(from, { replace: true });
            } else {
                const { error } = await signUp(email, password);
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="bg-bg-card p-8 rounded-xl shadow-2xl w-full max-w-md border border-border-color">
                <h2 className="text-3xl font-bold text-center mb-6 text-text-primary">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="input w-full"
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="input w-full"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="btn btn-primary w-full mt-6 flex justify-center items-center"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            isLogin ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-text-secondary">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            className="text-accent-primary font-bold hover:underline focus:outline-none"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                    <p className="text-xs text-text-secondary mt-4 opacity-50">v1.0.1</p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
