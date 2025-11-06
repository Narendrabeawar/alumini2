"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackEvent } from "@/lib/analytics";

const RegisterSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
});

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(RegisterSchema) });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    setError(null);
    trackEvent("register_submit");

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
      trackEvent("register_success");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-green-600 to-blue-800 bg-clip-text text-transparent">
            Create your alumni account
          </h1>
          <p className="text-zinc-600 mt-2">Join Zexa Tech School, Ajmer Rajasthan alumni community</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white/90 backdrop-blur-sm shadow-lg p-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          {success ? (
            <div className="text-center">
              <div className="rounded-lg border border-green-200 bg-green-50 p-5">
                <h2 className="text-lg font-semibold mb-1">Check your email</h2>
                <p className="text-zinc-700">We've sent a confirmation link to your email.</p>
                <p className="text-sm text-zinc-500 mt-2">After verification you can <Link href="/login" className="text-blue-600 underline">login here</Link>.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Minimum 6 characters" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="text-xs text-zinc-500">Use at least 6 characters. You can set a stronger one later.</p>
              </div>
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>
          )}

          {!success && (
            <p className="mt-4 text-center text-sm text-zinc-600">
              Already have an account? <Link href="/login" className="text-blue-600 underline">Login</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

