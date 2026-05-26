import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { SettingsClient } from "@/components/SettingsClient";

export const metadata: Metadata = { title: "EcoPantry — Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  const defaults = {
    listingsPublic:        true,
    notifyExpiryAlerts:    true,
    notifyDonationClaimed: true,
    notifyClaimConfirmed:  true,
  };

  return (
    <SettingsClient
      settings={settings ?? defaults}
      userName={session.user.name ?? "Friend"}
      userImage={session.user.image ?? null}
    />
  );
}