"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"password" | "magic" | "invite">(inviteCode ? "invite" : "password");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (magicError) throw magicError;

      router.push(`/login?sent=true&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Lookup invite and get email
      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .select("code, status, imported_alumni:imported_alumni(email)")
        .eq("code", inviteCode)
        .single();

      if (inviteError || !invite) throw new Error("Invalid invite code");

      const targetEmail = (invite.imported_alumni as any)?.email;
      if (!targetEmail) throw new Error("Invite has no associated email");

      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (magicError) throw magicError;

      router.push(`/login?sent=true&invite=${encodeURIComponent(inviteCode)}`);
    } catch (err: any) {
      setError(err.message || "Failed to send invite magic link");
    } finally {
      setLoading(false);
    }
  }

  const sent = searchParams.get("sent") === "true";

  if (sent) {
    const emailParam = searchParams.get("email");
    const inviteParam = searchParams.get("invite");
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-green-200 bg-white/90 backdrop-blur-sm shadow-lg p-8 text-center"
        >
          <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">Check Your Email</h2>
          <p className="text-zinc-700">
            {emailParam ? (
              <>We've sent a magic link to <strong>{emailParam}</strong>. Click the link to login.</>
            ) : (
              <>Magic link sent to the invited email. Check your inbox.</>
            )}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-green-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-600">Login to your alumni account</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white/90 backdrop-blur-sm shadow-lg p-6">
          {/* Mode selector */}
          <div className="mb-6 flex gap-1 border-b border-zinc-200">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === "password"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === "magic"
                  ? "border-b-2 border-green-600 text-green-600 font-semibold"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => setMode("invite")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === "invite"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Admin Invite
            </button>
          </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        )}

        {mode === "magic" && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-magic">Email</Label>
              <Input
                id="email-magic"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600" disabled={loading}>
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        )}

        {mode === "invite" && (
          <form onSubmit={handleInviteLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                placeholder="Enter invite code from admin"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600" disabled={loading}>
              {loading ? "Sending..." : "Send Magic Link to Invited Email"}
            </Button>
          </form>
        )}

          <p className="mt-4 text-center text-sm text-zinc-600">
            Don't have an account? <Link href="/register" className="text-blue-600 underline font-medium">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
