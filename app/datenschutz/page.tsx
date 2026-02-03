import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung gemäß DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// datenschutz"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Datenschutzerklärung</h1>

        <div className="mt-8 space-y-8 text-[#a3a3a3]">
          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              1. Datenschutz auf einen Blick
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Allgemeine Hinweise</h3>
                <p className="mt-2">
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                  personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
                  Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
                  werden können.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#e5e5e5]">
                  Datenerfassung auf dieser Website
                </h3>
                <p className="mt-2">
                  <strong className="text-[#e5e5e5]">
                    Wer ist verantwortlich für die Datenerfassung auf dieser Website?
                  </strong>
                  <br />
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.
                  Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              2. Hosting
            </h2>
            <div className="mt-4">
              <p>
                Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die
                personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den
                Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen,
                Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten,
                Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden,
                handeln.
              </p>
              <p className="mt-4">
                Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren
                potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse
                einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots
                durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              3. Allgemeine Hinweise und Pflichtinformationen
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Datenschutz</h3>
                <p className="mt-2">
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr
                  ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend
                  den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#e5e5e5]">
                  Hinweis zur verantwortlichen Stelle
                </h3>
                <p className="mt-2">
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                </p>
                <div className="mt-2 space-y-1">
                  <p>Niklas Held</p>
                  <p>[Straße und Hausnummer]</p>
                  <p>[PLZ und Ort]</p>
                  <p>
                    E-Mail:{" "}
                    <a href="mailto:hello@held0.com" className="text-[#22d3ee] hover:underline">
                      hello@held0.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              4. Ihre Rechte
            </h2>

            <div className="mt-4 space-y-4">
              <p>Sie haben jederzeit das Recht:</p>
              <ul className="list-inside space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#22d3ee]">{">"}</span>
                  <span>
                    unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten
                    personenbezogenen Daten zu erhalten
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22d3ee]">{">"}</span>
                  <span>die Berichtigung oder Löschung dieser Daten zu verlangen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22d3ee]">{">"}</span>
                  <span>
                    die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22d3ee]">{">"}</span>
                  <span>Ihr Recht auf Datenübertragbarkeit geltend zu machen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22d3ee]">{">"}</span>
                  <span>
                    sich bei der zuständigen Aufsichtsbehörde zu beschweren
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              5. Datenerfassung auf dieser Website
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Server-Log-Dateien</h3>
                <p className="mt-2">
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so
                  genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt.
                  Dies sind:
                </p>
                <ul className="mt-2 list-inside space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">{">"}</span>
                    <span>Browsertyp und Browserversion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">{">"}</span>
                    <span>verwendetes Betriebssystem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">{">"}</span>
                    <span>Referrer URL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">{">"}</span>
                    <span>Hostname des zugreifenden Rechners</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">{">"}</span>
                    <span>Uhrzeit der Serveranfrage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">{">"}</span>
                    <span>IP-Adresse</span>
                  </li>
                </ul>
                <p className="mt-4">
                  Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
                  vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1
                  lit. f DSGVO.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              6. Kontaktaufnahme
            </h2>
            <div className="mt-4">
              <p>
                Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben inklusive der von Ihnen
                dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
                Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre
                Einwilligung weiter.
              </p>
              <p className="mt-4">
                Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b
                DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur
                Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen
                beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven
                Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
