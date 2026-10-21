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
        {/* „Live deployen“-Button nur auf dev-Seiten (Dienst hängt dort unter /__deploy) */}
        <Script id="dev-deploy" strategy="afterInteractive">
          {`if(location.hostname.indexOf("dev.")===0){var s=document.createElement("script");s.src="/__deploy/button.js";document.body.appendChild(s)}`}
        </Script>
        {/* Statistik (Umami) – nicht auf den internen /admin-Seiten */}
        <Script id="stats" strategy="afterInteractive">
          {`if(location.pathname.indexOf("/admin")!==0){var s=document.createElement("script");s.src="https://stats.held0.com/script.js";s.defer=true;s.setAttribute("data-website-id","b007ca44-f1cf-41b5-8535-c75c2552c78f");s.setAttribute("data-domains","held0.com,www.held0.com");document.body.appendChild(s)}`}
        </Script>
      </body>
    </html>
  );
}
