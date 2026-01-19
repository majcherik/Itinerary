'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@itinerary/shared';
import { GlassAuthCard } from '@/components/auth/GlassAuthCard';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { Separator } from '@/components/ui/separator';
import { FooterBlock } from '@/components/FooterBlock';

/**
 * AuthPage - Glass morphism authentication page
 *
 * Features:
 * - Glass card design with backdrop blur
 * - Email/password sign in and sign up
 * - Google OAuth only (no Twitter/Facebook/Instagram)
 * - hCaptcha integration
 * - Strict password validation
 * - Footer component
 */
export default function AuthPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signUp, signInWithGoogle } = useAuth();

    const returnTo = searchParams.get('from') || '/';

    const handleSignIn = async (
        data: { email: string; password: string },
        captchaToken: string
    ) => {
        setIsLoading(true);
        try {
            const result = await signIn(data.email, data.password, { captchaToken });
            if (result.error) {
                toast.error(result.error.message || 'Sign in failed');
            } else {
                toast.success('Welcome back!');
                router.push(returnTo);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (
        data: { email: string; password: string },
        captchaToken: string
    ) => {
        setIsLoading(true);
        try {
            const result = await signUp(data.email, data.password, { captchaToken });
            if (result.error) {
                toast.error(result.error.message || 'Sign up failed');
            } else {
                toast.success('Account created! Please check your email to verify.');
                setMode('signin');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithGoogle();
            if (result.error) {
                toast.error(result.error.message || 'Google sign in failed');
                setIsLoading(false);
            }
            // Note: Google OAuth redirects, so loading state persists
        } catch (error) {
            toast.error('An unexpected error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <GlassAuthCard
                    title={mode === 'signin' ? 'Welcome back' : 'Create an account'}
                    description={
                        mode === 'signin'
                            ? 'Sign in to your account to continue'
                            : 'Enter your details to get started'
                    }
                >
                    {/* Auth Form */}
                    {mode === 'signin' ? (
                        <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
                    ) : (
                        <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />
                    )}

                    {/* Separator */}
                    <div className="mt-6 relative">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                            OR
                        </span>
                    </div>

                    {/* Google OAuth Button */}
                    <div className="mt-6">
                        <SocialAuthButton
                            provider="google"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Mode Toggle */}
                    <div className="mt-6 text-center text-sm">
                        {mode === 'signin' ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('signup')}
                                    className="font-semibold text-primary hover:underline"
                                    disabled={isLoading}
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('signin')}
                                    className="font-semibold text-primary hover:underline"
                                    disabled={isLoading}
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </GlassAuthCard>
            </div>

            {/* Footer - replaces social media buttons */}
            <FooterBlock />
        </div>
    );
}
