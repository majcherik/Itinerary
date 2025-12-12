'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@itinerary/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../src/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../../src/components/ui/card';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';

const AuthContent = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const from = searchParams.get('from') || '/';
    const oauthError = searchParams.get('error');

    // Show OAuth error if present
    React.useEffect(() => {
        if (oauthError === 'oauth_failed') {
            setError('Google login failed. Please try again or use email/password.');
        }
    }, [oauthError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                router.push(from);
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
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{isLogin ? 'Login to your account' : 'Create an account'}</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Enter your email below to login to your account' : 'Enter your email below to create your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {isLogin && (
                                    <button type="button" className="text-sm hover:underline text-text-secondary" onClick={() => alert("Password reset not implemented yet.")}>
                                        Forgot your password?
                                    </button>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                isLogin ? 'Login' : 'Sign Up'
                            )}
                        </Button>
                    </form>
                    <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button" disabled={googleLoading}>
                        {googleLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                                Redirecting to Google...
                            </div>
                        ) : (
                            'Login with Google'
                        )}
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-muted-foreground text-sm text-text-secondary">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            className="underline text-accent-primary font-bold"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign up' : 'Login'}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
