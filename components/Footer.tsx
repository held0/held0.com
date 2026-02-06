"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const openCookieSettings = () => {
    if (typeof window !== "undefined" && window.CookieConsent) {
      window.CookieConsent.showPreferences();
    }
  };

  return (
    <footer className="border-t border-[#1a1a1a] bg-[#0f0f0f]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="font-mono text-sm text-[#737373]">
              <span className="text-[#22d3ee]">{"// "}</span>
              {currentYear} Niklas Held
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-[#737373] sm:justify-start">
              <Link href="/impressum" className="transition-colors hover:text-[#e5e5e5]">
                {t("impressum")}
              </Link>
              <Link href="/datenschutz" className="transition-colors hover:text-[#e5e5e5]">
                {t("datenschutz")}
              </Link>
              <button
                onClick={openCookieSettings}
                className="transition-colors hover:text-[#e5e5e5]"
              >
                {t("cookieSettings")}
              </button>
            </div>
          </div>

          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
