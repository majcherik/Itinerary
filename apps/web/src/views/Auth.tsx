import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@itinerary/shared';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import SocialMediaLinks from '../components/SocialMediaLinks';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const router = useRouter();
    // usePathname doesn't return state, so we can't access location.state.from
    // We might need to use search params if we want to redirect back
    // For now, defaulting to '/' is fine or we can check search params if implemented
    // const location = usePathname(); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                router.push('/');
            } else {
                const { error } = await signUp(email, password);
                if (error) throw error;
                toast.success('Check your email for the confirmation link!');
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary p-4">
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
                                    <button
                                        type="button"
                                        className="text-sm text-text-secondary opacity-50 cursor-not-allowed"
                                        disabled
                                        aria-disabled="true"
                                        title="Password reset feature coming soon"
                                    >
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
                    <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button">
                        Login with Google
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
            <SocialMediaLinks />
        </div>
    );
};

export default Auth;
