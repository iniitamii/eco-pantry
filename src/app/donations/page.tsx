import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DonationsClient } from "@/components/DonationsClient";

export const metadata: Metadata = { title: "EcoPantry — Community Donations" };

export default async function DonationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  // Fetch all available listings — excluding the current user's own listings
  const listings = await prisma.donationListing.findMany({
    where:   { isAvailable: true, userId: { not: userId } },
    orderBy: { createdAt: "desc" },
    include: {
      foodItem: true,
      user:     { select: { name: true, image: true } },
    },
  });

  return (
    <DonationsClient
      listings={JSON.parse(JSON.stringify(listings))}
      currentUserId={userId}
    />
  );
}