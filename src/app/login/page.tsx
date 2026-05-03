"use client";

import { useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { registerUser } from "@/app/actions/register";

type Mode = "login" | "register";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode]           = useState<Mode>("login");
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    );
  }

  // ── Credentials sign in ──
  async function handleCredentialsLogin(formData: FormData) {
    setError(null);
    const email    = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === "CredentialsSignin"
        ? "Incorrect email or password"
        : result.error
      );
    } else {
      router.push("/dashboard");
    }
  }

  // ── Register ──
  function handleRegister(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await registerUser(formData);
      if (result.success) {
        setSuccess("Account created! Signing you in…");
        // Auto sign in after register
        const email    = formData.get("email") as string;
        const password = formData.get("password") as string;
        await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
      } else {
        setError(typeof result.errors === "string"
          ? result.errors
          : Object.values(result.errors as Record<string, string[]>).flat()[0]
        );
      }
    });
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full max-w-sm">

          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-700 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🌿</span>
            </div>
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl text-stone-800 font-semibold">EcoPantry</h1>
            <p className="text-stone-500 text-sm mt-1">Reduce waste. Eat smart. Live sustainably.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8">

            {/* Mode toggle */}
            <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
              {(["login", "register"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                    mode === m ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Error / Success */}
            {error && (
              <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">{success}</p>
            )}

            {/* Credentials Form */}
            <form action={mode === "login" ? handleCredentialsLogin : handleRegister} className="space-y-3 mb-5">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Name</label>
                  <input
                    name="name" type="text" required placeholder="Your name"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-stone-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  name="email" type="email" required placeholder="you@example.com"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Password</label>
                <input
                  name="password" type="password" required placeholder="••••••••"
                  minLength={8}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-stone-300"
                />
                {mode === "register" && (
                  <p className="text-xs text-stone-400 mt-1">Minimum 8 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2 mt-1"
              >
                {isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing…</>
                ) : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-400 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-2">
              {/* Google */}
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 text-stone-700 font-semibold rounded-xl py-2.5 text-sm transition-colors border border-stone-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-stone-400 mt-6">By signing in, you agree to reduce food waste 🌱</p>
        </div>
      </div>
    </>
  );
}