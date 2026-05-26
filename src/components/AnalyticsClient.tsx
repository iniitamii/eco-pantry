"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import type { FoodActionType, FoodCategory } from "@prisma/client";

interface Stats {
  totalAdded:   number;
  totalUsed:    number;
  totalDonated: number;
  totalExpired: number;
  totalClaimed: number;
}

interface RecentLog {
  actionType: FoodActionType;
  loggedAt:   string;
  category:   FoodCategory;
}

interface Props {
  stats:             Stats;
  recentLogs:        RecentLog[];
  categoryBreakdown: Record<string, number>;
  userName:          string;
  userImage:         string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  DAIRY: "🥛", PRODUCE: "🥦", MEAT: "🥩", SEAFOOD: "🐟",
  GRAINS: "🌾", CANNED_GOODS: "🥫", FROZEN: "❄️", BEVERAGES: "🧃",
  CONDIMENTS: "🫙", SNACKS: "🍿", BAKERY: "🍞", OTHER: "📦",
};

const ACTION_LABELS: Record<FoodActionType, { label: string; color: string; icon: string }> = {
  ITEM_ADDED:       { label: "Added",         color: "text-emerald-600", icon: "➕" },
  ITEM_USED:        { label: "Used",           color: "text-blue-600",    icon: "✅" },
  ITEM_DONATED:     { label: "Donated",        color: "text-purple-600",  icon: "🤝" },
  ITEM_EXPIRED:     { label: "Expired",        color: "text-rose-500",    icon: "⚠️" },
  DONATION_CLAIMED: { label: "Claim received", color: "text-amber-600",   icon: "🎉" },
};

// Group logs by day for the activity chart
function groupByDay(logs: RecentLog[]): { date: string; used: number; donated: number; expired: number }[] {
  const map: Record<string, { used: number; donated: number; expired: number }> = {};

  logs.forEach(log => {
    const date = new Date(log.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!map[date]) map[date] = { used: 0, donated: 0, expired: 0 };
    if (log.actionType === "ITEM_USED")    map[date].used++;
    if (log.actionType === "ITEM_DONATED") map[date].donated++;
    if (log.actionType === "ITEM_EXPIRED") map[date].expired++;
  });

  return Object.entries(map).map(([date, counts]) => ({ date, ...counts }));
}

