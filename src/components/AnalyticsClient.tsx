"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "./Navbar";
import type { FoodActionType, FoodCategory } from "@prisma/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

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

// ─── FIX: Chronological sorting for daily grouped data ─────────────
function groupByDay(logs: RecentLog[]) {
  const map: Record<string, { date: string; Used: number; Donated: number; Expired: number; ts: number }> = {};
  
  logs.forEach(log => {
    const d = new Date(log.loggedAt);
    const key = d.toDateString(); // Unique key per day
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    if (!map[key]) map[key] = { date: dateStr, Used: 0, Donated: 0, Expired: 0, ts: d.getTime() };
    
    if (log.actionType === "ITEM_USED")    map[key].Used++;
    if (log.actionType === "ITEM_DONATED") map[key].Donated++;
    if (log.actionType === "ITEM_EXPIRED") map[key].Expired++;
  });
  
  // Guarantee oldest to newest (left to right)
  return Object.values(map).sort((a, b) => a.ts - b.ts);
}

// ─── FIX: Chronological sorting for cumulative math ────────────────
function groupByWeek(logs: RecentLog[]) {
  // Must sort chronologically FIRST so the cumulative total adds up correctly
  const sortedLogs = [...logs].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  const weeks: Record<string, { weekKey: string, count: number, ts: number }> = {};
  
  sortedLogs.forEach(log => {
    if (log.actionType !== "ITEM_USED" && log.actionType !== "ITEM_DONATED") return;
    
    const d = new Date(log.loggedAt);
    const weekNum = Math.ceil(d.getDate() / 7);
    const uniqueKey = `${d.getFullYear()}-${d.getMonth()}-${weekNum}`;
    const weekKey = `W${weekNum} ${d.toLocaleDateString("en-US", { month: "short" })}`;

    // Use the start of the week (Monday) as the anchor timestamp for stable sorting
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0 ... Sun=6
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    if (!weeks[uniqueKey]) weeks[uniqueKey] = { weekKey, count: 0, ts: weekStart.getTime() };
        weeks[uniqueKey].count++;
      });
  
  let cumulative = 0;
  return Object.values(weeks)
    .sort((a, b) => a.ts - b.ts) // Extra safety sort
    .map(w => {
      cumulative += w.count;
      return { week: w.weekKey, saved: cumulative };
    });
}

const PIE_COLORS = ["#059669", "#7c3aed", "#2563eb", "#d97706", "#e11d48", "#0891b2", "#65a30d"];

function calcEcoScore(saveRate: number, wasteRate: number) {
  return Math.max(0, Math.min(100, Math.round(saveRate * 0.7 + (100 - wasteRate) * 0.3)));
}

function EcoScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;
  const color  = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#e11d48";
  const label  = score >= 70 ? "Excellent" : score >= 40 ? "Improving" : "Needs work";

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={color} fontFamily="Lora, serif">
          {score}
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#a8a29e" fontFamily="DM Sans, sans-serif">
          / 100
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-800 text-white text-xs rounded-xl px-3 py-2 shadow-lg space-y-1">
      <p className="font-semibold text-stone-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: <span className="font-bold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-800 text-white text-xs rounded-xl px-3 py-2 shadow-lg">
      <p className="font-semibold text-stone-300">{label}</p>
      <p className="text-emerald-400 font-bold">{payload[0].value} items saved</p>
    </div>
  );
}

