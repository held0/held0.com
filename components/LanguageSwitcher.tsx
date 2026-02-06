"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(
      // @ts-expect-error -- pathname is dynamic
      { pathname },
      { locale: newLocale as (typeof routing.locales)[number] }
    );
  };

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <button
        onClick={() => switchLocale("de")}
        className={`cursor-pointer transition-colors ${
          locale === "de" ? "text-[#22d3ee]" : "text-[#737373] hover:text-[#e5e5e5]"
        }`}
      >
        DE
      </button>
      <span className="text-[#737373]">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={`cursor-pointer transition-colors ${
          locale === "en" ? "text-[#22d3ee]" : "text-[#737373] hover:text-[#e5e5e5]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
