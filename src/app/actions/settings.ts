"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SettingsSchema = z.object({
  listingsPublic:        z.boolean().default(true),
  notifyExpiryAlerts:    z.boolean().default(true),
  notifyDonationClaimed: z.boolean().default(true),
  notifyClaimConfirmed:  z.boolean().default(true),
});

export type SaveSettingsResult =
  | { success: true }
  | { success: false; error: string };

export async function saveSettings(
  data: z.infer<typeof SettingsSchema>
): Promise<SaveSettingsResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  const parsed = SettingsSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid settings" };

  try {
    await prisma.userSettings.upsert({
      where:  { userId },
      create: { userId, ...parsed.data },
      update: parsed.data,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("[saveSettings]", error);
    return { success: false, error: "Failed to save settings." };
  }
}

export async function getSettings() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  // Return defaults if no settings row exists yet
  return settings ?? {
    listingsPublic:        true,
    notifyExpiryAlerts:    true,
    notifyDonationClaimed: true,
    notifyClaimConfirmed:  true,
  };
}