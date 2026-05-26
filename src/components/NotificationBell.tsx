"use client";

import { useState, useTransition } from "react";
import type { Notification } from "@prisma/client";

interface Props {
  unreadCount:   number;
  notifications: Notification[];
}

const TYPE_ICONS: Record<string, string> = {
  EXPIRY_ALERT:     "⚠️",
  DONATION_CLAIMED: "🤝",
  CLAIM_CONFIRMED:  "🎉",
};

export function NotificationBell({ unreadCount: initialCount, notifications: initial }: Props) {
  const [open, setOpen]               = useState(false);
  const [count, setCount]             = useState(initialCount);
  const [notifications, setNotifications] = useState<Notification[]>(initial);
  const [, startTransition]           = useTransition();

  function handleOpen() {
    setOpen(prev => !prev);
    if (count > 0) {
      startTransition(async () => {
        await fetch("/api/notifications/mark-read", { method: "POST" });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setCount(0);
      });
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-stone-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-50">
              <p className="text-sm font-semibold text-stone-700">Notifications</p>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-stone-400">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-stone-50">
                {notifications.map(n => (
                  <li key={n.id} className={`px-4 py-3 ${!n.isRead ? "bg-emerald-50/50" : ""}`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-700">{n.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-stone-300 mt-1">
                          {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}