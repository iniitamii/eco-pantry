"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generate, verify, generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TwoFactorSetupResult =
  | { success: true;  secret: string; qrCode: string; backupCodes: string[] }
  | { success: false; error: string };

export type TwoFactorVerifyResult =
  | { success: true }
  | { success: false; error: string };

export type TwoFactorDisableResult =
  | { success: true }
  | { success: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function setupTwoFactor(): Promise<TwoFactorSetupResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) return { success: false, error: "User not found" };
    if (user.twoFactorEnabled) return { success: false, error: "2FA is already enabled" };

    // Generate secret
    const secret = generateSecret();

    // Generate QR code
    const otpAuthUrl = generateURI({
      label:  encodeURIComponent(user.email ?? userId),
      issuer: "EcoPantry",
      secret,
    });
    const qrCode = await QRCode.toDataURL(otpAuthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Store secret temporarily (not enabled yet — enabled after verification)
    await prisma.user.update({
      where: { id: userId },
      data:  { twoFactorSecret: secret },
    });

    // Store hashed backup codes
    await prisma.twoFactorBackupCode.deleteMany({ where: { userId } });
    await prisma.twoFactorBackupCode.createMany({
      data: await Promise.all(
        backupCodes.map(async code => ({
          userId,
          code: await bcrypt.hash(code, 10),
        }))
      ),
    });

    return { success: true, secret, qrCode, backupCodes };
  } catch (error) {
    console.error("[setupTwoFactor]", error);
    return { success: false, error: "Failed to set up 2FA." };
  }
}

export async function enableTwoFactor(token: string): Promise<TwoFactorVerifyResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorSecret) return { success: false, error: "2FA setup not started" };
    if (user.twoFactorEnabled)  return { success: false, error: "2FA already enabled" };

    const result = await verify({ token, secret: user.twoFactorSecret });
    if (!result?.valid) return { success: false, error: "Invalid code. Please try again." };

    await prisma.user.update({
      where: { id: userId },
      data:  { twoFactorEnabled: true },
    });

    return { success: true };
  } catch (error) {
    console.error("[enableTwoFactor]", error);
    return { success: false, error: "Failed to enable 2FA." };
  }
}

export async function disableTwoFactor(token: string): Promise<TwoFactorDisableResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled)  return { success: false, error: "2FA is not enabled" };
    if (!user?.twoFactorSecret)   return { success: false, error: "2FA secret not found" };

    const result = await verify({ token, secret: user.twoFactorSecret });
    if (!result?.valid) return { success: false, error: "Invalid code. Please try again." };

    await prisma.user.update({
      where: { id: userId },
      data:  { twoFactorEnabled: false, twoFactorSecret: null },
    });

    await prisma.twoFactorBackupCode.deleteMany({ where: { userId } });

    return { success: true };
  } catch (error) {
    console.error("[disableTwoFactor]", error);
    return { success: false, error: "Failed to disable 2FA." };
  }
}

export async function verifyTwoFactorLogin(
  userId: string,
  token: string
): Promise<TwoFactorVerifyResult> {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: userId },
      select:  { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
      return { success: false, error: "2FA not enabled" };
    }

    // Check TOTP token first
    const result = await verify({ token, secret: user.twoFactorSecret });
    if (result?.valid) {
      await prisma.user.update({
        where: { id: userId },
        data:  { twoFactorVerifiedAt: new Date() },
      });
      return { success: true };
    }

    // Fall back to backup codes
    const backupCodes = await prisma.twoFactorBackupCode.findMany({
      where: { userId, usedAt: null },
    });

    for (const backup of backupCodes) {
      const matches = await bcrypt.compare(token, backup.code);
      if (matches) {
        await prisma.twoFactorBackupCode.update({
          where: { id: backup.id },
          data:  { usedAt: new Date() },
        });
        await prisma.user.update({
          where: { id: userId },
          data:  { twoFactorVerifiedAt: new Date() },
        });
        return { success: true };
      }
    }

    return { success: false, error: "Invalid code. Please try again." };
  } catch (error) {
    console.error("[verifyTwoFactorLogin]", error);
    return { success: false, error: "Verification failed." };
  }
}

export async function getTwoFactorStatus(): Promise<{
  enabled: boolean;
  backupCodesRemaining: number;
}> {
  const session = await auth();
  if (!session?.user) return { enabled: false, backupCodesRemaining: 0 };
  const userId = (session.user as any).id as string;

  const [user, backupCount] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: userId },
      select: { twoFactorEnabled: true },
    }),
    prisma.twoFactorBackupCode.count({
      where: { userId, usedAt: null },
    }),
  ]);

  return {
    enabled:              user?.twoFactorEnabled ?? false,
    backupCodesRemaining: backupCount,
  };
}