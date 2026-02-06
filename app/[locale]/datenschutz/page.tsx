import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "datenschutz" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  };
}

export default async function DatenschutzPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// datenschutz"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">
          Datenschutzerklärung
        </h1>

        {locale === "en" && (
          <div className="mt-6 rounded-lg border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-4">
            <p className="text-sm text-[#a3a3a3]">{t("legalDisclaimer")}</p>
          </div>
        )}

        <div className="mt-8 space-y-8 text-[#a3a3a3]">
          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              I. Informationen über die Verarbeitung Ihrer Daten gemäß Art. 13 DSGVO
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">
                  1. Verantwortlicher für die Datenverarbeitung
                </h3>
                <div className="mt-2 space-y-1">
                  <p>Niklas Held</p>
                  <p>Gabelsbergerstr. 23</p>
                  <p>50674 Köln</p>
                  <p>
                    E-Mail:{" "}
                    <a href="mailto:webmaster@held0.com" className="text-[#22d3ee] hover:underline">
                      webmaster@held0.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#e5e5e5]">
              2. Daten, die für die Bereitstellung der Website verarbeitet werden
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  a. Welche Daten werden für welchen Zweck verarbeitet?
                </h4>
                <p className="mt-2">
                  Bei jedem Zugriff auf Inhalte der Website werden vorübergehend Daten gespeichert,
                  die möglicherweise eine Identifizierung zulassen:
                </p>
                <ul className="mt-2 list-inside space-y-1">
                  {[
                    "Datum und Uhrzeit des Zugriffs",
                    "IP-Adresse",
                    "Hostname des zugreifenden Rechners",
                    "Website, von der aus die Website aufgerufen wurde (Referrer-URL)",
                    "Besuchte Seite auf unserer Website",
                    "Meldung, ob der Abruf erfolgreich war",
                    "Übertragene Datenmenge",
                    "Informationen über den Browsertyp und die verwendete Version",
                    "Betriebssystem",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#22d3ee]">{">"}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  b. Auf welcher Rechtsgrundlage werden diese Daten verarbeitet?
                </h4>
                <p className="mt-2">
                  Die Daten werden auf der Grundlage des Art. 6 Abs. 1 Buchstabe f DSGVO
                  verarbeitet. Die Verarbeitung ist für die Bereitstellung einer Website
                  erforderlich und dient damit der Wahrung eines berechtigten Interesses.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  c. Gibt es neben dem Verantwortlichen weitere Empfänger der Daten?
                </h4>
                <p className="mt-2">
                  Die Website wird bei der Hetzner Online GmbH (Industriestr. 25, 91710
                  Gunzenhausen, Deutschland) gehostet. Der Hoster empfängt die oben genannten Daten
                  als Auftragsverarbeiter.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  d. Wie lange werden die Daten gespeichert?
                </h4>
                <p className="mt-2">
                  Die Daten werden gelöscht, sobald sie für die Erreichung des Zwecks ihrer Erhebung
                  nicht mehr erforderlich sind. Bei der Bereitstellung der Website ist dies der
                  Fall, wenn die jeweilige Sitzung beendet ist. Die Protokolldateien werden nach 7
                  Tagen gelöscht.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#e5e5e5]">3. Cookies</h3>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">a. Was sind Cookies?</h4>
                <p className="mt-2">
                  Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Sie
                  ermöglichen es, bestimmte Informationen zu speichern und bei späteren Besuchen
                  wieder abzurufen.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  b. Welche Cookies verwenden wir?
                </h4>
                <p className="mt-2">Wir unterscheiden zwischen notwendigen und optionalen Cookies:</p>

                <p className="mt-4 font-semibold text-[#e5e5e5]">Notwendige Cookies:</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#333]">
                        <th className="py-2 text-left text-[#e5e5e5]">Cookie</th>
                        <th className="py-2 text-left text-[#e5e5e5]">Zweck</th>
                        <th className="py-2 text-left text-[#e5e5e5]">Speicherdauer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#222]">
                        <td className="py-2 font-mono text-[#22d3ee]">cc_cookie</td>
                        <td className="py-2">Speichert Ihre Cookie-Einstellungen</td>
                        <td className="py-2">6 Monate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm">
                  <strong className="text-[#e5e5e5]">Rechtsgrundlage:</strong> Art. 6 Abs. 1
                  Buchstabe f DSGVO (berechtigtes Interesse an der technischen Funktionsfähigkeit)
                </p>

                <p className="mt-4 font-semibold text-[#e5e5e5]">
                  Analyse-Cookies (nur mit Einwilligung):
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#333]">
                        <th className="py-2 text-left text-[#e5e5e5]">Cookie</th>
                        <th className="py-2 text-left text-[#e5e5e5]">Zweck</th>
                        <th className="py-2 text-left text-[#e5e5e5]">Speicherdauer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#222]">
                        <td className="py-2 font-mono text-[#22d3ee]">_ga</td>
                        <td className="py-2">Unterscheidet einzelne Nutzer</td>
                        <td className="py-2">2 Jahre</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-2 font-mono text-[#22d3ee]">_ga_*</td>
                        <td className="py-2">Speichert Session-Status</td>
                        <td className="py-2">2 Jahre</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-2 font-mono text-[#22d3ee]">_gid</td>
                        <td className="py-2">Unterscheidet einzelne Nutzer</td>
                        <td className="py-2">24 Stunden</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm">
                  <strong className="text-[#e5e5e5]">Rechtsgrundlage:</strong> Art. 6 Abs. 1
                  Buchstabe a DSGVO (Einwilligung)
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  c. Wie können Sie Ihre Einwilligung widerrufen?
                </h4>
                <p className="mt-2">
                  Sie können Ihre Cookie-Einstellungen jederzeit ändern, indem Sie auf den Link
                  &quot;Cookie-Einstellungen&quot; im Footer unserer Website klicken. Dort können
                  Sie Ihre Einwilligung widerrufen oder anpassen.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#e5e5e5]">4. Webanalyse mit Google Analytics</h3>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  a. Umfang der Datenverarbeitung
                </h4>
                <p className="mt-2">
                  Wir nutzen Google Analytics 4, einen Webanalysedienst der Google Ireland Limited
                  (Gordon House, Barrow Street, Dublin 4, Irland). Google Analytics verwendet
                  Cookies und ähnliche Technologien, um Informationen über die Nutzung unserer
                  Website zu sammeln. Die erhobenen Daten umfassen: besuchte Seiten, Verweildauer,
                  verwendetes Gerät und Browser, ungefährer Standort (Land/Stadt) sowie die Quelle
                  des Besuchs.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  b. Zweck der Datenverarbeitung
                </h4>
                <p className="mt-2">
                  Die Datenverarbeitung dient der Analyse des Nutzerverhaltens auf unserer Website,
                  um unser Angebot zu verbessern und bedarfsgerecht zu gestalten.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">c. Rechtsgrundlage</h4>
                <p className="mt-2">
                  Die Datenverarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1
                  Buchstabe a DSGVO. Google Analytics wird erst aktiviert, nachdem Sie im
                  Cookie-Banner auf &quot;Alle akzeptieren&quot; geklickt oder in den Einstellungen
                  die Analyse-Cookies aktiviert haben.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">d. Empfänger der Daten</h4>
                <p className="mt-2">
                  Die erhobenen Daten werden an Google übermittelt. Google kann diese Daten in die
                  USA übertragen. Google ist unter dem EU-US Data Privacy Framework zertifiziert.
                  Weitere Informationen finden Sie in der{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#22d3ee] hover:underline"
                  >
                    Datenschutzerklärung von Google
                  </a>
                  .
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">e. Speicherdauer</h4>
                <p className="mt-2">
                  Die von Google Analytics gesetzten Cookies werden nach 14 Monaten automatisch
                  gelöscht. Sie können die Cookies auch jederzeit über Ihre Browser-Einstellungen
                  löschen.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  f. Widerspruch und Widerruf
                </h4>
                <p className="mt-2">
                  Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie auf
                  &quot;Cookie-Einstellungen&quot; im Footer klicken und die Analyse-Cookies
                  deaktivieren. Bereits gesammelte Daten bleiben davon unberührt.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#e5e5e5]">5. Betroffenenrechte</h3>
            <p className="mt-4">
              Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener im Sinne der
              DSGVO und es stehen Ihnen folgende Rechte gegenüber dem Verantwortlichen zu:
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">a. Recht auf Auskunft</h4>
                <p className="mt-2">
                  Sie können von dem Verantwortlichen eine Bestätigung darüber verlangen, ob
                  personenbezogene Daten, die Sie betreffen, verarbeitet werden (Art. 15 DSGVO).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">b. Recht auf Berichtigung</h4>
                <p className="mt-2">
                  Sie haben ein Recht auf Berichtigung und/oder Vervollständigung gegenüber dem
                  Verantwortlichen, sofern die verarbeiteten personenbezogenen Daten unrichtig oder
                  unvollständig sind (Art. 16 DSGVO).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  c. Recht auf Einschränkung der Verarbeitung
                </h4>
                <p className="mt-2">
                  Unter bestimmten Voraussetzungen können Sie die Einschränkung der Verarbeitung der
                  Sie betreffenden personenbezogenen Daten verlangen (Art. 18 DSGVO).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">d. Recht auf Löschung</h4>
                <p className="mt-2">
                  Sie können von dem Verantwortlichen verlangen, dass die Sie betreffenden
                  personenbezogenen Daten unverzüglich gelöscht werden (Art. 17 DSGVO).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  e. Recht auf Datenübertragbarkeit
                </h4>
                <p className="mt-2">
                  Sie haben das Recht, die Sie betreffenden personenbezogenen Daten in einem
                  strukturierten, gängigen und maschinenlesbaren Format zu erhalten (Art. 20 DSGVO).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#e5e5e5]">
                  f. Recht auf Beschwerde bei einer Aufsichtsbehörde
                </h4>
                <p className="mt-2">
                  Unbeschadet eines anderweitigen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde
                  bei einer Aufsichtsbehörde zu (Art. 77 DSGVO).
                </p>
                <div className="mt-3 rounded border border-[#333] bg-[#111] p-4">
                  <p className="text-sm">Zuständige Aufsichtsbehörde:</p>
                  <p className="mt-2">
                    Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen
                    <br />
                    Kavalleriestraße 2-4
                    <br />
                    40213 Düsseldorf
                    <br />
                    <a
                      href="https://www.ldi.nrw.de"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#22d3ee] hover:underline"
                    >
                      www.ldi.nrw.de
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">
              II. Recht auf Widerspruch gemäß Art. 21 Abs. 1 DSGVO
            </h2>
            <p className="mt-4">
              <strong className="text-[#e5e5e5]">
                Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
                jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die
                aufgrund von Art. 6 Abs. 1 Buchstabe f DSGVO erfolgt, Widerspruch einzulegen.
              </strong>
            </p>
            <p className="mt-4">
              Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten nicht mehr
              verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die
              Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder
              die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
              Rechtsansprüchen.
            </p>
            <p className="mt-4">
              Zur Ausübung Ihres Widerspruchsrechts können Sie uns unter den oben genannten
              Kontaktdaten erreichen.
            </p>
          </div>

          <div className="border-t border-[#333] pt-4">
            <p className="text-sm text-[#666]">Stand: Februar 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
