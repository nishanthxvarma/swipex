import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SwipeX — AI-Powered Job Discovery",
    template: "%s | SwipeX",
  },
  description:
    "Discover your dream job with a swipe. SwipeX uses AI to match you with personalized job opportunities, analyze your resume, and maximize your chances of getting hired.",
  keywords: [
    "job search",
    "AI jobs",
    "career discovery",
    "resume analyzer",
    "ATS score",
    "job matching",
    "swipe jobs",
  ],
  authors: [{ name: "SwipeX" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://swipex.app",
    siteName: "SwipeX",
    title: "SwipeX — AI-Powered Job Discovery",
    description:
      "Discover your dream job with a swipe. AI-powered matching, resume analysis, and personalized recommendations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwipeX — AI-Powered Job Discovery",
    description:
      "Discover your dream job with a swipe. AI-powered matching and personalized recommendations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
