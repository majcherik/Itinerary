'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@itinerary/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import SocialMediaLinks from '../../src/components/SocialMediaLinks';

// Validation schemas
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: passwordSchema,
});

const signUpSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: passwordSchema,
});

const AuthContent = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get('from') || '/';
    const oauthError = searchParams.get('error');

    // Form validation with react-hook-form
    const {
        register,
        handleSubmit: handleFormSubmit,
        formState: { errors, isValid },
        reset
    } = useForm({
        resolver: zodResolver(isLogin ? loginSchema : signUpSchema),
        mode: 'onBlur',
    });

    // Show OAuth error if present
    React.useEffect(() => {
        if (oauthError === 'oauth_failed') {
            setError('Google login failed. Please try again or use email/password.');
        }
    }, [oauthError]);

    // Load remember me preference on mount
    React.useEffect(() => {
        const savedRememberMe = localStorage.getItem('rememberMe');
        if (savedRememberMe === 'true') {
            setRememberMe(true);
        }
    }, []);

    // Reset form when switching between login/signup
    React.useEffect(() => {
        reset();
    }, [isLogin, reset]);

    const handleSubmit = async (data) => {
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }

                const { error } = await signIn(data.email, data.password);
                if (error) throw error;
                router.push(from);
            } else {
                const { error } = await signUp(data.email, data.password);
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setGoogleLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
            // If successful, user will be redirected by Supabase
        } catch (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
    };

    return (
        <main className="w-full h-screen flex flex-col items-center justify-center px-4 bg-bg-primary relative">
            <div className="max-w-sm w-full text-text-primary">
                <div className="text-center">
                    <div className="mx-auto w-[150px] h-[60px] flex items-center justify-center">
                        <h1 className="text-3xl font-bold text-accent-primary">TripPlanner</h1>
                    </div>
                    <div className="mt-5 space-y-2">
                        <h3 className="text-text-primary text-2xl font-bold sm:text-3xl">
                            {isLogin ? 'Log in to your account' : 'Sign up'}
                        </h3>
                        {!isLogin && (
                            <p className="text-text-secondary">
                                Already have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="font-medium text-accent-primary hover:text-accent-secondary"
                                >
                                    Log in
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleFormSubmit(handleSubmit)} className="mt-8 space-y-5">
                    <div>
                        <label className="font-medium text-text-primary">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full mt-2 px-3 py-2 text-text-primary bg-transparent outline-none border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-accent-primary'} shadow-sm rounded-lg transition-colors`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-medium text-text-primary">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className={`w-full mt-2 px-3 py-2 text-text-primary bg-transparent outline-none border ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-accent-primary'} shadow-sm rounded-lg transition-colors`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-x-3">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="remember-me-checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor="remember-me-checkbox"
                                        className="relative flex w-5 h-5 rounded-md border duration-150 cursor-pointer hover:opacity-90"
                                        style={{
                                            backgroundColor: rememberMe ? 'var(--accent-primary, #6366f1)' : '#ffffff',
                                            borderColor: rememberMe ? 'var(--accent-primary, #6366f1)' : '#d1d5db'
                                        }}
                                    >
                                        <span
                                            className="absolute inset-x-0 top-[3px] m-auto w-1.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 transition-opacity duration-150"
                                            style={{ opacity: rememberMe ? 1 : 0 }}
                                        />
                                    </label>
                                </div>
                                <label htmlFor="remember-me-checkbox" className="text-text-secondary cursor-pointer">Remember me</label>
                            </div>
                            <button
                                type="button"
                                onClick={() => alert('Password reset not implemented yet.')}
                                className="text-center text-accent-primary hover:text-accent-secondary"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ backgroundColor: 'var(--accent-primary, #6366f1)' }}
                        className="w-full px-4 py-2 text-white font-medium hover:opacity-90 active:opacity-100 rounded-lg duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            isLogin ? 'Sign in' : 'Create account'
                        )}
                    </button>
                </form>

                <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-x-3 py-2.5 mt-5 border border-border-color rounded-lg text-sm font-medium hover:bg-bg-secondary duration-150 active:bg-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {googleLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent-primary"></div>
                            <span>Redirecting to Google...</span>
                        </div>
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_17_40)">
                                    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                    <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                    <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_17_40">
                                        <rect width="48" height="48" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                {isLogin && (
                    <p className="text-center mt-5 text-text-secondary">
                        Don't have an account?{' '}
                        <button
                            onClick={() => setIsLogin(false)}
                            className="font-medium text-accent-primary hover:text-accent-secondary"
                        >
                            Sign up
                        </button>
                    </p>
                )}
            </div>
            <div className="fixed bottom-4 left-4">
                <SocialMediaLinks />
            </div>
        </main>
    );
};

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
