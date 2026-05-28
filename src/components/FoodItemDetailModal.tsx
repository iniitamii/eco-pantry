"use client";

import { useEffect } from "react";
import type { FoodItem, FoodCategory } from "@prisma/client";

interface Props {
  item:          FoodItem;
  onClose:       () => void;
  onEdit:        (item: FoodItem) => void;
  onDelete:      (id: string) => void;
}

function daysUntilExpiry(date: Date | string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

const ICONS: Record<FoodCategory, string> = {
  DAIRY: "🥛", PRODUCE: "🥦", MEAT: "🥩", SEAFOOD: "🐟",
  GRAINS: "🌾", CANNED_GOODS: "🥫", FROZEN: "❄️", BEVERAGES: "🧃",
  CONDIMENTS: "🫙", SNACKS: "🍿", BAKERY: "🍞", OTHER: "📦",
};

const STORAGE_ICONS: Record<string, string> = {
  FRIDGE: "🧊", FREEZER: "❄️", PANTRY: "🗄️", CUPBOARD: "🚪", OTHER: "📦",
};

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  AVAILABLE: { badge: "bg-emerald-100 text-emerald-800", label: "Available" },
  PLANNED:   { badge: "bg-purple-100 text-purple-700",   label: "Listed for Donation" },
  DONATED:   { badge: "bg-sky-100 text-sky-700",         label: "Donated" },
  USED:      { badge: "bg-stone-100 text-stone-500",     label: "Used" },
  EXPIRED:   { badge: "bg-rose-100 text-rose-600",       label: "Expired" },
};

export function FoodItemDetailModal({ item, onClose, onEdit, onDelete }: Props) {
  const days     = daysUntilExpiry(item.expiryDate);
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.AVAILABLE;

  const expiryColor =
    days < 0   ? "text-rose-500"   :
    days <= 3  ? "text-orange-500" :
    days <= 7  ? "text-amber-500"  :
                 "text-emerald-600";

  const expiryLabel =
    days < 0  ? `Expired ${Math.abs(days)}d ago` :
    days === 0 ? "Expires today!" :
    days === 1 ? "Expires tomorrow" :
                 `${days} days left`;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`
          bg-[#FEFCF7] w-full sm:max-w-md
          rounded-t-3xl sm:rounded-3xl
          shadow-2xl
          p-6 sm:p-8
          transition-transform duration-300
          animate-slide-up sm:animate-none
        `}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-4xl shrink-0">{ICONS[item.category] ?? "📦"}</span>
            <div className="min-w-0">
              <h2
                style={{ fontFamily: "'Lora', serif" }}
                className="text-2xl font-semibold text-stone-800 leading-tight wrap-break-word"
              >
                {item.name}
              </h2>
              <p className="text-xs text-stone-400 capitalize mt-0.5">
                {(item.category ?? "OTHER").replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-5">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${statusStyle.badge}`}>
            {item.status === "PLANNED" && <span>🤝</span>}
            {statusStyle.label}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Quantity */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Quantity</p>
            <p className="text-lg font-semibold text-stone-800">
              {item.quantity} <span className="text-sm font-normal text-stone-500">{item.unit}</span>
            </p>
          </div>

          {/* Storage */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Storage</p>
            <p className="text-sm font-semibold text-stone-800">
              {STORAGE_ICONS[item.storageLocation] ?? "📦"}{" "}
              <span className="capitalize">{item.storageLocation.toLowerCase()}</span>
            </p>
          </div>

          {/* Expiry */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 col-span-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Expiry Date</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">
                {new Date(item.expiryDate).toLocaleDateString("en-US", {
                  weekday: "short", month: "long", day: "numeric", year: "numeric",
                })}
              </p>
              <span className={`text-xs font-semibold ${expiryColor}`}>
                {expiryLabel}
              </span>
            </div>
          </div>

          {/* Added date */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 col-span-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Added</p>
            <p className="text-sm text-stone-600">
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="mb-5 bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">Notes</p>
            <p className="text-sm text-stone-600 leading-relaxed">{item.notes}</p>
          </div>
        )}

        {/* Donation banner */}
        {item.status === "PLANNED" && (
          <div className="mb-5 flex items-center justify-between gap-2 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <span>🤝</span>
              <span className="font-medium">Listed for donation</span>
            </div>
            <a
              href="/donations/mine"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors shrink-0"
            >
              Manage →
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { onClose(); onEdit(item); }}
            disabled={item.status === "PLANNED" || item.status === "DONATED"}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✏️ Edit
          </button>

          {item.status !== "PLANNED" && item.status !== "DONATED" && (
            <a
              href={`/donations/new?itemId=${item.id}`}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              🤝 Donate
            </a>
          )}

          <button
            onClick={() => { onClose(); onDelete(item.id); }}
            disabled={item.status === "PLANNED"}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🗑 Remove
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  );
}