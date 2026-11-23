"use client";

import React from "react";
import dynamic from "next/dynamic";
import { UnicornBadge } from "@/components/KawaiiDecor";
import { GameFullscreenWrapper } from "@/components/GameFullscreenWrapper";
import { t } from "@/config/translate";

const UnicornCatchGame3D = dynamic(
  () => import("@/components/three/UnicornCatchGame3D").then((m) => m.UnicornCatchGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[58dvh] min-h-[340px] w-full items-center justify-center rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-indigo-200 to-pink-200 sm:h-[520px] sm:rounded-[2rem]">
        <div className="font-display animate-pulse text-lg font-bold text-purple-800 sm:text-xl">
          {t.unicornGame.loading}
        </div>
      </div>
    ),
  }
);

export default function UnicornCatchPage() {
  return (
    <GameFullscreenWrapper
      title={t.unicornGame.title}
      subtitle={t.unicornGame.subtitle}
      tip={t.unicornGame.tip}
      tipIconColor="text-pink-500"
      badge={<UnicornBadge className="h-10 w-10 sm:h-12 sm:w-12" />}
    >
      <UnicornCatchGame3D />
    </GameFullscreenWrapper>
  );
}
