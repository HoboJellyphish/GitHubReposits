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

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Middleware routes to the correct home (or /onboarding).
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <AuthHero
        icon="shield_person"
        title="Welcome back"
        subtitle="Sign in to manage your family's health."
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
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="-mt-2 flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="font-label-md text-label-md text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <p className="rounded-lg bg-error-container px-4 py-3 font-label-md text-label-md text-on-error-container">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading}>
            Sign In
          </Button>
          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Don&apos;t have an account?
            <Link
              href="/auth/sign-up"
              className="ml-1 font-button-text text-button-text text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </Card>
    </>
  );
}
