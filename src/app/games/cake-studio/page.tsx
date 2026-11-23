"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PurpleBunnyBadge } from "@/components/KawaiiDecor";
import { GameFullscreenWrapper } from "@/components/GameFullscreenWrapper";
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
    <GameFullscreenWrapper
      title={t.cakeStudio.title}
      subtitle={t.cakeStudio.subtitle}
      tip={t.cakeStudio.tip}
      tipIconColor="text-pink-500"
      badge={<PurpleBunnyBadge className="h-10 w-10 sm:h-12 sm:w-12" />}
    >
      <CakeDecoratorGame3D />
    </GameFullscreenWrapper>
  );
}
