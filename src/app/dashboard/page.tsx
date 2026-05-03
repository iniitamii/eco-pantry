import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InventoryDashboard } from "@/components/InventoryDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "EcoPantry — My Pantry" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const items = await prisma.foodItem.findMany({
    where:   { userId, isDonated: false },
    orderBy: { expiryDate: "asc" },
  });

  return (
    <InventoryDashboard
      items={JSON.parse(JSON.stringify(items))}
      userName={session.user.name ?? "Friend"}
      userImage={session.user.image ?? null}
    />
  );
}
