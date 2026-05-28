"use client";

import { useState, useTransition } from "react";
import { Navbar } from "./Navbar";
import type { FoodItem, FoodCategory } from "@prisma/client";
import { deleteFoodItem } from "@/app/actions/food-items";
import { AddFoodItemModal } from "./AddFoodItemModal";
import { EditFoodItemModal } from "./EditFoodItemModal";
import { FoodItemDetailModal } from "./FoodItemDetailModal";
import { NotificationBell } from "./NotificationBell";
import type { Notification } from "@prisma/client";

interface Props {
  items:         FoodItem[];
  userName:      string;
  userImage:     string | null;
  unreadCount:   number;
  notifications: Notification[];
}

function daysUntilExpiry(date: Date | string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

type Severity = "expired" | "critical" | "warning" | "ok";

function getSeverity(days: number): Severity {
  if (days < 0)  return "expired";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "ok";
}

const SEVERITY: Record<Severity, { card: string; badge: string; label: string }> = {
  expired:  { card: "border-rose-200 bg-rose-50",    badge: "bg-rose-500 text-white",          label: "Expired"       },
  critical: { card: "border-orange-200 bg-orange-50",badge: "bg-orange-500 text-white",        label: "Expiring soon" },
  warning:  { card: "border-amber-200 bg-amber-50",  badge: "bg-amber-400 text-stone-800",     label: "Use this week" },
  ok:       { card: "border-stone-100 bg-white",     badge: "bg-emerald-100 text-emerald-800", label: "Fresh"         },
};

const ICONS: Record<FoodCategory, string> = {
  DAIRY: "🥛", PRODUCE: "🥦", MEAT: "🥩", SEAFOOD: "🐟",
  GRAINS: "🌾", CANNED_GOODS: "🥫", FROZEN: "❄️", BEVERAGES: "🧃",
  CONDIMENTS: "🫙", SNACKS: "🍿", BAKERY: "🍞", OTHER: "📦",
};

const TABS: { key: Severity | "all"; label: string }[] = [
  { key: "all",      label: "All"        },
  { key: "critical", label: "⚠ Critical" },
  { key: "warning",  label: "This week"  },
  { key: "expired",  label: "Expired"    },
  { key: "ok",       label: "Fresh"      },
];

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

export function InventoryDashboard({ items: initial, userName, userImage, unreadCount, notifications }: Props) {
  const [items, setItems]             = useState<FoodItem[]>(initial);
  const [showModal, setShowModal]     = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [detailItem, setDetailItem]   = useState<FoodItem | null>(null);
  const [filter, setFilter]           = useState<Severity | "all">("all");
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [, startTransition]           = useTransition();

  const stats = {
    total:    items.length,
    expiring: items.filter(i => { const d = daysUntilExpiry(i.expiryDate); return d >= 0 && d <= 7; }).length,
    expired:  items.filter(i => daysUntilExpiry(i.expiryDate) < 0).length,
    fresh:    items.filter(i => daysUntilExpiry(i.expiryDate) > 7).length,
  };

  const filtered = filter === "all"
    ? items
    : items.filter(i => getSeverity(daysUntilExpiry(i.expiryDate)) === filter);

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteFoodItem(id);
      if (result.success) setItems(prev => prev.filter(i => i.id !== id));
      setDeletingId(null);
    });
  }

  function handleItemAdded(item: FoodItem) {
    setItems(prev =>
      [item, ...prev].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    );
    setShowModal(false);
  }

  function handleItemUpdated(updatedItem: FoodItem) {
    setItems(prev =>
      prev.map(i => i.id === updatedItem.id ? updatedItem : i)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    );
    setEditingItem(null);
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <Navbar notifications={notifications} unreadCount={unreadCount} />

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
              Good {getGreeting()}, {userName.split(" ")[0]}.
            </h1>
            <p className="text-stone-500 mt-1.5 text-sm sm:text-base">
              {stats.expiring > 0
                ? `You have ${stats.expiring} item${stats.expiring > 1 ? "s" : ""} expiring this week — use them up!`
                : stats.total === 0
                ? "Your pantry is empty. Add your first item to get started."
                : "Your pantry is looking great — everything is fresh! 🎉"}
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total",    value: stats.total,    color: "text-stone-700",   bg: "bg-white"      },
              { label: "Expiring", value: stats.expiring, color: "text-orange-600",  bg: "bg-orange-50"  },
              { label: "Expired",  value: stats.expired,  color: "text-rose-600",    bg: "bg-rose-50"    },
              { label: "Fresh",    value: stats.fresh,    color: "text-emerald-700", bg: "bg-emerald-50" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-stone-100 shadow-sm`}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">{label}</p>
                <p style={{ fontFamily: "'Lora', serif" }} className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex gap-1.5 flex-wrap">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === key
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-white text-stone-500 border border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow transition-colors"
            >
              + Add Item
            </button>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-stone-400">
              <p className="text-5xl mb-4">🌱</p>
              <p className="font-medium text-stone-500">
                {filter === "all" ? "No items yet — add your first!" : `No ${filter} items`}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(item => {
                const days     = daysUntilExpiry(item.expiryDate);
                const severity = getSeverity(days);
                const style    = SEVERITY[severity];
                const deleting = deletingId === item.id;

                return (
                  <li
                    key={item.id}
                    onClick={() => setDetailItem(item)}
                    className={`rounded-2xl border p-5 transition-all duration-200 cursor-pointer ${style.card} ${deleting ? "opacity-40 scale-95" : "hover:shadow-md hover:-translate-y-0.5"}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{ICONS[item.category]}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 truncate">{item.name}</p>
                          <p className="text-xs text-stone-400 capitalize">
                            {item.category.replace("_", " ").toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-sm text-stone-600 mb-4">
                      <p><span className="font-medium">Qty:</span> {item.quantity} {item.unit}</p>
                      <p>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(item.expiryDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                        <span className={`ml-1.5 text-xs font-medium ${
                          days < 0 ? "text-rose-500" : days <= 3 ? "text-orange-500" : "text-stone-400"
                        }`}>
                          {days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}
                        </span>
                      </p>
                      {item.notes && (
                        <p className="text-stone-400 italic text-xs truncate">{item.notes}</p>
                      )}
                    </div>

                    {/* Donation badge */}
                    {item.status === "PLANNED" && (
                      <div className="mb-3 flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-1.5">
                        <span>🤝</span>
                        <span className="font-medium">Listed for donation</span>
                      </div>
                    )}

                    {/* Actions — stop propagation so clicks don't open detail */}
                    <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingItem(item)}
                        disabled={item.status === "PLANNED"}
                        className="text-xs text-stone-400 hover:text-emerald-600 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting || item.status === "PLANNED"}
                        className="text-xs text-stone-400 hover:text-rose-500 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deleting ? "Removing…" : "Remove"}
                      </button>
                      {item.status === "PLANNED" && (
                        <a
                          href="/donations/mine"
                          className="text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors"
                        >
                          Manage →
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
        
      {/* Modals */}
      {showModal && (
        <AddFoodItemModal
          onClose={() => setShowModal(false)}
          onSuccess={handleItemAdded}
        />
      )}
      {editingItem && (
        <EditFoodItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleItemUpdated}
        />
      )}
      {detailItem && (
        <FoodItemDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={(item) => { setDetailItem(null); setEditingItem(item); }}
          onDelete={(id) => { setDetailItem(null); handleDelete(id); }}
        />
      )}
    </>
  );
}