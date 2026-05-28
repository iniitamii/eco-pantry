import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MyDonationsClient } from "@/components/MyDonationsClient";

export const metadata: Metadata = { title: "EcoPantry — My Donations" };

export default async function MyDonationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).twoFactorPending) {
    redirect(`/login/verify?userId=${(session.user as any).id}`);
  }
  const userId = (session.user as any).id as string;

  const listings = await prisma.donationListing.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    include: {
      foodItem: true,
      claims: {
        include: { claimer: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const availableItems = await prisma.foodItem.findMany({
    where:   { userId, isDonated: false },
    orderBy: { expiryDate: "asc" },
  });

  return (
    <MyDonationsClient
      listings={JSON.parse(JSON.stringify(listings))}
      availableItems={JSON.parse(JSON.stringify(availableItems))}
    />
  );
}