"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/analytics";
import { createNotification } from "@/lib/notifications";

// ─── Create a donation listing ────────────────────────────────────────────────

export type CreateDonationResult =
  | { success: true }
  | { success: false; error: string };

export async function createDonation(
  foodItemId: string,
  message?: string,
  pickupLocation?: string,
  pickupNotes?: string,
): Promise<CreateDonationResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const item = await prisma.foodItem.findUnique({
      where: { id: foodItemId, userId },
    });
    if (!item) return { success: false, error: "Item not found" };
    if (item.isDonated) return { success: false, error: "Item already listed for donation" };

    await prisma.$transaction([
      prisma.donationListing.create({
        data: {
          foodItemId,
          userId,
          message:        message        ?? null,
          pickupLocation: pickupLocation ?? null,
          pickupNotes:    pickupNotes    ?? null,
        },
      }),
      prisma.foodItem.update({
        where: { id: foodItemId },
        data:  { isDonated: true, status: "PLANNED" },
      }),
    ]);

    await logActivity({
      userId,
      foodItemId,
      actionType: "ITEM_DONATED",
      quantity:   item.quantity,
      unit:       item.unit,
      category:   item.category,
    });

    revalidatePath("/dashboard");
    revalidatePath("/donations");
    revalidatePath("/donations/mine");
    return { success: true };
  } catch (error) {
    console.error("[createDonation]", error);
    return { success: false, error: "Failed to create listing. Please try again." };
  }
}

// ─── Request to claim a donation (creates a DonationClaim) ───────────────────

export type ClaimDonationResult =
  | { success: true }
  | { success: false; error: string };

export async function claimDonation(
  listingId: string,
  message?: string,
): Promise<ClaimDonationResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const listing = await prisma.donationListing.findUnique({
      where:   { id: listingId },
      include: {
        claims:   { where: { claimerId: userId } },
        foodItem: true,
      },
    });

    if (!listing)                  return { success: false, error: "Listing not found" };
    if (!listing.isAvailable)      return { success: false, error: "This item has already been claimed" };
    if (listing.userId === userId) return { success: false, error: "You cannot claim your own donation" };
    if (listing.claims.length > 0) return { success: false, error: "You have already requested this item" };

    await prisma.donationClaim.create({
      data: {
        listingId,
        claimerId: userId,
        message:   message ?? null,
        status:    "PENDING",
      },
    });

    // Notify the donor that someone requested their item
    await createNotification({
      userId:    listing.userId,
      type:      "DONATION_CLAIMED",
      title:     "Someone wants your donation 🤝",
      body:      `A new request came in for ${listing.foodItem.name}. Go to My Donations to confirm.`,
      listingId: listingId,
    });

    revalidatePath("/donations");
    return { success: true };
  } catch (error) {
    console.error("[claimDonation]", error);
    return { success: false, error: "Failed to request item. Please try again." };
  }
}

// ─── Confirm a claim (donor accepts a requester) ──────────────────────────────

export type ConfirmClaimResult =
  | { success: true }
  | { success: false; error: string };

export async function confirmClaim(claimId: string): Promise<ConfirmClaimResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const claim = await prisma.donationClaim.findUnique({
      where:   { id: claimId },
      include: { listing: { include: { foodItem: true } } },
    });

    if (!claim)                          return { success: false, error: "Claim not found" };
    if (claim.listing.userId !== userId) return { success: false, error: "Unauthorised" };
    if (!claim.listing.isAvailable)      return { success: false, error: "Item already confirmed for someone else" };

    await prisma.$transaction([
      prisma.donationClaim.update({
        where: { id: claimId },
        data:  { status: "CONFIRMED" },
      }),
      prisma.donationClaim.updateMany({
        where: { listingId: claim.listingId, id: { not: claimId } },
        data:  { status: "CANCELLED" },
      }),
      prisma.donationListing.update({
        where: { id: claim.listingId },
        data:  { isAvailable: false },
      }),
    ]);

    await logActivity({
      userId:     claim.listing.userId,
      foodItemId: claim.listing.foodItemId,
      actionType: "DONATION_CLAIMED",
      quantity:   claim.listing.foodItem.quantity,
      unit:       claim.listing.foodItem.unit,
      category:   claim.listing.foodItem.category,
    });

    await createNotification({
      userId:    claim.claimerId,
      type:      "CLAIM_CONFIRMED",
      title:     "Your request was confirmed! 🎉",
      body:      `${claim.listing.foodItem.name} is yours. Check the pickup details.`,
      listingId: claim.listing.id,
    });

    await createNotification({
      userId:    claim.listing.userId,
      type:      "DONATION_CLAIMED",
      title:     "Your donation was claimed 🤝",
      body:      `Someone picked up your ${claim.listing.foodItem.name}.`,
      listingId: claim.listing.id,
    });

    revalidatePath("/donations");
    revalidatePath("/donations/mine");
    return { success: true };
  } catch (error) {
    console.error("[confirmClaim]", error);
    return { success: false, error: "Failed to confirm claim." };
  }
}

// ─── Remove a donation listing ────────────────────────────────────────────────

export type RemoveDonationResult =
  | { success: true }
  | { success: false; error: string };

export async function removeDonation(listingId: string): Promise<RemoveDonationResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const listing = await prisma.donationListing.findUnique({
      where: { id: listingId },
    });

    if (!listing)                  return { success: false, error: "Listing not found" };
    if (listing.userId !== userId) return { success: false, error: "Unauthorised" };

    await prisma.$transaction([
      prisma.donationClaim.deleteMany({ where: { listingId } }),
      prisma.donationListing.delete({ where: { id: listingId } }),
      prisma.foodItem.update({
        where: { id: listing.foodItemId },
        data:  { isDonated: false, status: "AVAILABLE" },
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