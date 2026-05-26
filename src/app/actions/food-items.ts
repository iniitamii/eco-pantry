"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FoodCategory, FoodItemStatus, StorageLocation, type FoodItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/analytics";

const AddFoodItemSchema = z.object({
  name:            z.string().min(1, "Name is required").max(100).trim(),
  quantity:        z.coerce.number().positive("Must be greater than 0"),
  unit:            z.string().min(1).max(20).default("pcs"),
  category:        z.nativeEnum(FoodCategory, { error: "Invalid category" }),
  storageLocation: z.nativeEnum(StorageLocation).default("PANTRY"),
  status:          z.nativeEnum(FoodItemStatus).default("AVAILABLE"),
  expiryDate:      z.string()
    .refine(v => !isNaN(Date.parse(v)), { message: "Invalid date" })
    .transform(v => new Date(v)),
  notes: z.string().max(500).optional(),
});

export type AddFoodItemResult =
  | { success: true;  item: FoodItem }
  | { success: false; errors: Record<string, string[]> | string };

export type DeleteFoodItemResult =
  | { success: true }
  | { success: false; error: string };

export async function addFoodItem(formData: FormData): Promise<AddFoodItemResult> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: "Unauthorised" };
  const userId = (session.user as any).id as string;

  const parsed = AddFoodItemSchema.safeParse({
    name:            formData.get("name"),
    quantity:        Number(formData.get("quantity")),
    unit:            formData.get("unit") ?? "pcs",
    category:        formData.get("category"),
    storageLocation: formData.get("storageLocation") ?? "PANTRY",
    status:          formData.get("status") ?? "AVAILABLE",
    expiryDate:      formData.get("expiryDate"),
    notes:           formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const item = await prisma.foodItem.create({ data: { ...parsed.data, userId } });

    await logActivity({
      userId,
      foodItemId: item.id,
      actionType: "ITEM_ADDED",
      quantity:   item.quantity,
      unit:       item.unit,
      category:   item.category,
    });

    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    console.error("[addFoodItem]", error);
    return { success: false, errors: "Failed to save. Please try again." };
  }
}

export async function deleteFoodItem(itemId: string): Promise<DeleteFoodItemResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    // Fetch before deleting so we can log category/quantity
    const item = await prisma.foodItem.findUnique({ where: { id: itemId, userId } });
    if (!item) return { success: false, error: "Item not found" };

    await prisma.foodItem.delete({ where: { id: itemId, userId } });

    await logActivity({
      userId,
      foodItemId: itemId,
      actionType: "ITEM_USED",
      quantity:   item.quantity,
      unit:       item.unit,
      category:   item.category,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteFoodItem]", error);
    return { success: false, error: "Could not delete item." };
  }
}

export async function editFoodItem(
  itemId: string,
  formData: FormData
): Promise<AddFoodItemResult> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: "Unauthorised" };
  const userId = (session.user as any).id as string;

  const parsed = AddFoodItemSchema.safeParse({
    name:            formData.get("name"),
    quantity:        formData.get("quantity"),
    unit:            formData.get("unit") ?? "pcs",
    category:        formData.get("category"),
    storageLocation: formData.get("storageLocation") ?? "PANTRY",
    status:          formData.get("status") ?? "AVAILABLE",
    expiryDate:      formData.get("expiryDate"),
    notes:           formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const existing = await prisma.foodItem.findUnique({ where: { id: itemId, userId } });

    const item = await prisma.foodItem.update({
      where: { id: itemId, userId },
      data:  parsed.data,
    });

    // Log if status changed to USED or EXPIRED
    if (existing && existing.status !== parsed.data.status) {
      if (parsed.data.status === "USED" || parsed.data.status === "EXPIRED") {
        await logActivity({
          userId,
          foodItemId: item.id,
          actionType: parsed.data.status === "USED" ? "ITEM_USED" : "ITEM_EXPIRED",
          quantity:   item.quantity,
          unit:       item.unit,
          category:   item.category,
        });
      }
    }

    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    console.error("[editFoodItem]", error);
    return { success: false, errors: "Failed to update. Please try again." };
  }
}

export async function updateFoodItemStatus(
  itemId: string,
  status: FoodItemStatus
): Promise<DeleteFoodItemResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const item = await prisma.foodItem.update({
      where: { id: itemId, userId },
      data: {
        status,
        isDonated: status === FoodItemStatus.DONATED,
      },
    });

    await logActivity({
      userId,
      foodItemId: item.id,
      actionType: status === "USED"    ? "ITEM_USED"
                : status === "EXPIRED" ? "ITEM_EXPIRED"
                : status === "DONATED" ? "ITEM_DONATED"
                : "ITEM_ADDED",
      quantity:  item.quantity,
      unit:      item.unit,
      category:  item.category,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[updateFoodItemStatus]", error);
    return { success: false, error: "Could not update status." };
  }
}