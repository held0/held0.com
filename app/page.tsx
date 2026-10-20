import { projects } from "./projects";
import { SITE } from "./agent-text";

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
        held0<span>_</span>
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
