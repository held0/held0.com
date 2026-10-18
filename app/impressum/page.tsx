import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum · Datenschutz – held0",
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <div className="legal">
      <p>
        <Link href="/">← held0</Link>
      </p>

      <h1>Impressum</h1>
      <p>
        Niklas Held
        <br />
        Gabelsbergerstr. 23
        <br />
        50674 Köln
        <br />
        E-Mail: webmaster@held0.com
      </p>

      <h1 id="datenschutz">Datenschutz</h1>
      <p>Verantwortlich: Niklas Held (Anschrift und E-Mail siehe oben).</p>
      <p>
        Beim Aufruf dieser Seite verarbeitet der Server technisch notwendige Zugriffsdaten
        (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browserkennung), um die Seite auszuliefern und
        abzusichern (Art. 6 Abs. 1 lit. f DSGVO). Diese Server-Logs werden automatisch
        überschrieben. Gehostet wird bei der Hetzner Online GmbH, Gunzenhausen, als
        Auftragsverarbeiter.
      </p>
      <p>
        Für eine anonyme Reichweitenmessung nutze ich Umami auf meinem eigenen Server bei der
        Hetzner Online GmbH. Erfasst werden aufgerufene Seite, Referrer, Browser, Betriebssystem,
        Gerätetyp, Bildschirmgröße und das aus der IP-Adresse abgeleitete Land; die IP-Adresse
        selbst wird nicht gespeichert. Es werden keine Cookies gesetzt und keine Daten an Dritte
        weitergegeben (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>Es gibt keine Cookies und keine eingebundenen Drittinhalte.</p>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Widerspruch und Datenübertragbarkeit sowie auf Beschwerde bei einer
        Datenschutz-Aufsichtsbehörde.
      </p>
    </div>
  );
}
