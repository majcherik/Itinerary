"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, useReducedMotion } from "framer-motion";
import { FormEvent, useState } from "react";

interface GlassForgotPasswordCardProps {
  onBackToSignIn?: () => void;
  onSubmit?: (email: string) => Promise<void>;
}

export function GlassForgotPasswordCard({
  onBackToSignIn,
  onSubmit
}: GlassForgotPasswordCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email);
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
      }}
      className="group w-full max-w-md rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-10 relative"
      aria-labelledby="glass-forgot-password-title"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
      />
      <div className="mb-8 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Reset Password
        </div>
        <h1
          id="glass-forgot-password-title"
          className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl"
        >
          Trouble signing in?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email associated with your account. We'll send a magic link
          to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email address</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[0_18px_55px_-30px_rgba(79,70,229,0.75)] transition-transform duration-300 hover:-translate-y-1"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <motion.p
        role="status"
        initial={{ opacity: 0 }}
        animate={{ opacity: submitted ? 1 : 0 }}
        className="mt-6 text-center text-xs text-primary/80"
      >
        {submitted
          ? "Check your inbox for the reset link. It may take a few minutes to arrive."
          : "\u00A0"}
      </motion.p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Remembered your password?{" "}
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </button>
      </p>
    </motion.div>
  );
}
