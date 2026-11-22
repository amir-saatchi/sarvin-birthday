"use client";

import React from "react";

// Original kawaii pink bunny hood with bow (My Melody-inspired pastel charm)
export function PinkBunnyBadge({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {/* Left upright ear */}
      <ellipse cx="27" cy="24" rx="9" ry="20" transform="rotate(-12 27 24)" fill="#ff85c0" stroke="#fff" strokeWidth="3" />
      <ellipse cx="27" cy="25" rx="4.5" ry="12" transform="rotate(-12 27 25)" fill="#ffd6ec" />
      {/* Right cute floppy ear */}
      <ellipse cx="55" cy="27" rx="9" ry="18" transform="rotate(28 55 27)" fill="#ff85c0" stroke="#fff" strokeWidth="3" />
      <ellipse cx="55" cy="28" rx="4.5" ry="10" transform="rotate(28 55 28)" fill="#ffd6ec" />
      {/* Hood */}
      <circle cx="40" cy="49" r="24" fill="#ff85c0" stroke="#fff" strokeWidth="3" />
      {/* Face */}
      <ellipse cx="40" cy="52" rx="17" ry="14" fill="#fffaf5" />
      {/* Eyes */}
      <circle cx="33" cy="51" r="2.6" fill="#3b1d5e" />
      <circle cx="47" cy="51" r="2.6" fill="#3b1d5e" />
      {/* Cheeks */}
      <ellipse cx="28" cy="55" rx="3.2" ry="1.8" fill="#ffb3d9" />
      <ellipse cx="52" cy="55" rx="3.2" ry="1.8" fill="#ffb3d9" />
      {/* Tiny nose */}
      <ellipse cx="40" cy="54" rx="2.2" ry="1.5" fill="#fbbf24" />
      {/* Cute bow */}
      <path d="M47 34 L56 29 L54 39 Z" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M47 34 L38 29 L40 39 Z" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="47" cy="34" r="3.2" fill="#f472b6" />
    </svg>
  );
}

// Original kawaii lavender/plum jester-bunny hood with heart (Kuromi-inspired playful charm)
export function PurpleBunnyBadge({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {/* Pointy playful ears */}
      <path d="M23 36 L14 11 L35 28 Z" fill="#4c1d95" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M57 36 L66 11 L45 28 Z" fill="#4c1d95" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      {/* Pom-poms on tips */}
      <circle cx="14" cy="11" r="4.5" fill="#f472b6" stroke="#fff" strokeWidth="1.5" />
      <circle cx="66" cy="11" r="4.5" fill="#f472b6" stroke="#fff" strokeWidth="1.5" />
      {/* Hood */}
      <circle cx="40" cy="49" r="24" fill="#4c1d95" stroke="#fff" strokeWidth="3" />
      {/* Face */}
      <ellipse cx="40" cy="53" rx="17" ry="13.5" fill="#fffaf5" />
      {/* Cute heart emblem on forehead */}
      <path
        d="M40 39 C38 35.5 33 36 33 39.5 C33 42.5 40 46 40 46 C40 46 47 42.5 47 39.5 C47 36 42 35.5 40 39 Z"
        fill="#f472b6"
      />
      {/* Eyes */}
      <circle cx="33" cy="53" r="2.6" fill="#3b1d5e" />
      <circle cx="47" cy="53" r="2.6" fill="#3b1d5e" />
      {/* Cheeks */}
      <ellipse cx="28" cy="57" rx="3.2" ry="1.8" fill="#e9d5ff" />
      <ellipse cx="52" cy="57" rx="3.2" ry="1.8" fill="#e9d5ff" />
      {/* Tiny nose */}
      <ellipse cx="40" cy="55.5" rx="2" ry="1.4" fill="#f472b6" />
    </svg>
  );
}

// Original kawaii pastel unicorn badge
export function UnicornBadge({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      {/* Golden Horn */}
      <path d="M40 6 L47 28 L33 28 Z" fill="#fbbf24" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Ears */}
      <ellipse cx="25" cy="29" rx="6" ry="11" transform="rotate(-25 25 29)" fill="#fff" stroke="#f9a8d4" strokeWidth="2.5" />
      <ellipse cx="55" cy="29" rx="6" ry="11" transform="rotate(25 55 29)" fill="#fff" stroke="#c084fc" strokeWidth="2.5" />
      {/* Rainbow Mane */}
      <circle cx="31" cy="29" r="7" fill="#f472b6" />
      <circle cx="40" cy="27" r="7" fill="#a855f7" />
      <circle cx="49" cy="29" r="7" fill="#38bdf8" />
      {/* Head */}
      <ellipse cx="40" cy="49" rx="22" ry="20" fill="#ffffff" stroke="#fbcfe8" strokeWidth="3" />
      {/* Eyes */}
      <circle cx="32" cy="47" r="2.8" fill="#3b1d5e" />
      <circle cx="48" cy="47" r="2.8" fill="#3b1d5e" />
      <circle cx="31" cy="46" r="1" fill="#fff" />
      <circle cx="47" cy="46" r="1" fill="#fff" />
      {/* Rosy muzzle */}
      <ellipse cx="40" cy="57" rx="11" ry="7" fill="#ffe4f3" />
      <circle cx="36" cy="56" r="1.4" fill="#f472b6" />
      <circle cx="44" cy="56" r="1.4" fill="#f472b6" />
    </svg>
  );
}
