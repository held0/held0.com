import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://held0.com"),
  title: "held0",
  description: "Projekte von Niklas Held.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <main>{children}</main>
        <footer>
          <Link href="/impressum">impressum · datenschutz</Link>
        </footer>
        <Script
          src="https://stats.held0.com/script.js"
          data-website-id="b007ca44-f1cf-41b5-8535-c75c2552c78f"
          data-domains="held0.com,www.held0.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
