import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkExpiryAndNotify } from "@/lib/expiry-check";

/**
 * GET /api/cron/expiry-alerts
 *
 * Loops all users with notifyExpiryAlerts=true and fires
 * checkExpiryAndNotify() for each one.
 *
 * Protected by CRON_SECRET env var (optional but recommended in prod).
 *
 * Local test:
 *   curl http://localhost:3000/api/cron/expiry-alerts
 *
 * With secret set:
 *   curl -H "Authorization: Bearer YOUR_SECRET" http://localhost:3000/api/cron/expiry-alerts
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Only fetch users who have alerts enabled — no need to run for everyone
    const eligibleUsers = await prisma.userSettings.findMany({
      where:  { notifyExpiryAlerts: true },
      select: { userId: true },
    });

    const results = await Promise.allSettled(
      eligibleUsers.map(({ userId }) => checkExpiryAndNotify(userId))
    );

    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed    = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({
      ok:        true,
      processed: eligibleUsers.length,
      succeeded,
      failed,
      ran_at:    new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/expiry-alerts]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}