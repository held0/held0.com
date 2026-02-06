import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en"],
  defaultLocale: "de",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/projekte": {
      de: "/projekte",
      en: "/projects",
    },
    "/ueber": {
      de: "/ueber",
      en: "/about",
    },
    "/kontakt": {
      de: "/kontakt",
      en: "/contact",
    },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/impressum": "/impressum",
    "/datenschutz": "/datenschutz",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
