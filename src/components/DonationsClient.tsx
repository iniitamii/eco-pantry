"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { claimDonation } from "@/app/actions/donations";
import { Navbar } from "./Navbar";
import type { FoodItem, FoodCategory } from "@prisma/client";

interface DonationListing {
  id:             string;
  message:        string | null;
  pickupLocation: string | null;
  isAvailable:    boolean;
  createdAt:      string;
  foodItem:       FoodItem;
  user:           { name: string | null; image: string | null };
}

interface Props {
  listings:      DonationListing[];
  currentUserId: string;
}

const ICONS: Record<FoodCategory, string> = {
  DAIRY: "🥛", PRODUCE: "🥦", MEAT: "🥩", SEAFOOD: "🐟",
  GRAINS: "🌾", CANNED_GOODS: "🥫", FROZEN: "❄️", BEVERAGES: "🧃",
  CONDIMENTS: "🫙", SNACKS: "🍿", BAKERY: "🍞", OTHER: "📦",
};

function daysUntilExpiry(date: Date | string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

export function DonationsClient({ listings: initial, currentUserId }: Props) {
  const [listings, setListings]         = useState<DonationListing[]>(initial);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [messages, setMessages]         = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [, startTransition]             = useTransition();
  const router                          = useRouter();

  function handleRequestClick(listingId: string) {
    setRequestingId(prev => prev === listingId ? null : listingId);
    setError(null);
  }

  function handleSubmitRequest(listingId: string) {
    setSubmittingId(listingId);
    setError(null);
    startTransition(async () => {
      const result = await claimDonation(listingId, messages[listingId] || undefined);
      if (result.success) {
        setListings(prev => prev.filter(l => l.id !== listingId));
        setRequestingId(null);
      } else {
        setError(result.error);
      }
      setSubmittingId(null);
    });
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-8">

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
                🤝 Community Donations
              </h1>
              <p className="text-stone-500 mt-1.5 text-sm sm:text-base">
                {listings.length > 0
                  ? `${listings.length} item${listings.length > 1 ? "s" : ""} available from your community.`
                  : "No donations available right now — check back later!"}
              </p>
            </div>
            <Link
              href="/donations/mine"
              className="shrink-0 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow transition-colors"
            >
              + Donate Item
            </Link>
          </div>  

          {error && (
            <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-24 text-stone-400">
              <p className="text-5xl mb-4">🌱</p>
              <p className="font-medium text-stone-500">No donations available yet</p>
              <p className="text-sm mt-1">Be the first to donate surplus food from your pantry!</p>
              
              <Link
                href="/donations/mine"
                className="mt-4 inline-block px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Donate an item
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(listing => {
                const days         = daysUntilExpiry(listing.foodItem.expiryDate);
                const isExpanded   = requestingId === listing.id;
                const isSubmitting = submittingId === listing.id;

                return (
                  <li
                    key={listing.id}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-50">
                      {listing.user.image ? (
                        <img src={listing.user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 font-bold">
                          {listing.user.name?.[0] ?? "?"}
                        </div>
                      )}
                      <span className="text-xs text-stone-400">
                        from <span className="font-medium text-stone-600">{listing.user.name ?? "Anonymous"}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 mb-3">
                      <span className="text-2xl shrink-0">{ICONS[listing.foodItem.category]}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 truncate">{listing.foodItem.name}</p>
                        <p className="text-xs text-stone-400 capitalize">
                          {listing.foodItem.category.replace("_", " ").toLowerCase()} · {listing.foodItem.quantity} {listing.foodItem.unit}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 mb-2">
                      Expires: {new Date(listing.foodItem.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <span className={`ml-1 font-medium ${days < 0 ? "text-rose-500" : days <= 3 ? "text-orange-500" : "text-stone-400"}`}>
                        ({days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`})
                      </span>
                    </p>

                    {listing.message && (
                      <p className="text-xs text-stone-500 italic mb-2 bg-stone-50 rounded-lg px-3 py-2">
                        "{listing.message}"
                      </p>
                    )}

                    {listing.pickupLocation && (
                      <p className="text-xs text-stone-400 mb-3">📍 {listing.pickupLocation}</p>
                    )}

                    {isExpanded ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={messages[listing.id] ?? ""}
                          onChange={e => setMessages(prev => ({ ...prev, [listing.id]: e.target.value }))}
                          rows={2}
                          placeholder="Introduce yourself or add a pickup note… (optional)"
                          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none placeholder:text-stone-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitRequest(listing.id)}
                            disabled={isSubmitting}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            {isSubmitting ? "Sending…" : "Send request 🤝"}
                          </button>
                          <button
                            onClick={() => setRequestingId(null)}
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestClick(listing.id)}
                        className="w-full mt-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        Request this item 🤝
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}