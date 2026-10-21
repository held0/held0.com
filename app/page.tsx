import type { Metadata } from "next";
import { projects } from "./projects";
import { SITE } from "./agent-text";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "held0", title: "held0", description: "Projekte von Niklas Held." },
};

// Strukturierte Daten: nur, was die Seite wirklich ist – eine Projektliste, Kontakt nur per E-Mail.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "held0",
      url: `${SITE}/`,
      logo: `${SITE}/icon.svg`,
      founder: { "@type": "Person", name: "Niklas Held" },
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "webmaster@held0.com" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "held0",
      url: `${SITE}/`,
      inLanguage: "de",
      description: "Projekte von Niklas Held.",
      publisher: { "@id": `${SITE}/#org` },
    },
    {
      "@type": "ItemList",
      name: "Projekte",
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "WebSite", name: p.name, url: p.href, description: p.description },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h1>
        {/* versteckter Zugang zur Abo-Übersicht: der blinkende Unterstrich */}
        held0<a className="cursor" href="/admin" rel="nofollow" tabIndex={-1} aria-hidden="true">_</a>
      </h1>
      <ul>
        {projects.map((p) => (
          <li key={p.name}>
            <p>{`// ${p.description}`}</p>
            <a href={p.href}>{p.name}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
