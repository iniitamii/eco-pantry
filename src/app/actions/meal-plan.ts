"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FoodItem } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface MealSuggestion {
  name:        string;
  description: string;
  ingredients: string[];
  servings:    number;
  prepMinutes: number;
  prioritises: string[];
}

export interface MealPlan {
  generatedAt:      string;
  suggestions:      MealSuggestion[];
  shoppingList:     string[];
  wasteReductionTip: string;
}

export type MealPlanResult =
  | { success: true;  mealPlan: MealPlan }
  | { success: false; error: string };

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
  "generatedAt": "${new Date().toISOString()}",
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

export async function generateMealPlan(): Promise<MealPlanResult> {
  const session = await getServerSession(authOptions);
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
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 8192,
      },
    });

    const result  = await model.generateContent(buildPrompt(items));
    const rawText = result.response.text();

    let mealPlan: MealPlan;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
    console.error("[generateMealPlan] No JSON found in response:", rawText);
    return { success: false, error: "AI returned unexpected format. Please try again." };
    }
const cleaned = jsonMatch[0];
      mealPlan = JSON.parse(cleaned) as MealPlan;
    } catch {
      console.error("[generateMealPlan] JSON parse failed:", rawText);
      return { success: false, error: "AI returned unexpected format. Please try again." };
    }

    if (!Array.isArray(mealPlan.suggestions) || mealPlan.suggestions.length === 0) {
      return { success: false, error: "No suggestions generated. Please try again." };
    }

    return { success: true, mealPlan };
  } catch (error) {
    console.error("[generateMealPlan] Gemini error:", error);
    return { success: false, error: "Could not reach AI service. Check your GEMINI_API_KEY." };
  }
}