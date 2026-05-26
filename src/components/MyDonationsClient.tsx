"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDonation, removeDonation, confirmClaim } from "@/app/actions/donations";
import type { FoodItem, FoodCategory, DonationListing, DonationClaim } from "@prisma/client";

interface Claimer {
  id:    string;
  name:  string | null;
  image: string | null;
}

interface ClaimWithClaimer extends DonationClaim {
  claimer: Claimer;
}

interface ListingWithItem extends DonationListing {
  foodItem: FoodItem;
  claims:   ClaimWithClaimer[];
}

interface Props {
  listings:       ListingWithItem[];
  availableItems: FoodItem[];
}

const ICONS: Record<FoodCategory, string> = {
  DAIRY: "🥛", PRODUCE: "🥦", MEAT: "🥩", SEAFOOD: "🐟",
  GRAINS: "🌾", CANNED_GOODS: "🥫", FROZEN: "❄️", BEVERAGES: "🧃",
  CONDIMENTS: "🫙", SNACKS: "🍿", BAKERY: "🍞", OTHER: "📦",
};

function daysUntilExpiry(date: Date | string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

export function MyDonationsClient({ listings: initial, availableItems }: Props) {
  const [listings, setListings]         = useState<ListingWithItem[]>(initial);
  const [items, setItems]               = useState<FoodItem[]>(availableItems);
  const [showForm, setShowForm]         = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [message, setMessage]           = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupNotes, setPickupNotes]   = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [removingId, setRemovingId]     = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    if (!selectedItem) return;
    setError(null);
    startTransition(async () => {
      const result = await createDonation(
        selectedItem,
        message         || undefined,
        pickupLocation  || undefined,
        pickupNotes     || undefined,
      );
      if (result.success) {
        const item = items.find(i => i.id === selectedItem)!;
        setItems(prev => prev.filter(i => i.id !== selectedItem));
        setListings(prev => [{
          id:             Math.random().toString(),
          foodItemId:     selectedItem,
          userId:         "",
          message:        message        || null,
          pickupLocation: pickupLocation || null,
          pickupNotes:    pickupNotes    || null,
          isAvailable:    true,
          claimedAt:      null,
          createdAt:      new Date().toISOString() as any,
          updatedAt:      new Date().toISOString() as any,
          foodItem:       item,
          claims:         [],
        }, ...prev]);
        setShowForm(false);
        setSelectedItem("");
        setMessage("");
        setPickupLocation("");
        setPickupNotes("");
      } else {
        setError(result.error);
      }
    });
  }

  function handleRemove(listingId: string) {
    setRemovingId(listingId);
    startTransition(async () => {
      const result = await removeDonation(listingId);
      if (result.success) {
        const listing = listings.find(l => l.id === listingId);
        if (listing) {
          setItems(prev => [...prev, listing.foodItem].sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          ));
        }
        setListings(prev => prev.filter(l => l.id !== listingId));
      }
      setRemovingId(null);
    });
  }

  function handleConfirm(claimId: string, listingId: string) {
    setConfirmingId(claimId);
    startTransition(async () => {
      const result = await confirmClaim(claimId);
      if (result.success) {
        setListings(prev => prev.map(l => {
          if (l.id !== listingId) return l;
          return {
            ...l,
            isAvailable: false,
            claimedAt:   new Date().toISOString() as any,
            claims: l.claims.map(c => ({
              ...c,
              status: c.id === claimId ? "CONFIRMED" : "CANCELLED",
            })) as ClaimWithClaimer[],
          };
        }));
      }
      setConfirmingId(null);
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
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/donations")} className="text-xs text-emerald-700 font-medium hover:text-emerald-900 transition-colors">
                Community
              </button>
              <button onClick={() => router.push("/dashboard")} className="text-xs text-stone-500 hover:text-stone-700 transition-colors">
                ← Pantry
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 style={{ fontFamily: "'Lora', serif" }} className="text-3xl sm:text-4xl text-stone-800">
                My Donations
              </h1>
              <p className="text-stone-500 mt-1.5 text-sm">
                Share surplus food with your community before it expires.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={items.length === 0}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow transition-colors shrink-0"
            >
              + Donate Item
            </button>
          </div>

          {/* Create donation form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-stone-800 mb-4">List an item for donation</h2>

              {error && (
                <p className="mb-3 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Select item *</label>
                  <select
                    value={selectedItem}
                    onChange={e => setSelectedItem(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Choose a pantry item…</option>
                    {items.map(item => {
                      const days = daysUntilExpiry(item.expiryDate);
                      return (
                        <option key={item.id} value={item.id}>
                          {ICONS[item.category]} {item.name} — {item.quantity} {item.unit} ({days}d left)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Pickup location <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                    placeholder="e.g. Jl. Sunset Road No. 12, Seminyak"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Pickup notes <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={pickupNotes}
                    onChange={e => setPickupNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Available Mon–Fri 9am–5pm, ring the bell"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none placeholder:text-stone-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Message <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={2}
                    placeholder="e.g. Still fresh, opened yesterday"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none placeholder:text-stone-300"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCreate}
                    disabled={!selectedItem || isSubmitting}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {isSubmitting ? "Listing…" : "List for Donation 🤝"}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setError(null); }}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My listings */}
          {listings.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-5xl mb-4">🤝</p>
              <p className="font-medium text-stone-500">No active donations</p>
              <p className="text-sm mt-1">Click "Donate Item" to share surplus food with your community.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {listings.map(listing => {
                const days       = daysUntilExpiry(listing.foodItem.expiryDate);
                const isRemoving = removingId === listing.id;
                const pendingClaims = listing.claims.filter(c => c.status === "PENDING");
                const confirmedClaim = listing.claims.find(c => c.status === "CONFIRMED");

                return (
                  <li
                    key={listing.id}
                    className={`bg-white rounded-2xl border border-stone-100 shadow-sm p-5 transition-all ${isRemoving ? "opacity-40" : ""}`}
                  >
                    {/* Item row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{ICONS[listing.foodItem.category]}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 truncate">{listing.foodItem.name}</p>
                          <p className="text-xs text-stone-400">
                            {listing.foodItem.quantity} {listing.foodItem.unit} · expires in {days}d
                          </p>
                          {listing.pickupLocation && (
                            <p className="text-xs text-stone-400 mt-0.5">📍 {listing.pickupLocation}</p>
                          )}
                          {listing.message && (
                            <p className="text-xs text-stone-400 italic mt-0.5">"{listing.message}"</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          listing.isAvailable
                            ? pendingClaims.length > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                            : "bg-stone-100 text-stone-500"
                        }`}>
                          {listing.isAvailable
                            ? pendingClaims.length > 0
                              ? `${pendingClaims.length} request${pendingClaims.length > 1 ? "s" : ""}`
                              : "Available"
                            : "Claimed"}
                        </span>
                        {listing.isAvailable && (
                          <button
                            onClick={() => handleRemove(listing.id)}
                            disabled={isRemoving}
                            className="text-xs text-stone-400 hover:text-rose-500 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Confirmed claim */}
                    {confirmedClaim && (
                      <div className="mt-3 pt-3 border-t border-stone-50">
                        <p className="text-xs text-emerald-700 font-semibold mb-1">✅ Confirmed for</p>
                        <div className="flex items-center gap-2">
                          {confirmedClaim.claimer.image ? (
                            <img src={confirmedClaim.claimer.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 font-bold">
                              {confirmedClaim.claimer.name?.[0] ?? "?"}
                            </div>
                          )}
                          <span className="text-xs text-stone-600 font-medium">{confirmedClaim.claimer.name ?? "Anonymous"}</span>
                        </div>
                      </div>
                    )}

                    {/* Pending claims */}
                    {listing.isAvailable && pendingClaims.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-50">
                        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide mb-2">
                          Requests ({pendingClaims.length})
                        </p>
                        <ul className="space-y-2">
                          {pendingClaims.map(claim => (
                            <li key={claim.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {claim.claimer.image ? (
                                  <img src={claim.claimer.image} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs text-stone-600 font-bold shrink-0">
                                    {claim.claimer.name?.[0] ?? "?"}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-stone-700 truncate">{claim.claimer.name ?? "Anonymous"}</p>
                                  {claim.message && (
                                    <p className="text-xs text-stone-400 italic truncate">"{claim.message}"</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleConfirm(claim.id, listing.id)}
                                disabled={confirmingId === claim.id}
                                className="text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors shrink-0"
                              >
                                {confirmingId === claim.id ? "Confirming…" : "Confirm"}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
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