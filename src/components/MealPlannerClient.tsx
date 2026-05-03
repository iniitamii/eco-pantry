"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateMealPlan, type MealPlan, type MealSuggestion } from "@/app/actions/meal-plan";

export function MealPlannerClient() {
  const [mealPlan, setMealPlan]   = useState<MealPlan | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateMealPlan();
      if (result.success) setMealPlan(result.mealPlan);
      else setError(result.error);
    });
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur border-b border-stone-100 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span style={{ fontFamily: "'Lora', serif" }} className="font-semibold text-stone-800">EcoPantry</span>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              ← Back to Pantry
            </button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
              ✨ AI Meal Planner
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm sm:text-base">
              Generate smart meal ideas from your pantry — prioritising items about to expire.
            </p>
          </div>

          {/* Generate Button */}
          {!mealPlan && (
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center mb-8">
              <p className="text-4xl mb-4">🍳</p>
              <h2 style={{ fontFamily: "'Lora', serif" }} className="text-xl text-stone-700 mb-2">
                Ready to cook something great?
              </h2>
              <p className="text-stone-400 text-sm mb-6">
                Gemini AI will analyse your pantry and suggest meals that use up ingredients before they expire.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl shadow transition-colors"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Thinking…
                  </>
                ) : "Generate Meal Plan"}
              </button>
              {error && (
                <p className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>
              )}
            </div>
          )}

          {/* Meal Plan Results */}
          {mealPlan && (
            <div className="space-y-6">

              {/* Waste Reduction Tip */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex gap-3">
                <span className="text-xl shrink-0">💡</span>
                <p className="text-sm text-emerald-800">{mealPlan.wasteReductionTip}</p>
              </div>

              {/* Meal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mealPlan.suggestions.map((meal, i) => (
                  <MealCard key={i} meal={meal} index={i} />
                ))}
              </div>

              {/* Shopping List */}
              {mealPlan.shoppingList.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                  <h3 style={{ fontFamily: "'Lora', serif" }} className="text-lg text-stone-800 mb-3">
                    🛒 Shopping List
                  </h3>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {mealPlan.shoppingList.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Regenerating…
                    </>
                  ) : "↺ Regenerate"}
                </button>
                <button
                  onClick={() => setMealPlan(null)}
                  className="px-5 py-2.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-sm font-semibold rounded-xl transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────

function MealCard({ meal, index }: { meal: MealSuggestion; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const MEAL_EMOJIS = ["🍲", "🥗", "🍝", "🥘", "🍛", "🫕"];
  const emoji = MEAL_EMOJIS[index % MEAL_EMOJIS.length];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl shrink-0">{emoji}</span>
        <div>
          <h3 className="font-semibold text-stone-800 leading-snug">{meal.name}</h3>
          <div className="flex gap-3 mt-1 text-xs text-stone-400">
            <span>⏱ {meal.prepMinutes} min</span>
            <span>👤 {meal.servings} servings</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-500 mb-3">{meal.description}</p>

      {/* Prioritised items badges */}
      {meal.prioritises.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {meal.prioritises.map((item, i) => (
            <span key={i} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">
              ⚠ {item}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-emerald-700 font-medium hover:text-emerald-900 transition-colors"
      >
        {expanded ? "▲ Hide ingredients" : "▼ Show ingredients"}
      </button>

      {expanded && (
        <ul className="mt-2 space-y-1">
          {meal.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}