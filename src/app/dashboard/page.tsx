import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InventoryDashboard } from "@/components/InventoryDashboard";
import { checkExpiryAndNotify } from "@/lib/expiry-check";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "EcoPantry — My Pantry" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  await checkExpiryAndNotify(userId);

  const [items, notifications] = await Promise.all([
    prisma.foodItem.findMany({
      where:   { userId, isDonated: false },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.notification.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    20,
    }),
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <InventoryDashboard
      items={JSON.parse(JSON.stringify(items))}
      userName={session.user.name ?? "Friend"}
      userImage={session.user.image ?? null}
      unreadCount={unreadCount}
      notifications={JSON.parse(JSON.stringify(notifications))}
    />
  );
}