export function AnalyticsClient({ stats, recentLogs, categoryBreakdown, userName, userImage }: Props) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalSaved   = stats.totalUsed + stats.totalDonated;
  const wasteRate    = stats.totalAdded > 0
    ? Math.round((stats.totalExpired / stats.totalAdded) * 100)
    : 0;
  const saveRate     = stats.totalAdded > 0
    ? Math.round((totalSaved / stats.totalAdded) * 100)
    : 0;

  const dailyActivity = groupByDay(recentLogs);
  const maxActivity   = Math.max(...dailyActivity.map(d => d.used + d.donated + d.expired), 1);

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCategory = Math.max(...topCategories.map(([, v]) => v), 1);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur border-b border-stone-100 sticky top-0 z-40 relative">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span style={{ fontFamily: "'Lora', serif" }} className="font-semibold text-stone-800">EcoPantry</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <button onClick={() => router.push("/dashboard")} className="text-xs text-stone-500 hover:text-stone-700 transition-colors">Pantry</button>
              <button onClick={() => router.push("/donations")} className="text-xs text-stone-500 hover:text-stone-700 transition-colors">Donations</button>
              <button onClick={() => router.push("/meal-plan")} className="text-xs text-emerald-700 font-medium hover:text-emerald-900 transition-colors">Meal Planner</button>
              <div className="flex items-center gap-2">
                {userImage && <img src={userImage} alt={userName} className="w-7 h-7 rounded-full object-cover" />}
                <span className="text-sm text-stone-600">{userName}</span>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Sign out</button>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-stone-400 hover:text-stone-600"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              )}
            </button>
          </div>
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm z-50 sm:hidden">
              <ul className="flex flex-col p-4 space-y-4">
                <li><button onClick={() => { router.push("/dashboard"); setIsMenuOpen(false); }} className="text-stone-600 hover:text-stone-800">🌿 Pantry</button></li>
                <li><button onClick={() => { router.push("/donations"); setIsMenuOpen(false); }} className="text-stone-600 hover:text-stone-800">🤝 Donations</button></li>
                <li><button onClick={() => { router.push("/meal-plan"); setIsMenuOpen(false); }} className="text-emerald-700 font-medium">✨ Meal Planner</button></li>
                <hr className="border-stone-100" />
                <li>
                  <div className="flex items-center gap-2 mb-3">
                    {userImage && <img src={userImage} alt={userName} className="w-6 h-6 rounded-full object-cover" />}
                    <span className="text-sm text-stone-600">{userName}</span>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm text-rose-500 hover:text-rose-700 font-medium">Sign out</button>
                </li>
              </ul>
            </div>
          )}
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
              📊 My Impact
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm">
              Track how well you're reducing food waste over time.
            </p>
          </div>

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Items saved",   value: totalSaved,          color: "text-emerald-700", bg: "bg-emerald-50"  },
              { label: "Donated",       value: stats.totalDonated,  color: "text-purple-700",  bg: "bg-purple-50"   },
              { label: "Expired",       value: stats.totalExpired,  color: "text-rose-600",    bg: "bg-rose-50"     },
              { label: "Claims received", value: stats.totalClaimed, color: "text-amber-700",  bg: "bg-amber-50"    },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-stone-100 shadow-sm`}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">{label}</p>
                <p style={{ fontFamily: "'Lora', serif" }} className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Save rate + waste rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Save rate</p>
              <div className="flex items-end gap-3 mb-2">
                <p style={{ fontFamily: "'Lora', serif" }} className="text-4xl font-bold text-emerald-700">{saveRate}%</p>
                <p className="text-xs text-stone-400 mb-1">of items added were used or donated</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${saveRate}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Waste rate</p>
              <div className="flex items-end gap-3 mb-2">
                <p style={{ fontFamily: "'Lora', serif" }} className={`text-4xl font-bold ${wasteRate > 20 ? "text-rose-600" : wasteRate > 10 ? "text-orange-500" : "text-emerald-700"}`}>
                  {wasteRate}%
                </p>
                <p className="text-xs text-stone-400 mb-1">of items expired before use</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${wasteRate > 20 ? "bg-rose-500" : wasteRate > 10 ? "bg-orange-400" : "bg-emerald-500"}`}
                  style={{ width: `${wasteRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 30-day activity chart */}
          {dailyActivity.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Activity — last 30 days</p>
              <div className="flex items-end gap-1 h-24">
                {dailyActivity.map(day => {
                  const total  = day.used + day.donated + day.expired;
                  const height = Math.round((total / maxActivity) * 96);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                      <div
                        className="w-full rounded-t bg-emerald-400 hover:bg-emerald-500 transition-colors cursor-default"
                        style={{ height: `${height}px` }}
                      />
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-stone-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {day.date}: {day.used} used, {day.donated} donated{day.expired > 0 ? `, ${day.expired} expired` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-300">
                <span>{dailyActivity[0]?.date}</span>
                <span>{dailyActivity[dailyActivity.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {topCategories.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Top categories saved</p>
              <ul className="space-y-3">
                {topCategories.map(([category, count]) => (
                  <li key={category} className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center shrink-0">{CATEGORY_ICONS[category] ?? "📦"}</span>
                    <span className="text-sm text-stone-600 w-24 shrink-0 capitalize">
                      {category.replace("_", " ").toLowerCase()}
                    </span>
                    <div className="flex-1 bg-stone-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.round((count / maxCategory) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-6 text-right shrink-0">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent activity feed */}
          {recentLogs.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Recent activity</p>
              <ul className="space-y-3">
                {recentLogs.slice().reverse().slice(0, 10).map((log, i) => {
                  const action = ACTION_LABELS[log.actionType];
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-base w-5 text-center shrink-0">{action.icon}</span>
                      <span className={`text-sm font-medium ${action.color}`}>{action.label}</span>
                      <span className="text-xs text-stone-400 capitalize">
                        {CATEGORY_ICONS[log.category]} {log.category.replace("_", " ").toLowerCase()}
                      </span>
                      <span className="ml-auto text-xs text-stone-300">
                        {new Date(log.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {recentLogs.length === 0 && (
            <div className="text-center py-20 text-stone-400">
              <p className="text-5xl mb-4">📊</p>
              <p className="font-medium text-stone-500">No activity yet</p>
              <p className="text-sm mt-1">Start adding and using items to see your impact here.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Go to Pantry
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}