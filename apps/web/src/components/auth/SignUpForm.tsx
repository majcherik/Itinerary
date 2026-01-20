import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { PasswordInput } from '../ui/password-input';
import { Button } from '../ui/button';

// EXISTING password schema from current auth page - strict validation
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
    onSubmit: (data: SignUpFormData, captchaToken: string) => Promise<void>;
    isLoading: boolean;
}

/**
 * SignUpForm - Email/password registration form with strict validation
 * Features:
 * - NO first/last name fields (per requirements)
 * - Strict password validation (min 8, uppercase, lowercase, number, special char)
 * - Password confirmation field
 * - hCaptcha integration
 */
export const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, isLoading }) => {
    const captchaRef = React.useRef<HCaptcha>(null);
    const [captchaToken, setCaptchaToken] = React.useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema)
    });

    const handleFormSubmit = async (data: SignUpFormData) => {
        if (!captchaToken) {
            // Trigger captcha if not already verified
            captchaRef.current?.execute();
            return;
        }
        await onSubmit(data, captchaToken);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken('');
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                </label>
                <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    disabled={isLoading}
                    className="w-full"
                />
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                </label>
                <PasswordInput
                    id="signup-password"
                    placeholder="Create a strong password"
                    {...register('password')}
                    disabled={isLoading}
                    className="w-full"
                />
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
            </div>

            <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                </label>
                <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                    className="w-full"
                />
                {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
            </div>

            <HCaptcha
                ref={captchaRef}
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={setCaptchaToken}
                size="invisible"
            />

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>
        </form>
    );
};
