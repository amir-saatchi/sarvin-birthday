"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PinkBunnyBadge } from "@/components/KawaiiDecor";
import { GameFullscreenWrapper } from "@/components/GameFullscreenWrapper";
import { t } from "@/config/translate";

const FairyPianoGame3D = dynamic(
  () => import("@/components/three/FairyPianoGame3D").then((m) => m.FairyPianoGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[55dvh] min-h-[340px] w-full items-center justify-center rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-pink-200 to-sky-200 sm:h-[500px] sm:rounded-[2rem]">
        <div className="font-display animate-pulse text-lg font-bold text-purple-900 sm:text-xl">
          {t.fairyPiano.loading}
        </div>
      </div>
    ),
  }
);

export default function FairyPianoPage() {
  return (
    <GameFullscreenWrapper
      title={t.fairyPiano.title}
      subtitle={t.fairyPiano.subtitle}
      tip={t.fairyPiano.tip}
      tipIconColor="text-pink-500"
      badge={<PinkBunnyBadge className="h-10 w-10 sm:h-12 sm:w-12" />}
    >
      <FairyPianoGame3D />
    </GameFullscreenWrapper>
  );
}
