import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Suspense } from "react";
import { PWARegister } from "@/components/layout/pwa-register";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Volt",
  description: "Volt v2.0 - The personal knowledge operating system. Save, organize, and link resources, notes, categories, people, and media watchlists.",
  openGraph: {
    title: "Volt",
    description: "Volt v2.0 - The personal knowledge operating system. Save, organize, and link resources, notes, categories, people, and media watchlists.",
    siteName: "Volt",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volt",
    description: "Volt v2.0 - The personal knowledge operating system. Save, organize, and link resources, notes, categories, people, and media watchlists.",
  },
  verification: {
    google: "-Yn2JXXqhEK1dVAiHMaEM_OapfXKA3OHM32EwznOG5o"
  }
};

import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col [--header-height:calc(--spacing(14))]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <PWARegister />
            {/* <LenisProvider> */}
            <Suspense fallback={<div className="flex-1 min-h-screen bg-background" />}>
              {children}
            </Suspense>
            {/* </LenisProvider> */}
            <Toaster position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
