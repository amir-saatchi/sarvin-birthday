import type { Metadata } from "next";
import { Vazirmatn, Fredoka } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { MusicControls } from "@/components/audio/MusicControls";
import { GiftReveal } from "@/components/GiftReveal";
import { Navbar } from "@/components/Navbar";
import { ACTIVE_LOCALE, t } from "@/config/translate";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dir = ACTIVE_LOCALE === "fa" ? "rtl" : "ltr";

  return (
    <html lang={ACTIVE_LOCALE} dir={dir} className={`${vazirmatn.variable} ${fredoka.variable}`}>
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
