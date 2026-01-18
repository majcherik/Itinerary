"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useProfile, useUpdateProfile, usePreferences, useUpdatePreferences, useExportUserData, useResendVerificationEmail } from '@itinerary/shared';
import { toast } from 'sonner';
import { Shield, Key, Download, AlertTriangle, Mail } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';

const CURRENCIES = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'HKD', label: 'Hong Kong Dollar (HK$)' },
    { value: 'NZD', label: 'New Zealand Dollar (NZ$)' },
    { value: 'SEK', label: 'Swedish Krona (kr)' },
    { value: 'KRW', label: 'South Korean Won (₩)' },
    { value: 'SGD', label: 'Singapore Dollar (S$)' },
    { value: 'NOK', label: 'Norwegian Krone (kr)' },
    { value: 'MXN', label: 'Mexican Peso ($)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'RUB', label: 'Russian Ruble (₽)' },
    { value: 'ZAR', label: 'South African Rand (R)' },
    { value: 'TRY', label: 'Turkish Lira (₺)' },
    { value: 'BRL', label: 'Brazilian Real (R$)' },
    { value: 'TWD', label: 'Taiwan Dollar (NT$)' },
    { value: 'DKK', label: 'Danish Krone (kr)' },
    { value: 'PLN', label: 'Polish Zloty (zł)' },
    { value: 'THB', label: 'Thai Baht (฿)' },
    { value: 'IDR', label: 'Indonesian Rupiah (Rp)' },
    { value: 'MYR', label: 'Malaysian Ringgit (RM)' },
    { value: 'PHP', label: 'Philippine Peso (₱)' },
    { value: 'CZK', label: 'Czech Koruna (Kč)' },
    { value: 'AED', label: 'UAE Dirham (د.إ)' },
    { value: 'ILS', label: 'Israeli Shekel (₪)' },
];

