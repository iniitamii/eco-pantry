import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  type:   NotificationType;
  title:  string;
  body:   string;
  refId?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type:   params.type,
        title:  params.title,
        body:   params.body,
        refId:  params.refId ?? null,
      },
    });
  } catch (error) {
    // Non-critical — never break the main action
    console.error("[createNotification]", error);
  }
}