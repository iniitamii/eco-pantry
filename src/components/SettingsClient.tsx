"use client";

import { useState, useTransition } from "react";
import { Navbar } from "./Navbar";
import { saveSettings } from "@/app/actions/settings";
import { getTwoFactorStatus } from "@/app/actions/two-factor";
import { TwoFactorSetup } from "./TwoFactorSetup";

interface Settings {
  listingsPublic:        boolean;
  notifyExpiryAlerts:    boolean;
  notifyDonationClaimed: boolean;
  notifyClaimConfirmed:  boolean;
  expiryAlertDays:       number;
}

interface TwoFactorStatus {
  enabled:              boolean;
  backupCodesRemaining: number;
}

interface Props {
  settings:    Settings;
  twoFactor:   TwoFactorStatus;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label:       string;
  description: string;
  checked:     boolean;
  onChange:    (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-700">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-emerald-600" : "bg-stone-200"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`} />
      </button>
    </div>
  );
}

export function SettingsClient({ settings: initial, twoFactor: initialTwoFactor }: Props) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [twoFactor, setTwoFactor] = useState<TwoFactorStatus>(initialTwoFactor);

  async function refreshTwoFactorStatus() {
    const status = await getTwoFactorStatus();
    setTwoFactor(status);
  }

  function update(key: keyof Settings, value: boolean | number) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveSettings(settings);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <Navbar />

        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl text-stone-800">
              ⚙️ Settings
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm">
              Manage your preferences and notification settings.
            </p>
          </div>

          {/* Donations section */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Donations
            </h2>
            <div className="divide-y divide-stone-50">
              <Toggle
                label="Public listings"
                description="Allow other users to see and request your donation listings."
                checked={settings.listingsPublic}
                onChange={v => update("listingsPublic", v)}
              />
            </div>
          </div>

          {/* Notifications section */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Notifications
            </h2>
            <div className="divide-y divide-stone-50">
            <Toggle
                label="Expiry alerts"
                description={`Notify me when items are expiring within ${settings.expiryAlertDays} day${settings.expiryAlertDays > 1 ? "s" : ""}.`}
                checked={settings.notifyExpiryAlerts}
                onChange={v => update("notifyExpiryAlerts", v)}
              />

              {settings.notifyExpiryAlerts && (
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-700">Alert threshold</p>
                    <p className="text-xs text-stone-400 mt-0.5">How many days before expiry to notify you.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => update("expiryAlertDays", Math.max(1, settings.expiryAlertDays - 1))}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold transition-colors"
                    >−</button>
                    <span className="w-6 text-center text-sm font-semibold text-stone-700">
                      {settings.expiryAlertDays}
                    </span>
                    <button
                      onClick={() => update("expiryAlertDays", Math.min(14, settings.expiryAlertDays + 1))}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
              )}
              <Toggle
                label="Donation claimed"
                description="Notify me when someone confirms my donation request."
                checked={settings.notifyDonationClaimed}
                onChange={v => update("notifyDonationClaimed", v)}
              />
              <Toggle
                label="Claim confirmed"
                description="Notify me when a donor confirms my claim request."
                checked={settings.notifyClaimConfirmed}
                onChange={v => update("notifyClaimConfirmed", v)}
              />
            </div>
        </div>

          {/* Security section */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Security
            </h2>
            <TwoFactorSetup
              enabled={twoFactor.enabled}
              backupCodesRemaining={twoFactor.backupCodesRemaining}
              onStatusChange={refreshTwoFactorStatus}
            />
          </div>

          {/* Save button */}
          {error && (
            <p className="mb-3 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</p>
          )}
          {saved && (
            <p className="mb-3 text-sm text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2">
              ✅ Settings saved successfully.
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {isPending ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </>
  );
}