export function GlassProfileSettingsCard() {
    const shouldReduceMotion = useReducedMotion();

    // Data Hooks
    const { data: profile, isLoading: isProfileLoading } = useProfile();
    const { data: preferences, isLoading: isPreferencesLoading } = usePreferences();
    const updateProfile = useUpdateProfile();
    const updatePreferences = useUpdatePreferences();
    const exportData = useExportUserData();
    const resendVerification = useResendVerificationEmail();

    // Local State
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [emailTripReminders, setEmailTripReminders] = useState(true);
    const [emailMarketing, setEmailMarketing] = useState(false);
    const [emailExpenseUpdates, setEmailExpenseUpdates] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    // Initialize state when data loads
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || "");
            setBio(profile.bio || "");
        }
    }, [profile]);

    useEffect(() => {
        if (preferences) {
            setCurrency(preferences.default_currency || "USD");
            if (preferences.notification_settings) {
                const settings = preferences.notification_settings as any;
                setEmailTripReminders(settings.email_trip_reminders ?? true);
                setEmailMarketing(settings.email_marketing ?? false);
                setEmailExpenseUpdates(settings.email_expense_updates ?? true);
            }
        }
    }, [preferences]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            // Parallel updates
            const profilePromise = updateProfile.mutateAsync({
                display_name: displayName,
                bio: bio,
            });

            const preferencesPromise = updatePreferences.mutateAsync({
                default_currency: currency as any,
                notification_settings: {
                    email_trip_reminders: emailTripReminders,
                    email_marketing: emailMarketing,
                    email_expense_updates: emailExpenseUpdates
                }
            });

            await Promise.all([profilePromise, preferencesPromise]);
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        }
    };

    const handleExportData = async () => {
        try {
            await exportData.mutateAsync({
                includeProfile: true,
                includeTrips: true,
                includeExpenses: true,
            });
            toast.success('Data exported successfully');
        } catch (error) {
            toast.error('Failed to export data');
            console.error(error);
        }
    };

    const handleResendVerification = async () => {
        try {
            await resendVerification.mutateAsync();
            toast.success('Verification email sent! Check your inbox.');
        } catch (error) {
            toast.error('Failed to send verification email');
            console.error(error);
        }
    };

    const handleReset = () => {
        if (profile) {
            setDisplayName(profile.display_name || "");
            setBio(profile.bio || "");
        }
        if (preferences) {
            setCurrency(preferences.default_currency || "USD");
            if (preferences.notification_settings) {
                setEmailTripReminders(preferences.notification_settings.email_trip_reminders ?? true);
                setEmailMarketing(preferences.notification_settings.email_marketing ?? false);
                setEmailExpenseUpdates(preferences.notification_settings.email_expense_updates ?? true);
            }
        }
        toast.info("Changes reset");
    };

    const isLoading = isProfileLoading || isPreferencesLoading;
    const isSaving = updateProfile.isPending || updatePreferences.isPending;

    // Get initials
    const initials = profile?.display_name
        ? profile.display_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    return (
        <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.45,
                ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
            }}
            className="group w-full max-w-3xl rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-12 relative"
            aria-labelledby="glass-profile-settings-title"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
            />
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Profile
                    </div>
                    <h1
                        id="glass-profile-settings-title"
                        className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl"
                    >
                        Profile settings
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Update your avatar, personal details, and notification preferences.
                    </p>
                </div>
                <Badge className="group gap-2 rounded-full border border-border/60 bg-white/5 px-4 py-2 text-muted-foreground transition-colors duration-300 hover:border-primary/60 hover:bg-primary/15 hover:text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                    {isSaving ? 'Saving...' : 'Ready to save'}
                </Badge>
            </div>

            <form className="grid gap-8 sm:grid-cols-5" onSubmit={handleSubmit}>
                <div className="sm:col-span-2">
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-background/40 p-6 backdrop-blur">
                        <Avatar className="h-24 w-24 border border-border/60">
                            <AvatarImage src={(profile as any)?.avatar_url || ""} />
                            <AvatarFallback className="text-lg bg-primary/20 text-primary font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">{profile?.display_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">
                                {profile?.email}
                            </p>
                        </div>
                        {/* Avatar upload could be implemented here */}
                        {/* <Button
              type="button"
              variant="outline"
              className="rounded-full border-border/60 bg-white/5 px-4 py-2 text-sm text-foreground"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Update avatar
            </Button> */}
                    </div>
                </div>

                <div className="space-y-6 sm:col-span-3">
                    <div className="space-y-2">
                        <Label htmlFor="profile-display-name">Display Name</Label>
                        <Input
                            id="profile-display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-email">Email address</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={profile?.email || ""}
                            disabled
                            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4 opacity-70 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="default_currency">Default Currency</Label>
                        <div className="relative">
                            <select
                                id="default_currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="flex h-11 w-full items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile-bio">Bio</Label>
                        <Textarea
                            id="profile-bio"
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            rows={4}
                            className="rounded-2xl border-border/60 bg-background/60 px-4 py-3 text-sm resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <p className="text-right text-xs text-muted-foreground">
                            {bio.length}/500 characters
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur">
                        <h2 className="text-sm font-medium text-foreground">
                            Notifications
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Choose the updates you want to receive.
                        </p>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between gap-3 text-sm text-muted-foreground cursor-pointer">
                                Trip Reminders
                                <Switch
                                    checked={emailTripReminders}
                                    onCheckedChange={setEmailTripReminders}
                                />
                            </label>
                            <label className="flex items-center justify-between gap-3 text-sm text-muted-foreground cursor-pointer">
                                Expense Updates
                                <Switch
                                    checked={emailExpenseUpdates}
                                    onCheckedChange={setEmailExpenseUpdates}
                                />
                            </label>
                            <label className="flex items-center justify-between gap-3 text-sm text-muted-foreground cursor-pointer">
                                Subscribe to newsletter
                                <Switch checked={emailMarketing} onCheckedChange={setEmailMarketing} />
                            </label>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-medium text-foreground">
                                Security & Data
                            </h2>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Manage your account security and data privacy.
                        </p>

                        <div className="space-y-4">
                            {/* Change Password */}
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Password
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowChangePassword(true)}
                                    className="h-8 text-xs border-border/60 bg-white/5"
                                >
                                    Change Password
                                </Button>
                            </div>

                            {/* Email Verification */}
                            <div className="flex items-center justify-between gap-3 border-t border-border/30 pt-3">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        Email Verification
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResendVerification}
                                    disabled={resendVerification.isPending}
                                    className="h-8 text-xs border-border/60 bg-white/5"
                                >
                                    {resendVerification.isPending ? 'Sending...' : 'Resend Email'}
                                </Button>
                            </div>

                            {/* Export Data */}
                            <div className="flex items-center justify-between gap-3 border-t border-border/30 pt-3">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        Export Data
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportData}
                                    disabled={exportData.isPending}
                                    className="h-8 text-xs border-border/60 bg-white/5"
                                >
                                    {exportData.isPending ? 'Exporting...' : 'Export Data'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 backdrop-blur">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <h2 className="text-sm font-medium text-destructive">
                                Danger Zone
                            </h2>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Irreversible account actions.
                        </p>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">Delete Account</span>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteAccount(true)}
                                className="h-8 text-xs"
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-border/60 bg-white/5 px-6 py-3 text-sm text-muted-foreground hover:text-primary h-auto"
                            onClick={handleReset}
                        >
                            Reset changes
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[0_20px_60px_-30px_rgba(79,70,229,0.75)] transition-transform duration-300 hover:-translate-y-1 h-auto"
                        >
                            {isSaving ? 'Saving...' : 'Save settings'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Modals */}
            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
            <DeleteAccountModal
                isOpen={showDeleteAccount}
                onClose={() => setShowDeleteAccount(false)}
            />
        </motion.div>
    );
}
