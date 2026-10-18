import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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
      </body>
    </html>
  );
}
