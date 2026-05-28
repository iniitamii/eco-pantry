import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { FoodItem } from "@prisma/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_NAMES_IN_NOTIFICATION = 3;
const DEFAULT_WARNING_DAYS = 3;
const CRITICAL_DAYS = 1; // "expiring today/tomorrow" window

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diffDays(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatItemNames(items: FoodItem[]): string {
  const names = items
    .slice(0, MAX_NAMES_IN_NOTIFICATION)
    .map((i) => i.name)
    .join(", ");
  const extra =
    items.length > MAX_NAMES_IN_NOTIFICATION
      ? ` and ${items.length - MAX_NAMES_IN_NOTIFICATION} more`
      : "";
  return `${names}${extra}`;
}

async function wasAlreadyNotifiedToday(userId: string): Promise<boolean> {
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type:      "EXPIRY_ALERT",
      createdAt: { gte: todayUTC },
    },
    select: { id: true },
  });

  return !!existing;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function checkExpiryAndNotify(userId: string): Promise<void> {
  try {
    // Check user preference before any DB work
    const settings = await prisma.userSettings.findUnique({
      where:  { userId },
      select: { notifyExpiryAlerts: true, expiryAlertDays: true },
    });
    if (settings && !settings.notifyExpiryAlerts) return;
    const WARNING_DAYS = settings?.expiryAlertDays ?? DEFAULT_WARNING_DAYS;

    // One dedup check — if we already sent an EXPIRY_ALERT today, bail out early
    if (await wasAlreadyNotifiedToday(userId)) return;

    const now = new Date();
    const windowEnd = new Date();
    windowEnd.setDate(now.getDate() + WARNING_DAYS);

    // Only AVAILABLE/PLANNED, strictly between now and the warning window
    const expiringItems = await prisma.foodItem.findMany({
      where: {
        userId,
        status:     { in: ["AVAILABLE", "PLANNED"] },
        expiryDate: { gte: now, lte: windowEnd },
      },
      orderBy: { expiryDate: "asc" },
    });

    if (expiringItems.length === 0) return;

    // Split into critical (today/tomorrow) vs warning (2–3 days)
    const criticalItems = expiringItems.filter((i) => diffDays(i.expiryDate) <= CRITICAL_DAYS);
    const warningItems  = expiringItems.filter((i) => diffDays(i.expiryDate) >  CRITICAL_DAYS);

    // Build a single notification that covers both tiers if both exist,
    // or a focused one if only one tier has items.
    let title: string;
    let body: string;

    if (criticalItems.length > 0 && warningItems.length > 0) {
      title = `⚠️ ${expiringItems.length} item${expiringItems.length > 1 ? "s" : ""} expiring soon`;
      body  = `🔴 Urgent: ${formatItemNames(criticalItems)} expire today/tomorrow. `
            + `🟡 Also expiring in ${WARNING_DAYS} days: ${formatItemNames(warningItems)}. Use or donate them!`;
    } else if (criticalItems.length > 0) {
      const count = criticalItems.length;
      title = `🔴 ${count} item${count > 1 ? "s" : ""} expiring today or tomorrow!`;
      body  = `${formatItemNames(criticalItems)} ${count > 1 ? "are" : "is"} about to expire. Use or donate now before it's too late.`;
    } else {
      const count = warningItems.length;
      title = `🟡 ${count} item${count > 1 ? "s" : ""} expiring within ${WARNING_DAYS} days`;
      body  = `${formatItemNames(warningItems)} will expire soon. Consider using or donating them while they're still good.`;
    }

    await createNotification({
      userId,
      type:  "EXPIRY_ALERT",
      title,
      body,
      foodItemId: expiringItems[0].id,
    });
  } catch (error) {
    console.error("[checkExpiryAndNotify]", error);
  }
}