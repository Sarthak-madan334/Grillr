import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grillr",
  description:
    "AI-powered mock interviews with adaptive questioning and structured feedback.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--surface)] text-[var(--foreground)]">
        <AuthProvider>
          <div className="app-frame">{children}</div>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
