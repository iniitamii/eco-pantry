import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MealPlannerClient } from "@/components/MealPlannerClient";

export const metadata: Metadata = { title: "EcoPantry — Meal Planner" };

export default async function MealPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return <MealPlannerClient />;
}