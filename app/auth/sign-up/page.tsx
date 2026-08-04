"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthHero } from "@/components/auth/AuthHero";
import { Card } from "@/components/ui/Card";
import { FloatingInput } from "@/components/ui/fields";
import { PasswordField } from "@/components/PasswordField";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // Email confirmation disabled — straight into onboarding.
      router.replace("/");
      router.refresh();
    } else {
      // Confirmation email required.
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <>
        <AuthHero
          icon="mark_email_read"
          title="Check your email"
          subtitle={`We sent a confirmation link to ${email}. Tap it to activate your account.`}
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
        icon="family_restroom"
        title="Create your account"
        subtitle="Start tracking medications for your whole family."
      />
      <Card padding="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FloatingInput
            id="name"
            label="Full Name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FloatingInput
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading}>
            Create Account
          </Button>
          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Already have an account?
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
