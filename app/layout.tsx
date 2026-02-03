import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Niklas Held - Software Developer",
    template: "%s | Niklas Held",
  },
  description:
    "Software Developer aus Deutschland. Ich baue Web-Apps und mobile Anwendungen mit modernen Technologien.",
  keywords: ["Software Developer", "Web Development", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Niklas Held" }],
  creator: "Niklas Held",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://held0.com",
    siteName: "Niklas Held",
    title: "Niklas Held - Software Developer",
    description:
      "Software Developer aus Deutschland. Ich baue Web-Apps und mobile Anwendungen mit modernen Technologien.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Niklas Held - Software Developer",
    description:
      "Software Developer aus Deutschland. Ich baue Web-Apps und mobile Anwendungen mit modernen Technologien.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