export function AnalyticsClient({ stats, recentLogs, categoryBreakdown }: Props) {
  const [activeTab, setActiveTab] = useState<"bar" | "line">("bar");

  const totalSaved  = stats.totalUsed + stats.totalDonated;
  const wasteRate   = stats.totalAdded > 0 ? Math.round((stats.totalExpired / stats.totalAdded) * 100) : 0;
  const saveRate = stats.totalAdded > 0 ? Math.min(100, Math.round((totalSaved / stats.totalAdded) * 100)) : 0;
  const ecoScore    = calcEcoScore(saveRate, wasteRate);

  const dailyData   = groupByDay(recentLogs);
  const weeklyData  = groupByWeek(recentLogs);

  const pieData = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.replace("_", " "), value, icon: CATEGORY_ICONS[name] ?? "📦" }));

  const topCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategory   = Math.max(...topCategories.map(([, v]) => v), 1);

  const isEmpty = recentLogs.length === 0;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
              📊 Analytics
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm">
              Track how well you're reducing food waste over time.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Items saved",     value: totalSaved,         color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Donated",         value: stats.totalDonated, color: "text-purple-700",  bg: "bg-purple-50"  },
              { label: "Expired",         value: stats.totalExpired, color: "text-rose-600",    bg: "bg-rose-50"    },
              { label: "Claims received", value: stats.totalClaimed, color: "text-amber-700",   bg: "bg-amber-50"   },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-stone-100 shadow-sm`}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">{label}</p>
                <p style={{ fontFamily: "'Lora', serif" }} className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Eco Score + Save/Waste Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            {/* Eco score */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Eco Score</p>
              <EcoScoreRing score={ecoScore} />
              <p className="text-xs text-stone-400 mt-2 text-center">Based on save rate & waste</p>
            </div>

            {/* Save rate */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Save rate</p>
              <div className="flex items-end gap-3 mb-3">
                <p style={{ fontFamily: "'Lora', serif" }} className="text-4xl font-bold text-emerald-700">{saveRate}%</p>
                <p className="text-xs text-stone-400 mb-1">used or donated</p>
              </div>
              {/* 🐛 FIX: Added overflow-hidden */}
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden"> 
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${saveRate}%` }} />
              </div>
              <p className="text-xs text-stone-400 mt-2">{totalSaved} of {stats.totalAdded} items</p>
            </div>

            {/* Waste rate */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Waste rate</p>
              <div className="flex items-end gap-3 mb-3">
                <p style={{ fontFamily: "'Lora', serif" }} className={`text-4xl font-bold ${wasteRate > 20 ? "text-rose-600" : wasteRate > 10 ? "text-orange-500" : "text-emerald-700"}`}>
                  {wasteRate}%
                </p>
                <p className="text-xs text-stone-400 mb-1">expired</p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${wasteRate > 20 ? "bg-rose-500" : wasteRate > 10 ? "bg-orange-400" : "bg-emerald-500"}`}
                  style={{ width: `${wasteRate}%` }}
                />
              </div>
              <p className="text-xs text-stone-400 mt-2">{stats.totalExpired} of {stats.totalAdded} items</p>
            </div>
          </div>

          {/* Activity Chart */}
          {dailyData.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6">
              {/* Tab toggle */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Activity — last 30 days</p>
                <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("bar")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === "bar" ? "bg-white text-stone-700 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setActiveTab("line")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${activeTab === "line" ? "bg-white text-stone-700 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                  >
                    Trend
                  </button>
                </div>
              </div>

              {activeTab === "bar" ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyData} barSize={10} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#a8a29e" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a8a29e" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "#f5f5f4" }} />
                    <Legend
                      iconType="circle" iconSize={8}
                      wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                    />
                    <Bar dataKey="Used"    stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Donated" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Expired" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, fill: "#a8a29e" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a8a29e" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<LineTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="saved"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#059669", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#059669" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Category Pie + Bars side by side */}
          {(pieData.length > 0 || topCategories.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

              {/* Pie chart */}
              {pieData.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Category mix</p>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={32} outerRadius={56}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any) => [`${value} items`, name]}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="space-y-1.5 flex-1">
                      {pieData.map((d, i) => (
                        <li key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-stone-500 capitalize truncate">{d.icon} {d.name.toLowerCase()}</span>
                          <span className="ml-auto font-semibold text-stone-700">{d.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Horizontal bars */}
              {topCategories.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Top categories saved</p>
                  <ul className="space-y-3">
                    {topCategories.map(([category, count], i) => (
                      <li key={category} className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center shrink-0">{CATEGORY_ICONS[category] ?? "📦"}</span>
                        <span className="text-sm text-stone-600 w-20 shrink-0 capitalize truncate">
                          {category.replace("_", " ").toLowerCase()}
                        </span>
                        <div className="flex-1 bg-stone-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.round((count / maxCategory) * 100)}%`,
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-xs text-stone-400 w-5 text-right shrink-0">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                        {/* ─── FIX: Added the fallback icon here ─── */}
                        {CATEGORY_ICONS[log.category] ?? "📦"} {log.category.replace("_", " ").toLowerCase()}
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

          {/* Empty state */}
          {isEmpty && (
            <div className="text-center py-20 text-stone-400">
              <p className="text-5xl mb-4">📊</p>
              <p className="font-medium text-stone-500">No activity yet</p>
              <p className="text-sm mt-1">Start adding and using items to see your impact here.</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Go to Pantry
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
}