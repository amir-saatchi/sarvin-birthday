"use client";

import React from "react";
import dynamic from "next/dynamic";
import { UnicornBadge } from "@/components/KawaiiDecor";
import { GameFullscreenWrapper } from "@/components/GameFullscreenWrapper";
import { t } from "@/config/translate";

const CastleWorldGame3D = dynamic(
  () => import("@/components/three/CastleWorldGame3D").then((m) => m.CastleWorldGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[60dvh] min-h-[360px] w-full items-center justify-center rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-purple-400 via-pink-200 to-emerald-200 sm:h-[540px] sm:rounded-[2rem]">
        <div className="font-display animate-pulse text-lg font-bold text-purple-900 sm:text-xl">
          {t.castleWorld.loading}
        </div>
      </div>
    ),
  }
);

export default function CastleWorldPage() {
  return (
    <GameFullscreenWrapper
      title={t.castleWorld.title}
      subtitle={t.castleWorld.subtitle}
      tip={t.castleWorld.tip}
      tipIconColor="text-amber-500"
      badge={<UnicornBadge className="h-10 w-10 sm:h-12 sm:w-12" />}
    >
      <CastleWorldGame3D />
    </GameFullscreenWrapper>
  );
}
