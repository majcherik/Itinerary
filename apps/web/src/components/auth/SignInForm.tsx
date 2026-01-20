import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { PasswordInput } from '../ui/password-input';
import { Button } from '../ui/button';

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
    onSubmit: (data: SignInFormData, captchaToken: string) => Promise<void>;
    isLoading: boolean;
}

/**
 * SignInForm - Email/password sign-in form with hCaptcha validation
 * Features React Hook Form, Zod schema validation, and invisible hCaptcha
 */
export const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, isLoading }) => {
    const captchaRef = React.useRef<HCaptcha>(null);
    const [captchaToken, setCaptchaToken] = React.useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema)
    });

    const handleFormSubmit = async (data: SignInFormData) => {
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
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <Input
                    id="email"
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
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>
                <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    {...register('password')}
                    disabled={isLoading}
                    className="w-full"
                />
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
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
                Sign In
            </Button>
        </form>
    );
};
