"use client";

import { useRef, useState, useTransition } from "react";
import { editFoodItem } from "@/app/actions/food-items";
import type { FoodItem, FoodCategory } from "@prisma/client";

interface Props {
  item:      FoodItem;
  onClose:   () => void;
  onSuccess: (item: FoodItem) => void;
}

const CATEGORIES: { value: FoodCategory; label: string; icon: string }[] = [
  { value: "DAIRY",        label: "Dairy",      icon: "🥛" },
  { value: "PRODUCE",      label: "Produce",    icon: "🥦" },
  { value: "MEAT",         label: "Meat",       icon: "🥩" },
  { value: "SEAFOOD",      label: "Seafood",    icon: "🐟" },
  { value: "GRAINS",       label: "Grains",     icon: "🌾" },
  { value: "CANNED_GOODS", label: "Canned",     icon: "🥫" },
  { value: "FROZEN",       label: "Frozen",     icon: "❄️" },
  { value: "BEVERAGES",    label: "Beverages",  icon: "🧃" },
  { value: "CONDIMENTS",   label: "Condiments", icon: "🫙" },
  { value: "SNACKS",       label: "Snacks",     icon: "🍿" },
  { value: "BAKERY",       label: "Bakery",     icon: "🍞" },
  { value: "OTHER",        label: "Other",      icon: "📦" },
];

const UNITS = ["pcs", "L", "ml", "kg", "g", "oz", "lb", "cup", "pack", "bottle", "can"];

export function EditFoodItemModal({ item, onClose, onSuccess }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string[]> | string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Format date for input default value
  const defaultDate = new Date(item.expiryDate).toISOString().split("T")[0];

  function handleSubmit(formData: FormData) {
    setErrors(null);
    startTransition(async () => {
      const result = await editFoodItem(item.id, formData);
      if (result.success) {
        onSuccess(result.item);
      } else {
        setErrors(result.errors);
      }
    });
  }

  const fieldError = (f: string) =>
    typeof errors === "object" && errors !== null
      ? (errors as Record<string, string[]>)[f]?.[0]
      : null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FEFCF7] rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Lora', serif" }} className="text-2xl font-semibold text-stone-800">Edit Item</h2>
            <p className="text-xs text-stone-400 mt-0.5">Update your food item details</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors text-lg">×</button>
        </div>

        {typeof errors === "string" && (
          <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{errors}</div>
        )}

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Item name *</label>
            <input
              name="name" required defaultValue={item.name}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {fieldError("name") && <p className="text-xs text-rose-500 mt-1">{fieldError("name")}</p>}
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Quantity *</label>
              <input
                name="quantity" type="number" min="0.1" step="0.1" required defaultValue={item.quantity}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {fieldError("quantity") && <p className="text-xs text-rose-500 mt-1">{fieldError("quantity")}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Unit</label>
              <select
                name="unit" defaultValue={item.unit}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Category *</label>
            <select
              name="category" required defaultValue={item.category}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {CATEGORIES.map(({ value, label, icon }) => (
                <option key={value} value={value}>{icon} {label}</option>
              ))}
            </select>
            {fieldError("category") && <p className="text-xs text-rose-500 mt-1">{fieldError("category")}</p>}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Expiry date *</label>
            <input
              name="expiryDate" type="date" required defaultValue={defaultDate}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {fieldError("expiryDate") && <p className="text-xs text-rose-500 mt-1">{fieldError("expiryDate")}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
              Notes <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              name="notes" rows={2} defaultValue={item.notes ?? ""}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
          </div>

          <button
            type="submit" disabled={isPending}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
            ) : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}