import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alumni Directory",
    template: "%s | Alumni Directory",
  },
  description: "Connect with your fellow alumni",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Alumni Directory",
    description: "Connect with your fellow alumni",
    siteName: "Alumni Directory",
    images: [
      {
        url: "/api/og?title=Alumni%20Directory",
        width: 1200,
        height: 630,
        alt: "Alumni Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumni Directory",
    description: "Connect with your fellow alumni",
    images: ["/api/og?title=Alumni%20Directory"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
