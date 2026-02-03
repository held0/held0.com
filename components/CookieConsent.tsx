"use client";

import { useEffect } from "react";
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
  useEffect(() => {
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
                'Wir nutzen Cookies, um Ihnen die bestmögliche Nutzung unserer Website zu ermöglichen und unsere Kommunikation mit Ihnen zu verbessern. Wir berücksichtigen Ihre Auswahl und verwenden nur die Daten, für die Sie uns Ihr Einverständnis geben. <a href="/datenschutz">Datenschutzerklärung</a>',
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
                    'Wir verwenden Cookies, um die grundlegenden Funktionen der Website zu gewährleisten und um Ihr Online-Erlebnis zu verbessern. Für jede Kategorie können Sie wählen, ob Sie sich ein- oder austragen möchten. <a href="/datenschutz" class="cc-link">Datenschutzerklärung</a>',
                },
                {
                  title: "Notwendige Cookies",
                  description:
                    "Diese Cookies sind für das ordnungsgemäße Funktionieren der Website unerlässlich. Ohne diese Cookies würde die Website nicht richtig funktionieren.",
                  linkedCategory: "necessary",
                  cookieTable: {
                    headers: {
                      name: "Cookie",
                      domain: "Domain",
                      desc: "Beschreibung",
                      expiration: "Ablauf",
                    },
                    body: [
                      {
                        name: "cc_cookie",
                        domain: location.hostname,
                        desc: "Speichert Ihre Cookie-Einstellungen",
                        expiration: "6 Monate",
                      },
                    ],
                  },
                },
                {
                  title: "Analyse-Cookies",
                  description:
                    "Diese Cookies ermöglichen es uns, Besuche und Verkehrsquellen zu zählen, damit wir die Leistung unserer Website messen und verbessern können.",
                  linkedCategory: "analytics",
                  cookieTable: {
                    headers: {
                      name: "Cookie",
                      domain: "Domain",
                      desc: "Beschreibung",
                      expiration: "Ablauf",
                    },
                    body: [
                      {
                        name: "_ga",
                        domain: ".google.com",
                        desc: "Unterscheidet einzelne Nutzer",
                        expiration: "2 Jahre",
                      },
                      {
                        name: "_ga_*",
                        domain: ".google.com",
                        desc: "Speichert Session-Status",
                        expiration: "2 Jahre",
                      },
                      {
                        name: "_gid",
                        domain: ".google.com",
                        desc: "Unterscheidet einzelne Nutzer",
                        expiration: "24 Stunden",
                      },
                    ],
                  },
                },
              ],
            },
          },
          en: {
            consentModal: {
              title: "Cookie Settings",
              description:
                'We use cookies to provide you with the best possible use of our website and to improve our communication with you. We respect your choices and only use data for which you give us consent. <a href="/datenschutz">Privacy Policy</a>',
              acceptAllBtn: "Accept all",
              acceptNecessaryBtn: "Necessary only",
              showPreferencesBtn: "Settings",
            },
            preferencesModal: {
              title: "Cookie Settings",
              acceptAllBtn: "Accept all",
              acceptNecessaryBtn: "Necessary only",
              savePreferencesBtn: "Save settings",
              closeIconLabel: "Close",
              sections: [
                {
                  title: "Cookie Usage",
                  description:
                    'We use cookies to ensure basic website functionality and to enhance your online experience. You can choose to opt in or out of each category. <a href="/datenschutz" class="cc-link">Privacy Policy</a>',
                },
                {
                  title: "Necessary Cookies",
                  description:
                    "These cookies are essential for the proper functioning of the website. Without these cookies, the website would not work properly.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analytics Cookies",
                  description:
                    "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our website.",
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
  }, [gaId]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css"
      />
      <Script
        src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js"
        strategy="afterInteractive"
      />
    </>
  );
}
