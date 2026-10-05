import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PackPal — Pack smarter. Travel lighter.",
  description:
    "A local-AI travel companion for planning trips, packing smarter, organizing itineraries and splitting expenses with friends. Powered by Gemma 2 + Ollama.",
  keywords: ["PackPal", "Travel Planner", "Packing Assistant", "Gemma 2", "Ollama", "Hacktoberfest 2026", "TripSplit"],
  openGraph: {
    title: "PackPal — Pack smarter. Travel lighter.",
    description: "A local-AI travel companion for planning trips, packing smarter, organizing itineraries and splitting expenses with friends.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full max-w-full">{children}</body>
    </html>
  );
}
