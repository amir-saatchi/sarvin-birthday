"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Castle, Gamepad2 } from "lucide-react";
import { UnicornBadge } from "./KawaiiDecor";
import { t } from "@/config/translate";

const NAV_ITEMS = [
  {
    href: "/",
    label: t.nav.castle,
    icon: Castle,
    isActive: (pathname: string) => pathname === "/",
    activeClass: "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-300/60",
  },
  {
    href: "/games",
    label: t.nav.games,
    icon: Gamepad2,
    isActive: (pathname: string) => pathname.startsWith("/games"),
    activeClass: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-purple-300/60",
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full px-3 pt-3 sm:px-6">
      <nav
        aria-label={t.nav.ariaLabel}
        className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border-2 border-white/90 bg-white/80 px-3 py-2 shadow-lg shadow-purple-200/50 backdrop-blur-md sm:px-5"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full transition hover:scale-105 sm:pl-2"
        >
          <UnicornBadge className="h-8 w-8 sm:h-10 sm:w-10" />
          <span className="font-display hidden text-lg font-bold text-purple-900 sm:inline">
            {t.nav.brandName} <span className="text-pink-500">{t.nav.brandAge}</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-display flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all sm:px-5 sm:py-2 sm:text-base ${
                  active
                    ? `${item.activeClass} shadow-md sm:scale-105`
                    : "bg-pink-50/90 text-purple-800 hover:bg-pink-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
