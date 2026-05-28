import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId:      string;
  type:        NotificationType;
  title:       string;
  body:        string;
  foodItemId?: string;
  listingId?:  string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type:   params.type,
        title:  params.title,
        body:   params.body,
        ...(params.foodItemId && { foodItemId: params.foodItemId }),
        ...(params.listingId  && { listingId:  params.listingId  }),
      },
    });
  } catch (error) {
    console.error("[createNotification]", error);
  }
}