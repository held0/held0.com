"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    { href: "/" as const, label: t("home") },
    { href: "/projekte" as const, label: t("projects") },
    { href: "/ueber" as const, label: t("about") },
  ];

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

        <div className="flex items-center gap-6">
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
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
