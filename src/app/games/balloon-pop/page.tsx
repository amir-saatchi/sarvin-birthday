"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PinkBunnyBadge } from "@/components/KawaiiDecor";
import { GameFullscreenWrapper } from "@/components/GameFullscreenWrapper";
import { t } from "@/config/translate";

const BalloonPopGame3D = dynamic(
  () => import("@/components/three/BalloonPopGame3D").then((m) => m.BalloonPopGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[58dvh] min-h-[340px] w-full items-center justify-center rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b from-sky-200 to-pink-200 sm:h-[520px] sm:rounded-[2rem]">
        <div className="font-display animate-pulse text-lg font-bold text-purple-800 sm:text-xl">
          {t.balloonGame.loading}
        </div>
      </div>
    ),
  }
);

export default function BalloonPopPage() {
  return (
    <GameFullscreenWrapper
      title={t.balloonGame.title}
      subtitle={t.balloonGame.subtitle}
      tip={t.balloonGame.tip}
      tipIconColor="text-amber-500"
      badge={<PinkBunnyBadge className="h-10 w-10 sm:h-12 sm:w-12" />}
    >
      <BalloonPopGame3D />
    </GameFullscreenWrapper>
  );
}
