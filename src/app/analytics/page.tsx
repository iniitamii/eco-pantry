import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AnalyticsClient } from "@/components/AnalyticsClient";

export const metadata: Metadata = { title: "EcoPantry — Analytics" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).twoFactorPending) {
    redirect(`/login/verify?userId=${(session.user as any).id}`);
  }
  const userId = (session.user as any).id as string;

  // Summary counts
  const [totalAdded, totalUsed, totalDonated, totalExpired, totalClaimed] =
    await Promise.all([
      prisma.foodAnalyticsLog.count({ where: { userId, actionType: "ITEM_ADDED"       } }),
      prisma.foodAnalyticsLog.count({ where: { userId, actionType: "ITEM_USED"        } }),
      prisma.foodAnalyticsLog.count({ where: { userId, actionType: "ITEM_DONATED"     } }),
      prisma.foodAnalyticsLog.count({ where: { userId, actionType: "ITEM_EXPIRED"     } }),
      prisma.foodAnalyticsLog.count({ where: { userId, actionType: "DONATION_CLAIMED" } }),
    ]);

  // Last 30 days activity for the chart
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const recentLogs = await prisma.foodAnalyticsLog.findMany({
    where:   { userId, loggedAt: { gte: since } },
    orderBy: { loggedAt: "asc" },
    select:  { actionType: true, loggedAt: true, category: true },
  });

  // Category breakdown (items saved = USED + DONATED)
  const categoryLogs = await prisma.foodAnalyticsLog.findMany({
    where: {
      userId,
      actionType: { in: ["ITEM_USED", "ITEM_DONATED"] },
    },
    select: { category: true },
  });

  const categoryBreakdown = categoryLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.category] = (acc[log.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AnalyticsClient
      stats={{ totalAdded, totalUsed, totalDonated, totalExpired, totalClaimed }}
      recentLogs={JSON.parse(JSON.stringify(recentLogs))}
      categoryBreakdown={categoryBreakdown}
    />
  );
}