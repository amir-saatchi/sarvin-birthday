"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Castle, Sparkles, CloudRain } from "lucide-react";
import { UnicornBadge } from "./KawaiiDecor";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Castle",
    icon: Castle,
    activeClass: "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-pink-300/60",
  },
  {
    href: "/games/balloon-pop",
    label: "3D Balloons",
    icon: Sparkles,
    activeClass: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-purple-300/60",
  },
  {
    href: "/games/unicorn-catch",
    label: "3D Unicorn",
    icon: CloudRain,
    activeClass: "bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-sky-300/60",
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full px-3 pt-3 sm:px-6">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border-2 border-white/90 bg-white/80 px-3 py-2 shadow-lg shadow-purple-200/50 backdrop-blur-md sm:px-5"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full pr-2 transition hover:scale-105"
        >
          <UnicornBadge className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="font-display hidden text-lg font-bold text-purple-900 sm:inline">
            Sarvin&apos;s <span className="text-pink-500">5th</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-display flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-all sm:px-4 sm:text-base ${
                  isActive
                    ? `${item.activeClass} scale-105 shadow-md`
                    : "bg-pink-50/90 text-purple-800 hover:bg-pink-100"
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
