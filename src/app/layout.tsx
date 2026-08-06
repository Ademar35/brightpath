import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const display = Baloo_2({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "BrightPath — Learning Made Fun",
  description: "Adaptive K-8 learning with AI study buddies, personalized for every kid.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased min-h-screen bg-sky-50`}>
        {children}
      </body>
    </html>
  );
}
