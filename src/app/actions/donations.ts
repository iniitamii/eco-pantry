"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Create a donation listing ────────────────────────────────────────────────

export type CreateDonationResult =
  | { success: true }
  | { success: false; error: string };

export async function createDonation(
  foodItemId: string,
  message?: string
): Promise<CreateDonationResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    // Verify the food item belongs to this user
    const item = await prisma.foodItem.findUnique({
      where: { id: foodItemId, userId },
    });
    if (!item) return { success: false, error: "Item not found" };
    if (item.isDonated) return { success: false, error: "Item already listed for donation" };

    // Create listing and mark item as donated in one transaction
    await prisma.$transaction([
      prisma.donationListing.create({
        data: { foodItemId, userId, message: message ?? null },
      }),
      prisma.foodItem.update({
        where: { id: foodItemId },
        data:  { isDonated: true },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/donations");
    revalidatePath("/donations/mine");
    return { success: true };
  } catch (error) {
    console.error("[createDonation]", error);
    return { success: false, error: "Failed to create listing. Please try again." };
  }
}

// ─── Claim a donation ─────────────────────────────────────────────────────────

export type ClaimDonationResult =
  | { success: true }
  | { success: false; error: string };

export async function claimDonation(listingId: string): Promise<ClaimDonationResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const listing = await prisma.donationListing.findUnique({
      where: { id: listingId },
    });

    if (!listing)              return { success: false, error: "Listing not found" };
    if (!listing.isAvailable)  return { success: false, error: "This item has already been claimed" };
    if (listing.userId === userId) return { success: false, error: "You cannot claim your own donation" };

    await prisma.donationListing.update({
      where: { id: listingId },
      data:  { isAvailable: false, claimedAt: new Date() },
    });

    revalidatePath("/donations");
    return { success: true };
  } catch (error) {
    console.error("[claimDonation]", error);
    return { success: false, error: "Failed to claim. Please try again." };
  }
}

// ─── Remove a donation listing ────────────────────────────────────────────────

export type RemoveDonationResult =
  | { success: true }
  | { success: false; error: string };

export async function removeDonation(listingId: string): Promise<RemoveDonationResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const listing = await prisma.donationListing.findUnique({
      where: { id: listingId },
    });

    if (!listing)                  return { success: false, error: "Listing not found" };
    if (listing.userId !== userId) return { success: false, error: "Unauthorised" };

    // Delete listing and unmark item as donated in one transaction
    await prisma.$transaction([
      prisma.donationListing.delete({ where: { id: listingId } }),
      prisma.foodItem.update({
        where: { id: listing.foodItemId },
        data:  { isDonated: false },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/donations");
    revalidatePath("/donations/mine");
    return { success: true };
  } catch (error) {
    console.error("[removeDonation]", error);
    return { success: false, error: "Failed to remove listing." };
  }
}