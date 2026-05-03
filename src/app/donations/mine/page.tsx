import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MyDonationsClient } from "@/components/MyDonationsClient";

export const metadata: Metadata = { title: "EcoPantry — My Donations" };

export default async function MyDonationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const listings = await prisma.donationListing.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    include: { foodItem: true },
  });

  // Fetch non-donated items so user can create new listings
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