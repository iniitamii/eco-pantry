"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FoodItem } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MealSuggestion {
  id:          string;
  name:        string;
  description: string;
  ingredients: string[];
  servings:    number;
  prepMinutes: number;
  prioritises: string[];
  isCooked:    boolean;
  cookedAt:    string | null;
}

export interface MealPlan {
  id:               string;
  generatedAt:      string;
  suggestions:      MealSuggestion[];
  shoppingList:     string[];
  wasteReductionTip: string;
}

export type MealPlanResult =
  | { success: true;  mealPlan: MealPlan }
  | { success: false; error: string };

export type SavedPlansResult =
  | { success: true;  mealPlans: MealPlan[] }
  | { success: false; error: string };

export type MarkCookedResult =
  | { success: true }
  | { success: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(date: Date | string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function buildPrompt(items: FoodItem[]): string {
  const itemList = items.map(item => {
    const days    = daysUntil(item.expiryDate);
    const urgency = days < 0 ? "EXPIRED" : days <= 3 ? "URGENT" : days <= 7 ? "SOON" : "OK";
    return `- ${item.name} (${item.quantity} ${item.unit}, expires in ${days}d [${urgency}])`;
  }).join("\n");

  return `
You are EcoPantry's AI Chef. Help reduce food waste by creating meal plans from available ingredients.

## Available Pantry Items
${itemList}

## Task
Generate 3 meal suggestions that:
1. PRIORITISE ingredients marked URGENT or SOON first
2. Are practical and family-friendly
3. Minimise waste by using multiple expiring items together

Respond ONLY with valid JSON matching this exact structure, no markdown, no extra text:
{
  "suggestions": [
    {
      "name": "meal name",
      "description": "1-2 sentence description",
      "ingredients": ["ingredient1", "ingredient2"],
      "servings": 4,
      "prepMinutes": 20,
      "prioritises": ["near-expiry item names used"]
    }
  ],
  "shoppingList": ["extra items needed"],
  "wasteReductionTip": "one actionable tip"
}
`.trim();
}

function formatPlan(plan: any): MealPlan {
  return {
    id:               plan.id,
    generatedAt:      plan.generatedAt.toISOString(),
    wasteReductionTip: plan.wasteReductionTip,
    shoppingList:     plan.shoppingList as string[],
    suggestions:      plan.suggestions.map((s: any) => ({
      id:          s.id,
      name:        s.name,
      description: s.description,
      ingredients: s.ingredients as string[],
      servings:    s.servings,
      prepMinutes: s.prepMinutes,
      prioritises: s.prioritises as string[],
      isCooked:    s.isCooked,
      cookedAt:    s.cookedAt ? s.cookedAt.toISOString() : null,
    })),
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function generateMealPlan(): Promise<MealPlanResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  const items = await prisma.foodItem.findMany({
    where:   { userId, isDonated: false },
    orderBy: { expiryDate: "asc" },
  });

  if (items.length === 0) {
    return { success: false, error: "Your pantry is empty. Add some items first!" };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });

    const result  = await model.generateContent(buildPrompt(items));
    const rawText = result.response.text();

    let parsed: any;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[generateMealPlan] No JSON found:", rawText);
        return { success: false, error: "AI returned unexpected format. Please try again." };
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("[generateMealPlan] JSON parse failed:", rawText);
      return { success: false, error: "AI returned unexpected format. Please try again." };
    }

    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
      return { success: false, error: "No suggestions generated. Please try again." };
    }

    // Save to database
    const saved = await prisma.mealPlan.create({
      data: {
        userId,
        wasteReductionTip: parsed.wasteReductionTip ?? "",
        shoppingList:      parsed.shoppingList ?? [],
        suggestions: {
          create: parsed.suggestions.map((s: any) => ({
            name:        s.name,
            description: s.description,
            ingredients: s.ingredients ?? [],
            servings:    s.servings    ?? 2,
            prepMinutes: s.prepMinutes ?? 30,
            prioritises: s.prioritises ?? [],
          })),
        },
      },
      include: { suggestions: true },
    });

    return { success: true, mealPlan: formatPlan(saved) };

  } catch (error) {
    console.error("[generateMealPlan] error:", error);
    return { success: false, error: "Could not reach AI service. Check your GEMINI_API_KEY." };
  }
}

export async function getSavedMealPlans(): Promise<SavedPlansResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const plans = await prisma.mealPlan.findMany({
      where:   { userId },
      orderBy: { generatedAt: "desc" },
      take:    10,
      include: { suggestions: { orderBy: { name: "asc" } } },
    });

    return { success: true, mealPlans: plans.map(formatPlan) };
  } catch (error) {
    console.error("[getSavedMealPlans] error:", error);
    return { success: false, error: "Failed to load saved meal plans." };
  }
}

export async function markMealCooked(suggestionId: string): Promise<MarkCookedResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };

  try {
    await prisma.mealSuggestion.update({
      where: { id: suggestionId },
      data:  { isCooked: true, cookedAt: new Date() },
    });
    return { success: true };
  } catch (error) {
    console.error("[markMealCooked] error:", error);
    return { success: false, error: "Failed to mark meal as cooked." };
  }
}

export type DeleteMealPlanResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteMealPlan(planId: string): Promise<DeleteMealPlanResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorised" };
  const userId = (session.user as any).id as string;

  try {
    const plan = await prisma.mealPlan.findUnique({
      where: { id: planId },
    });

    if (!plan)                  return { success: false, error: "Plan not found" };
    if (plan.userId !== userId) return { success: false, error: "Unauthorised" };

    await prisma.mealPlan.delete({ where: { id: planId } });
    return { success: true };
  } catch (error) {
    console.error("[deleteMealPlan] error:", error);
    return { success: false, error: "Failed to delete plan." };
  }
}