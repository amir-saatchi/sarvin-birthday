"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { UnicornBadge } from "@/components/KawaiiDecor";

const UnicornCatchGame3D = dynamic(
  () => import("@/components/three/UnicornCatchGame3D").then((m) => m.UnicornCatchGame3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[470px] w-full items-center justify-center rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-indigo-200 to-pink-200 sm:h-[540px]">
        <div className="font-display animate-pulse text-xl font-bold text-purple-800">
          Waking Up Your 3D Unicorn...
        </div>
      </div>
    ),
  }
);

export default function UnicornCatchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UnicornBadge className="h-12 w-12" />
          <div>
            <h1 className="font-display text-2xl font-bold text-purple-900 sm:text-4xl">
              3D Unicorn Cloud Catcher
            </h1>
            <p className="text-sm font-bold text-purple-700/85">
              Slide your finger, mouse, or arrow keys to catch 15 magical birthday treats!
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="font-display inline-flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white/85 px-4 py-2 text-sm font-bold text-purple-900 shadow-sm transition hover:bg-purple-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Castle
        </Link>
      </div>

      <UnicornCatchGame3D />

      <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-bold text-purple-800/75 sm:text-sm">
        <Sparkles className="h-4 w-4 text-pink-500" />
        <span>Catch cupcakes, strawberries, purple gems &amp; golden stars to win the Princess Tiara!</span>
      </div>
    </div>
  );
}
