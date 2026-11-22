"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Stars } from "lucide-react";
import { PinkBunnyBadge, PurpleBunnyBadge, UnicornBadge } from "@/components/KawaiiDecor";
import { t } from "@/config/translate";

export default function GamesListPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 flex items-center justify-center gap-3">
          <PinkBunnyBadge className="h-12 w-12 animate-float-slow" />
          <Stars className="h-8 w-8 text-pink-500" />
          <PurpleBunnyBadge className="h-12 w-12 animate-float-slow" />
        </div>

        <h1 className="font-display rainbow-text mb-2 text-3xl font-bold leading-snug sm:text-5xl">
          {t.gamesList.title}
        </h1>
        <p className="mx-auto max-w-xl text-base font-bold text-purple-800/85 sm:text-lg">
          {t.gamesList.subtitle}
        </p>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Game 0 Card: Unicorn Castle World (Featured!) */}
        <Link href="/games/castle-world" className="group block">
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="kuromi-card relative h-full overflow-hidden rounded-[2rem] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UnicornBadge className="h-14 w-14" />
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  {t.home.gameTag3D}
                </span>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md transition group-hover:-translate-x-1">
                <ArrowLeft className="h-5 w-5" />
              </span>
            </div>

            <h2 className="font-display mb-2 text-2xl font-bold text-purple-900">
              {t.home.castleCardTitle}
            </h2>
            <p className="text-sm font-semibold text-purple-800/80 sm:text-base">
              {t.home.castleCardDesc}
            </p>
          </motion.div>
        </Link>

        {/* Game 1 Card */}
        <Link href="/games/balloon-pop" className="group block">
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="kawaii-card relative h-full overflow-hidden rounded-[2rem] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PinkBunnyBadge className="h-14 w-14" />
                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-extrabold text-pink-600">
                  {t.home.gameTag3D}
                </span>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md transition group-hover:-translate-x-1">
                <ArrowLeft className="h-5 w-5" />
              </span>
            </div>

            <h2 className="font-display mb-2 text-2xl font-bold text-purple-900">
              {t.home.balloonCardTitle}
            </h2>
            <p className="text-sm font-semibold text-purple-800/80 sm:text-base">
              {t.home.balloonCardDesc}
            </p>
          </motion.div>
        </Link>

        {/* Game 2 Card */}
        <Link href="/games/unicorn-catch" className="group block">
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="kuromi-card relative h-full overflow-hidden rounded-[2rem] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UnicornBadge className="h-14 w-14" />
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-700">
                  {t.home.gameTag3D}
                </span>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md transition group-hover:-translate-x-1">
                <ArrowLeft className="h-5 w-5" />
              </span>
            </div>

            <h2 className="font-display mb-2 text-2xl font-bold text-purple-900">
              {t.home.unicornCardTitle}
            </h2>
            <p className="text-sm font-semibold text-purple-800/80 sm:text-base">
              {t.home.unicornCardDesc}
            </p>
          </motion.div>
        </Link>

        {/* Game 3 Card: Cake Decorator Studio */}
        <Link href="/games/cake-studio" className="group block">
          <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="kawaii-card relative h-full overflow-hidden rounded-[2rem] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PurpleBunnyBadge className="h-14 w-14" />
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
                  {t.home.gameTag3D}
                </span>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white shadow-md transition group-hover:-translate-x-1">
                <ArrowLeft className="h-5 w-5" />
              </span>
            </div>

            <h2 className="font-display mb-2 text-2xl font-bold text-purple-900">
              {t.home.cakeCardTitle}
            </h2>
            <p className="text-sm font-semibold text-purple-800/80 sm:text-base">
              {t.home.cakeCardDesc}
            </p>
          </motion.div>
        </Link>

        {/* Game 4 Card: Rainbow Fairy Piano */}
        <Link href="/games/fairy-piano" className="group block md:col-span-2">
          <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="kuromi-card relative h-full overflow-hidden rounded-[2rem] p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PinkBunnyBadge className="h-14 w-14" />
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-700">
                  {t.home.gameTag3D}
                </span>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-pink-500 to-purple-500 text-white shadow-md transition group-hover:-translate-x-1">
                <ArrowLeft className="h-5 w-5" />
              </span>
            </div>

            <h2 className="font-display mb-2 text-2xl font-bold text-purple-900">
              {t.home.pianoCardTitle}
            </h2>
            <p className="text-sm font-semibold text-purple-800/80 sm:text-base">
              {t.home.pianoCardDesc}
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
