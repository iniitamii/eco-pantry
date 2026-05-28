import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { SettingsClient } from "@/components/SettingsClient";
import { getTwoFactorStatus } from "@/app/actions/two-factor";

export const metadata: Metadata = { title: "EcoPantry — Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).twoFactorPending) {
    redirect(`/login/verify?userId=${(session.user as any).id}`);
  }
  const userId = (session.user as any).id as string;

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  const defaults = {
    listingsPublic:        true,
    notifyExpiryAlerts:    true,
    notifyDonationClaimed: true,
    notifyClaimConfirmed:  true,
    expiryAlertDays:       3,
  };

  const twoFactor = await getTwoFactorStatus();

  return (
    <SettingsClient
      settings={settings ?? defaults}
      twoFactor={twoFactor}
    />
  );
}