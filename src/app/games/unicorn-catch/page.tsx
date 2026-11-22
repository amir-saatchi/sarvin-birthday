"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { UnicornBadge } from "@/components/KawaiiDecor";
import { t } from "@/config/translate";

const UnicornCatchGame3D = dynamic(
  () => import("@/components/three/UnicornCatchGame3D").then((m) => m.UnicornCatchGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[470px] w-full items-center justify-center rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-indigo-200 to-pink-200 sm:h-[540px]">
        <div className="font-display animate-pulse text-xl font-bold text-purple-800">
          {t.unicornGame.loading}
        </div>
      </div>
    ),
  }
);

export default function UnicornCatchPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <UnicornBadge className="h-9 w-9 shrink-0 sm:h-12 sm:w-12" />
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold text-purple-900 sm:text-4xl">
              {t.unicornGame.title}
            </h1>
            <p className="hidden text-sm font-bold text-purple-700/85 sm:block">
              {t.unicornGame.subtitle}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="font-display inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-purple-200 bg-white/85 px-3 py-1.5 text-xs font-bold text-purple-900 shadow-sm transition hover:bg-purple-50 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.nav.backToCastle}
        </Link>
      </div>

      <UnicornCatchGame3D />

      <div className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-bold text-purple-800/75 sm:mt-4 sm:text-sm">
        <Sparkles className="h-4 w-4 shrink-0 text-pink-500" />
        <span>{t.unicornGame.tip}</span>
      </div>
    </div>
  );
}
