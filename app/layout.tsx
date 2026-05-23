import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WBAcademy — World-Class AI Training Questionnaires",
    template: "%s | WBAcademy",
  },
  description:
    "The most powerful AI training data collection platform. Create adaptive questionnaires, collect high-quality human feedback, and train better AI models.",
  keywords: [
    "AI training",
    "questionnaire",
    "human feedback",
    "RLHF",
    "data collection",
    "survey",
    "AI data",
  ],
  authors: [{ name: "WBAcademy" }],
  creator: "WBAcademy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "WBAcademy — World-Class AI Training Questionnaires",
    description: "Collect high-quality human feedback to train better AI models.",
    siteName: "WBAcademy",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "WBAcademy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WBAcademy",
    description: "The most powerful AI training data collection platform.",
    creator: "@wbacademy",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              forcedTheme="light"
              disableTransitionOnChange
            >
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  classNames: {
                    toast:
                      "glass-card !bg-popover/95 !border-border !text-foreground",
                    title: "!text-foreground !font-semibold",
                    description: "!text-muted-foreground",
                    actionButton: "!bg-primary !text-primary-foreground",
                    cancelButton: "!bg-muted !text-muted-foreground",
                    success: "!border-green-500/30",
                    error: "!border-red-500/30",
                    warning: "!border-yellow-500/30",
                    info: "!border-blue-500/30",
                  },
                }}
              />
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
