"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Castle, Sparkles, CloudRain } from "lucide-react";
import { UnicornBadge } from "./KawaiiDecor";
import { t } from "@/config/translate";

const NAV_ITEMS = [
  {
    href: "/",
    label: t.nav.castle,
    icon: Castle,
    activeClass: "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-300/60",
  },
  {
    href: "/games/balloon-pop",
    label: t.nav.balloonGame,
    icon: Sparkles,
    activeClass: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-purple-300/60",
  },
  {
    href: "/games/unicorn-catch",
    label: t.nav.unicornGame,
    icon: CloudRain,
    activeClass: "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-sky-300/60",
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full px-2.5 pt-2.5 sm:px-6 sm:pt-3">
      <nav
        aria-label={t.nav.ariaLabel}
        className="mx-auto flex max-w-5xl items-center justify-between gap-1.5 rounded-full border-2 border-white/90 bg-white/80 px-2.5 py-1.5 shadow-lg shadow-purple-200/50 backdrop-blur-md sm:gap-2 sm:px-5 sm:py-2"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full transition hover:scale-105 sm:pl-2"
        >
          <UnicornBadge className="h-7 w-7 sm:h-10 sm:w-10" />
          <span className="font-display hidden text-lg font-bold text-purple-900 sm:inline">
            {t.nav.brandName} <span className="text-pink-500">{t.nav.brandAge}</span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-display flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all sm:gap-1.5 sm:px-4 sm:py-2 sm:text-base ${
                  isActive
                    ? `${item.activeClass} shadow-md sm:scale-105`
                    : "bg-pink-50/90 text-purple-800 hover:bg-pink-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
