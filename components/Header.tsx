"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projekte", label: "Projekte" },
  { href: "/ueber", label: "Über" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0f0f0f]/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-lg font-semibold text-[#e5e5e5] transition-colors hover:text-[#22d3ee]"
        >
          <span className="text-[#22d3ee]">{"<"}</span>
          held0
          <span className="text-[#22d3ee]">{" />"}</span>
        </Link>

        <ul className="flex items-center gap-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                    ? "text-[#22d3ee]"
                    : "text-[#737373] hover:text-[#e5e5e5]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
