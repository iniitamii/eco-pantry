import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "EcoPantry — Sustainable Food Tracker",
  description: "Track your pantry, reduce waste, eat smart.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F0E8] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
