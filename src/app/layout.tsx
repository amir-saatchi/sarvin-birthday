import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { MusicControls } from "@/components/audio/MusicControls";
import { GiftReveal } from "@/components/GiftReveal";
import { Navbar } from "@/components/Navbar";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Happy 5th Birthday, Sarvin! | Magical Unicorn & Fairy Wonderland",
  description:
    "A magical 5th birthday website for Princess Sarvin with music, a 3D birthday cake, and 3D unicorn & rainbow mini-games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen antialiased selection:bg-pink-300 selection:text-purple-900">
        <AudioProvider>
          <GiftReveal />
          <Navbar />
          <main className="pb-24">{children}</main>
          <MusicControls />
        </AudioProvider>
      </body>
    </html>
  );
}
