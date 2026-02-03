"use client";

import Script from "next/script";

interface CookieConsentProps {
  gaId?: string;
}

declare global {
  interface Window {
    CookieConsent: {
      run: (config: unknown) => void;
      acceptedCategory: (category: string) => boolean;
      showPreferences: () => void;
    };
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    gaLoaded?: boolean;
  }
}

export function CookieConsent({ gaId }: CookieConsentProps) {
  const initCookieConsent = () => {
    if (typeof window === "undefined" || !window.CookieConsent) return;

    const loadGoogleAnalytics = (measurementId: string) => {
      if (window.gaLoaded) return;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", measurementId);

      window.gaLoaded = true;
    };

    window.CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "middle center",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          position: "right",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },

      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: "_gid" }],
          },
        },
      },

      language: {
        default: "de",
        autoDetect: "document",
        translations: {
          de: {
            consentModal: {
              title: "Cookie-Einstellungen",
              description:
                'Wir nutzen Cookies, um Ihnen die bestmögliche Nutzung unserer Website zu ermöglichen. <a href="/datenschutz">Datenschutzerklärung</a>',
              acceptAllBtn: "Alle akzeptieren",
              acceptNecessaryBtn: "Nur notwendige",
              showPreferencesBtn: "Einstellungen",
            },
            preferencesModal: {
              title: "Cookie-Einstellungen",
              acceptAllBtn: "Alle akzeptieren",
              acceptNecessaryBtn: "Nur notwendige",
              savePreferencesBtn: "Auswahl speichern",
              closeIconLabel: "Schließen",
              sections: [
                {
                  title: "Cookie-Nutzung",
                  description:
                    'Wir verwenden Cookies, um die grundlegenden Funktionen der Website zu gewährleisten und um Ihr Online-Erlebnis zu verbessern. <a href="/datenschutz" class="cc-link">Datenschutzerklärung</a>',
                },
                {
                  title: "Notwendige Cookies",
                  description:
                    "Diese Cookies sind für das ordnungsgemäße Funktionieren der Website unerlässlich.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analyse-Cookies",
                  description:
                    "Diese Cookies ermöglichen es uns, Besuche und Verkehrsquellen zu zählen, damit wir die Leistung unserer Website messen und verbessern können.",
                  linkedCategory: "analytics",
                },
              ],
            },
          },
        },
      },

      onConsent: function () {
        if (window.CookieConsent.acceptedCategory("analytics") && gaId) {
          loadGoogleAnalytics(gaId);
        }
      },

      onChange: function () {
        if (window.CookieConsent.acceptedCategory("analytics") && gaId) {
          loadGoogleAnalytics(gaId);
        }
      },
    });

    if (window.CookieConsent.acceptedCategory("analytics") && gaId) {
      loadGoogleAnalytics(gaId);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css"
      />
      <Script
        src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"
        strategy="afterInteractive"
        onLoad={initCookieConsent}
      />
    </>
  );
}
