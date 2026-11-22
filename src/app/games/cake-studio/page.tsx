"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { PurpleBunnyBadge } from "@/components/KawaiiDecor";
import { t } from "@/config/translate";

const CakeDecoratorGame3D = dynamic(
  () => import("@/components/three/CakeDecoratorGame3D").then((m) => m.CakeDecoratorGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[46dvh] min-h-[290px] w-full items-center justify-center rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-pink-200 to-purple-200 sm:h-[450px] sm:rounded-[2rem]">
        <div className="font-display animate-pulse text-lg font-bold text-purple-800 sm:text-xl">
          {t.cakeStudio.loading}
        </div>
      </div>
    ),
  }
);

export default function CakeStudioPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
        <PurpleBunnyBadge className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
        <div>
          <h1 className="font-display text-lg font-bold text-purple-900 sm:text-4xl">
            {t.cakeStudio.title}
          </h1>
          <p className="hidden text-sm font-bold text-purple-700/85 sm:block">
            {t.cakeStudio.subtitle}
          </p>
        </div>
      </div>

      <CakeDecoratorGame3D />

      <div className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-bold text-purple-800/75 sm:mt-4 sm:text-sm">
        <Sparkles className="h-4 w-4 shrink-0 text-pink-500" />
        <span>{t.cakeStudio.tip}</span>
      </div>
    </div>
  );
}
