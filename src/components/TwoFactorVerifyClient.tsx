"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyTwoFactorLogin } from "@/app/actions/two-factor";
import { signOut, useSession } from "next-auth/react";

export function TwoFactorVerifyClient() {
  const { update }                   = useSession();
  const [token, setToken]            = useState("");
  const [error, setError]            = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router                       = useRouter();
  const searchParams                 = useSearchParams();
  const userId                       = searchParams.get("userId") ?? "";

  function handleVerify() {
    if (!token || token.length !== 6) {
      setError("Please enter a 6-digit code.");
      return;
    }
    if (!userId) {
      setError("Invalid session. Please sign in again.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await verifyTwoFactorLogin(userId, token);
      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-700 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl text-stone-800 font-semibold">
              Two-factor auth
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8">
            {error && (
              <p className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="mb-5">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                Authentication code
              </label>
              <input
                value={token}
                onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleVerify()}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-center font-mono text-2xl tracking-widest bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={isPending || token.length !== 6}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying…</>
              ) : "Verify →"}
            </button>

            <p className="text-center text-xs text-stone-400 mt-4">
              Lost access?{" "}
              <span className="text-stone-500 font-medium">Enter one of your 8-digit backup codes instead.</span>
            </p>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}