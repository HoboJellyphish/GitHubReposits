"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthHero } from "@/components/auth/AuthHero";
import { Card } from "@/components/ui/Card";
import { FloatingInput } from "@/components/ui/fields";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <>
        <AuthHero
          icon="mark_email_read"
          title="Email sent"
          subtitle={`If an account exists for ${email}, a reset link is on its way.`}
        />
        <Card padding="lg">
          <Link href="/auth/sign-in">
            <Button variant="secondary">Back to sign in</Button>
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <AuthHero
        icon="lock_reset"
        title="Reset password"
        subtitle="Enter your email and we'll send you a reset link."
      />
      <Card padding="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FloatingInput
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading}>
            Send reset link
          </Button>
          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Remembered it?
            <Link
              href="/auth/sign-in"
              className="ml-1 font-button-text text-button-text text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </Card>
    </>
  );
}
