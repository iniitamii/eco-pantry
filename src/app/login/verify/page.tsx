import { Metadata } from "next";
import { Suspense } from "react";
import { TwoFactorVerifyClient } from "@/components/TwoFactorVerifyClient";

export const metadata: Metadata = { title: "EcoPantry — Two-Factor Authentication" };

export default function TwoFactorVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    }>
      <TwoFactorVerifyClient />
    </Suspense>
  );
}