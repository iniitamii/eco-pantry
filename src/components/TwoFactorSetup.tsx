"use client";

import { useState, useTransition } from "react";
import {
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
} from "@/app/actions/two-factor";

interface Props {
  enabled:              boolean;
  backupCodesRemaining: number;
  onStatusChange:       () => void;
}

export function TwoFactorSetup({ enabled, backupCodesRemaining, onStatusChange }: Props) {
  const [step, setStep]               = useState<"idle" | "setup" | "verify" | "backup" | "disable">("idle");
  const [qrCode, setQrCode]           = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken]             = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  function handleStartSetup() {
    setError(null);
    startTransition(async () => {
      const result = await setupTwoFactor();
      if (result.success) {
        setQrCode(result.qrCode);
        setBackupCodes(result.backupCodes);
        setStep("setup");
      } else {
        setError(result.error);
      }
    });
  }

  function handleVerify() {
    if (!token || token.length !== 6) {
      setError("Please enter a 6-digit code.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await enableTwoFactor(token);
      if (result.success) {
        setStep("backup");
        setToken("");
      } else {
        setError(result.error);
      }
    });
  }

  function handleDisable() {
    if (!token || token.length !== 6) {
      setError("Please enter a 6-digit code.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await disableTwoFactor(token);
      if (result.success) {
        setStep("idle");
        setToken("");
        onStatusChange();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDone() {
    setStep("idle");
    setQrCode(null);
    setBackupCodes([]);
    setToken("");
    onStatusChange();
  }

  // ── Idle state ──
  if (step === "idle") {
    return (
      <div className="divide-y divide-stone-50">
        <div className="flex items-start justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-700">
              Two-factor authentication
              {enabled && (
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Enabled
                </span>
              )}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              {enabled
                ? `Extra security is active. ${backupCodesRemaining} backup codes remaining.`
                : "Add an extra layer of security to your account with an authenticator app."}
            </p>
          </div>
          {enabled ? (
            <button
              onClick={() => { setStep("disable"); setError(null); }}
              className="shrink-0 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
            >
              Disable
            </button>
          ) : (
            <button
              onClick={handleStartSetup}
              disabled={isPending}
              className="shrink-0 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Setting up…" : "Enable 2FA"}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-4 py-2 mt-2">{error}</p>}
      </div>
    );
  }

  // ── Setup — show QR code ──
  if (step === "setup") {
    return (
      <div className="py-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 mb-1">Scan this QR code</p>
          <p className="text-xs text-stone-400">Open Google Authenticator, Authy, or any TOTP app and scan this code.</p>
        </div>
        {qrCode && (
          <div className="flex justify-center">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-2xl border border-stone-200" />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
            Enter the 6-digit code to confirm
          </label>
          <input
            value={token}
            onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 tracking-widest text-center font-mono text-lg"
          />
        </div>
        {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={isPending || token.length !== 6}
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isPending ? "Verifying…" : "Verify & Enable"}
          </button>
          <button
            onClick={() => { setStep("idle"); setError(null); setToken(""); }}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Backup codes ──
  if (step === "backup") {
    return (
      <div className="py-4 space-y-4">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Save your backup codes</p>
          <p className="text-xs text-amber-700">These codes can be used to access your account if you lose your authenticator. Each code can only be used once. Store them somewhere safe.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, i) => (
            <div key={i} className="bg-stone-100 rounded-xl px-3 py-2 font-mono text-sm text-stone-700 text-center tracking-widest">
              {code}
            </div>
          ))}
        </div>
        <button
          onClick={handleDone}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          ✓ I've saved my backup codes
        </button>
      </div>
    );
  }

  // ── Disable ──
  if (step === "disable") {
    return (
      <div className="py-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-stone-700 mb-1">Disable two-factor authentication</p>
          <p className="text-xs text-stone-400">Enter your current authenticator code to confirm.</p>
        </div>
        <input
          value={token}
          onChange={e => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 tracking-widest text-center font-mono text-lg"
        />
        {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleDisable}
            disabled={isPending || token.length !== 6}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isPending ? "Disabling…" : "Disable 2FA"}
          </button>
          <button
            onClick={() => { setStep("idle"); setError(null); setToken(""); }}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
}