import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MealPlannerClient } from "@/components/MealPlannerClient";

export const metadata: Metadata = { title: "EcoPantry — Meal Planner" };

export default async function MealPlanPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <MealPlannerClient />;
}