"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { FoodCategory, type FoodItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const AddFoodItemSchema = z.object({
  name:       z.string().min(1, "Name is required").max(100).trim(),
  quantity: z.coerce.number().positive("Must be greater than 0"),
  unit:       z.string().min(1).max(20).default("pcs"),
  category: z.nativeEnum(FoodCategory, { error: "Invalid category" }),
  expiryDate: z.string()
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, errors: "Unauthorised" };
  const userId = (session.user as any).id as string;

  const parsed = AddFoodItemSchema.safeParse({
    name:       formData.get("name"),
    quantity:   Number(formData.get("quantity")),
    unit:       formData.get("unit") ?? "pcs",
    category:   formData.get("category"),
    expiryDate: formData.get("expiryDate"),
    notes:      formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const item = await prisma.foodItem.create({ data: { ...parsed.data, userId } });
    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    console.error("[addFoodItem]", error);
    return { success: false, errors: "Failed to save. Please try again." };
  }
}

export async function deleteFoodItem(itemId: string): Promise<DeleteFoodItemResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    await prisma.foodItem.delete({ where: { id: itemId, userId } });
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
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, errors: "Unauthorised" };
  const userId = (session.user as any).id as string;

  const parsed = AddFoodItemSchema.safeParse({
    name:       formData.get("name"),
    quantity:   formData.get("quantity"),
    unit:       formData.get("unit") ?? "pcs",
    category:   formData.get("category"),
    expiryDate: formData.get("expiryDate"),
    notes:      formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  try {
    const item = await prisma.foodItem.update({
      where: { id: itemId, userId },
      data:  parsed.data,
    });
    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    console.error("[editFoodItem]", error);
    return { success: false, errors: "Failed to update. Please try again." };
  }
}