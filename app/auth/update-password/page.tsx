"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthHero } from "@/components/auth/AuthHero";
import { Card } from "@/components/ui/Card";
import { PasswordField } from "@/components/PasswordField";
import { Button } from "@/components/ui/Button";

/**
 * Reached from the password-reset email (via /auth/callback, which establishes
 * a recovery session). The user sets a new password here.
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <AuthHero
        icon="password"
        title="Set a new password"
        subtitle="Choose a strong password you'll remember."
      />
      <Card padding="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <PasswordField
            id="password"
            label="New Password"
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
            Update password
          </Button>
        </form>
      </Card>
    </>
  );
}
