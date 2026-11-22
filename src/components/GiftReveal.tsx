"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Gift } from "lucide-react";
import { useBirthdayAudio } from "./audio/AudioProvider";
import { PinkBunnyBadge, PurpleBunnyBadge, UnicornBadge } from "./KawaiiDecor";
import { playSparkleSound } from "@/lib/soundEffects";
import { t } from "@/config/translate";

export function GiftReveal() {
  const { hasEntered, startExperience } = useBirthdayAudio();

  const handleOpen = () => {
    playSparkleSound();
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.55 },
      colors: ["#ff6eb4", "#c084fc", "#38bdf8", "#fbbf24", "#4ade80"],
    });
    startExperience();
  };

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 p-6 text-center"
        >
          {/* Floating kawaii friends */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <PinkBunnyBadge className="h-16 w-16 sm:h-20 sm:w-20" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <UnicornBadge className="h-20 w-20 sm:h-24 sm:w-24" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [4, -4, 4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <PurpleBunnyBadge className="h-16 w-16 sm:h-20 sm:w-20" />
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="kawaii-card max-w-md rounded-[2rem] p-8"
          >
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1 text-xs font-bold text-white shadow">
              <Sparkles className="h-3.5 w-3.5" />
              {t.giftReveal.badge}
              <Sparkles className="h-3.5 w-3.5" />
            </div>

            <h1 className="font-display mb-2 text-4xl font-bold text-purple-900 sm:text-5xl">
              {t.giftReveal.greeting}
            </h1>
            <p className="mb-7 text-base font-semibold text-purple-700/90 sm:text-lg">
              {t.giftReveal.subtitle}
            </p>

            <motion.button
              type="button"
              onClick={handleOpen}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
              className="font-display inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-8 py-4 text-xl font-bold text-white shadow-xl shadow-pink-400/40 ring-4 ring-white/80"
            >
              <Gift className="h-7 w-7" />
              {t.giftReveal.openButton}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
