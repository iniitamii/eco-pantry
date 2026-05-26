import { FoodActionType, FoodCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface LogActivityParams {
  userId:     string;
  foodItemId: string;
  actionType: FoodActionType;
  quantity:   number;
  unit:       string;
  category:   FoodCategory;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.foodAnalyticsLog.create({
      data: {
        userId:     params.userId,
        foodItemId: params.foodItemId,
        actionType: params.actionType,
        quantity:   params.quantity,
        unit:       params.unit,
        category:   params.category,
      },
    });
  } catch (error) {
    // Analytics logging is non-critical — never let it break the main action
    console.error("[logActivity]", error);
  }
}