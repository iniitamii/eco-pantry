"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "./NotificationBell";
import type { Notification } from "@prisma/client";

interface Props {
  notifications?: Notification[];
  unreadCount?:   number;
}

const NAV_LINKS = [
  { href: "/dashboard",  label: "🏠 Pantry"       },
  { href: "/meal-plan",  label: "✨ Meal Planner"  },
  { href: "/donations",  label: "🤝 Donations"     },
  { href: "/analytics",  label: "📊 Analytics"     },
];

export function Navbar({ notifications = [], unreadCount = 0 }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session } = useSession();

  const userName  = session?.user?.name  ?? "";
  const userImage = session?.user?.image ?? null;

  function navigate(href: string) {
    router.push(href);
    setIsMenuOpen(false);
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <nav
        className="bg-white/80 backdrop-blur border-b border-stone-100 sticky top-0 z-40"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span style={{ fontFamily: "'Lora', serif" }} className="font-semibold text-stone-800">
              EcoPantry
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => navigate(href)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === href
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden sm:flex items-center gap-3">
            <NotificationBell unreadCount={unreadCount} notifications={notifications} />

            <button
              onClick={() => navigate("/settings")}
              className={`text-xs font-medium transition-colors ${
                pathname === "/settings"
                  ? "text-emerald-700"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              ⚙️
            </button>

            <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
              {userImage && (
                <img src={userImage} alt={userName} className="w-7 h-7 rounded-full object-cover" />
              )}
              <span className="text-xs text-stone-600 max-w-20 truncate">{userName}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-stone-400 hover:text-rose-500 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Mobile: bell + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <NotificationBell unreadCount={unreadCount} notifications={notifications} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-stone-400 hover:text-stone-600"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur border-b border-stone-100 shadow-md z-50">
            <div className="max-w-5xl mx-auto px-4 py-3 space-y-1">

              {NAV_LINKS.map(({ href, label }) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === href
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {label}
                </button>
              ))}

              <div className="border-t border-stone-100 pt-3 mt-2 space-y-1">
                <button
                  onClick={() => navigate("/settings")}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === "/settings"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  ⚙️ Settings
                </button>

                <div className="flex items-center gap-2 px-3 py-2">
                  {userImage && (
                    <img src={userImage} alt={userName} className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span className="text-sm text-stone-600 truncate">{userName}</span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}