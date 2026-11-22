"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles, Crown, Heart, ArrowLeft, Stars } from "lucide-react";
import { BIRTHDAY_CONFIG } from "@/config/birthday";
import { t } from "@/config/translate";
import { PinkBunnyBadge, PurpleBunnyBadge, UnicornBadge } from "@/components/KawaiiDecor";

const BirthdayCakeScene = dynamic(
  () => import("@/components/three/BirthdayCakeScene").then((m) => m.BirthdayCakeScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] w-full items-center justify-center rounded-[2rem] border-4 border-white/90 bg-gradient-to-b from-sky-200/80 via-pink-100/75 to-purple-200/80 sm:h-[460px]">
        <div className="font-display animate-pulse text-xl font-bold text-purple-800">
          {t.home.loadingCake}
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-pink-300/80 bg-white/85 px-4 py-1.5 text-sm font-extrabold text-pink-600 shadow-sm">
          <Crown className="h-4 w-4 fill-amber-300 text-amber-400" />
          <span>{BIRTHDAY_CONFIG.badge}</span>
          <Crown className="h-4 w-4 fill-amber-300 text-amber-400" />
        </div>

        <h1 className="font-display rainbow-text mb-3 text-4xl font-bold leading-snug sm:text-6xl">
          {BIRTHDAY_CONFIG.headline}
        </h1>
        <p className="mx-auto max-w-2xl text-base font-bold text-purple-800/85 sm:text-lg">
          {BIRTHDAY_CONFIG.subheadline}
        </p>
      </motion.section>

      {/* 3D Interactive 5-Candle Cake */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-10"
      >
        <BirthdayCakeScene />
      </motion.section>

      {/* 3D Games Arcade Portal */}
      <section className="mb-10">
        <div className="mb-5 flex items-center justify-center gap-3 text-center">
          <Stars className="h-7 w-7 text-pink-500" />
          <h2 className="font-display text-3xl font-bold text-purple-900 sm:text-4xl">
            {t.home.gamesSectionTitle}
          </h2>
          <Stars className="h-7 w-7 text-purple-500" />
        </div>

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

              <h3 className="font-display mb-2 text-2xl font-bold text-purple-900">
                {t.home.castleCardTitle}
              </h3>
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

              <h3 className="font-display mb-2 text-2xl font-bold text-purple-900">
                {t.home.balloonCardTitle}
              </h3>
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

              <h3 className="font-display mb-2 text-2xl font-bold text-purple-900">
                {t.home.unicornCardTitle}
              </h3>
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

              <h3 className="font-display mb-2 text-2xl font-bold text-purple-900">
                {t.home.cakeCardTitle}
              </h3>
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

              <h3 className="font-display mb-2 text-2xl font-bold text-purple-900">
                {t.home.pianoCardTitle}
              </h3>
              <p className="text-sm font-semibold text-purple-800/80 sm:text-base">
                {t.home.pianoCardDesc}
              </p>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Heartfelt Birthday Note */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="kawaii-card relative overflow-hidden rounded-[2rem] p-7 text-center sm:p-10"
      >
        <div className="mb-4 flex items-center justify-center gap-4">
          <PinkBunnyBadge className="h-12 w-12 animate-float-slow" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-md">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <PurpleBunnyBadge className="h-12 w-12 animate-float-slow" />
        </div>

        <h2 className="font-display mb-3 text-2xl font-bold text-purple-900 sm:text-3xl">
          {BIRTHDAY_CONFIG.messageTitle}
        </h2>
        <p className="mx-auto mb-5 max-w-2xl text-base leading-relaxed font-semibold text-purple-900/85 sm:text-lg">
          {BIRTHDAY_CONFIG.messageBody}
        </p>
        <div className="font-display inline-flex items-center gap-2 rounded-full bg-pink-100/90 px-5 py-2 text-base font-bold text-pink-600">
          <Sparkles className="h-4 w-4" />
          {BIRTHDAY_CONFIG.signature}
          <Sparkles className="h-4 w-4" />
        </div>
      </motion.section>
    </div>
  );
}
