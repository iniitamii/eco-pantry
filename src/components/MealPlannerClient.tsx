"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  generateMealPlan,
  getSavedMealPlans,
  markMealCooked,
  type MealPlan,
  type MealSuggestion,
} from "@/app/actions/meal-plan";

// ─── Main Component ───────────────────────────────────────────────────────────

export function MealPlannerClient() {
  const [activePlan, setActivePlan]   = useState<MealPlan | null>(null);
  const [savedPlans, setSavedPlans]   = useState<MealPlan[]>([]);
  const [view, setView]               = useState<"generate" | "history">("generate");
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();
  const router = useRouter();

  // Load saved plans on mount
  useEffect(() => {
    getSavedMealPlans().then(result => {
      if (result.success) {
        setSavedPlans(result.mealPlans);
        if (result.mealPlans.length > 0 && !activePlan) {
          setActivePlan(result.mealPlans[0]);
        }
      }
    });
  }, []);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateMealPlan();
      if (result.success) {
        setActivePlan(result.mealPlan);
        setSavedPlans(prev => [result.mealPlan, ...prev]);
        setView("generate");
      } else {
        setError(result.error);
      }
    });
  }

  async function handleMarkCooked(suggestionId: string) {
    const result = await markMealCooked(suggestionId);
    if (result.success) {
      const update = (plan: MealPlan): MealPlan => ({
        ...plan,
        suggestions: plan.suggestions.map(s =>
          s.id === suggestionId
            ? { ...s, isCooked: true, cookedAt: new Date().toISOString() }
            : s
        ),
      });
      setActivePlan(prev => prev ? update(prev) : prev);
      setSavedPlans(prev => prev.map(p =>
        p.suggestions.some(s => s.id === suggestionId) ? update(p) : p
      ));
    }
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
            <div className="flex items-center gap-4">
              {/* Tab toggle */}
              <div className="flex bg-stone-100 rounded-lg p-0.5 text-sm">
                <button
                  onClick={() => setView("generate")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    view === "generate"
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  ✨ Planner
                </button>
                <button
                  onClick={() => setView("history")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    view === "history"
                      ? "bg-white text-stone-800 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  🕐 History {savedPlans.length > 0 && `(${savedPlans.length})`}
                </button>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ── Generate View ── */}
          {view === "generate" && (
            <>
              <div className="mb-8">
                <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
                  ✨ AI Meal Planner
                </h1>
                <p className="text-stone-500 mt-1.5 text-sm sm:text-base">
                  Generate smart meal ideas from your pantry — prioritising items about to expire.
                </p>
              </div>

              {/* Empty state */}
              {!activePlan && (
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center mb-8">
                  <p className="text-4xl mb-4">🍳</p>
                  <h2 style={{ fontFamily: "'Lora', serif" }} className="text-xl text-stone-700 mb-2">
                    Ready to cook something great?
                  </h2>
                  <p className="text-stone-400 text-sm mb-6">
                    Gemini AI will analyse your pantry and suggest meals that use up ingredients before they expire.
                  </p>
                  <GenerateButton isPending={isPending} onClick={handleGenerate} label="Generate Meal Plan" />
                  {error && <ErrorBox message={error} />}
                </div>
              )}

              {/* Active plan */}
              {activePlan && (
                <PlanView
                  plan={activePlan}
                  isPending={isPending}
                  onRegenerate={handleGenerate}
                  onClear={() => setActivePlan(null)}
                  onMarkCooked={handleMarkCooked}
                  error={error}
                />
              )}
            </>
          )}

          {/* ── History View ── */}
          {view === "history" && (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl text-stone-800">
                    🕐 Meal History
                  </h1>
                  <p className="text-stone-500 mt-1 text-sm">Your last {savedPlans.length} generated plans.</p>
                </div>
                <GenerateButton isPending={isPending} onClick={handleGenerate} label="+ New Plan" />
              </div>

              {savedPlans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center text-stone-400">
                  No saved plans yet. Generate your first one!
                </div>
              ) : (
                <div className="space-y-6">
                  {savedPlans.map(plan => (
                    <div key={plan.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                      {/* Plan header */}
                      <div className="px-5 py-3 border-b border-stone-50 flex items-center justify-between">
                        <span className="text-xs text-stone-400">
                          Generated {new Date(plan.generatedAt).toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                        <button
                          onClick={() => { setActivePlan(plan); setView("generate"); }}
                          className="text-xs text-emerald-700 font-medium hover:text-emerald-900"
                        >
                          View full plan →
                        </button>
                      </div>
                      {/* Meal chips */}
                      <div className="px-5 py-4 flex flex-wrap gap-2">
                        {plan.suggestions.map(s => (
                          <span
                            key={s.id}
                            className={`text-xs px-3 py-1 rounded-full border font-medium ${
                              s.isCooked
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-stone-50 text-stone-600 border-stone-100"
                            }`}
                          >
                            {s.isCooked ? "✓ " : ""}{s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Plan View ────────────────────────────────────────────────────────────────

function PlanView({
  plan, isPending, onRegenerate, onClear, onMarkCooked, error
}: {
  plan: MealPlan;
  isPending: boolean;
  onRegenerate: () => void;
  onClear: () => void;
  onMarkCooked: (id: string) => void;
  error: string | null;
}) {
  const cookedCount = plan.suggestions.filter(s => s.isCooked).length;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      {plan.suggestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700">Meals cooked</span>
            <span className="text-sm text-stone-400">{cookedCount} / {plan.suggestions.length}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(cookedCount / plan.suggestions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Waste tip */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex gap-3">
        <span className="text-xl shrink-0">💡</span>
        <p className="text-sm text-emerald-800">{plan.wasteReductionTip}</p>
      </div>

      {/* Meal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plan.suggestions.map((meal, i) => (
          <MealCard key={meal.id} meal={meal} index={i} onMarkCooked={onMarkCooked} />
        ))}
      </div>

      {/* Shopping list */}
      {plan.shoppingList.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h3 style={{ fontFamily: "'Lora', serif" }} className="text-lg text-stone-800 mb-3">
            🛒 Shopping List
          </h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {plan.shoppingList.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <GenerateButton isPending={isPending} onClick={onRegenerate} label="↺ Regenerate" />
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-600 text-sm font-semibold rounded-xl transition-colors"
        >
          Clear
        </button>
      </div>
      {error && <ErrorBox message={error} />}
    </div>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────

function MealCard({
  meal, index, onMarkCooked
}: {
  meal: MealSuggestion;
  index: number;
  onMarkCooked: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking]   = useState(false);

  const MEAL_EMOJIS = ["🍲", "🥗", "🍝", "🥘", "🍛", "🫕"];
  const emoji = MEAL_EMOJIS[index % MEAL_EMOJIS.length];

  async function handleCooked() {
    setMarking(true);
    await onMarkCooked(meal.id);
    setMarking(false);
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
      meal.isCooked ? "border-emerald-200 opacity-75" : "border-stone-100 hover:shadow-md"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 leading-snug">{meal.name}</h3>
          <div className="flex gap-3 mt-1 text-xs text-stone-400">
            <span>⏱ {meal.prepMinutes} min</span>
            <span>👤 {meal.servings} servings</span>
          </div>
        </div>
        {meal.isCooked && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">
            ✓ Cooked
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 mb-3">{meal.description}</p>

      {/* Priority badges */}
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

      {/* Mark as cooked */}
      {!meal.isCooked && (
        <button
          onClick={handleCooked}
          disabled={marking}
          className="mt-4 w-full py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-50 disabled:opacity-50 transition-colors"
        >
          {marking ? "Saving…" : "✓ Mark as cooked"}
        </button>
      )}

      {meal.isCooked && meal.cookedAt && (
        <p className="mt-3 text-xs text-stone-400 text-center">
          Cooked {new Date(meal.cookedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function GenerateButton({ isPending, onClick, label }: { isPending: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow transition-colors"
    >
      {isPending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Thinking…
        </>
      ) : label}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{message}</p>
  );
}