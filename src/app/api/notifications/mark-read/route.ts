import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const userId = (session.user as any).id as string;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });

  return NextResponse.json({ success: true });
}