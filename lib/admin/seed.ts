import type { Abo } from "./calc";

// Startbestand für /admin (wird nur geschrieben, wenn noch keine Datendatei existiert).
// Kosten/Laufzeiten nur, wo sie bekannt sind – der Rest wird im Interface ergänzt.
const base = {
  contractNo: "", start: null, amount: null, currency: "EUR", interval: "jahr", minTermMonths: null, renewalMonths: null,
  noticeValue: null, noticeUnit: "monate", status: "aktiv", endDate: null, note: "",
} satisfies Omit<Abo, "id" | "project" | "provider" | "service">;

// Das Repo ist öffentlich: Auftragsnummern stehen deshalb nicht hier, sondern kommen per Import
// (JSON-Datei mit denselben ids, siehe README) dazu.
const strato = (id: string, project: string, service: string, note = "", extra: Partial<Abo> = {}): Abo => ({
  ...base, id, project, provider: "Strato", service,
  note: [note, "Beginn, Preis, Laufzeit und Frist aus dem Strato-Kundenlogin ergänzen"].filter(Boolean).join(" · "),
  ...extra,
});

export const SEED: Abo[] = [
  strato("strato-myveryown", "myveryown", "Domainpaket .app – myveryown.app", "neu, bestellt im Oktober 2026", { start: "2026-10-20" }),
  strato("strato-vokalreim", "vokalreim", "Domainpaket .de – vokalreim.de"),
  strato("strato-cinenow", "cinenow", "Domainpaket .app – cinenow.app + cinenow.org"),
  strato("strato-watchsoon", "watchsoon", "Domainpaket .io – watchsoon.io"),
  strato("strato-orgasmicecstasy", "orgasmicecstasy", "Domainpaket .com – orgasmicecstasy.com"),
  strato("strato-checkfirma", "checkfirma", "Domainpaket .de – checkfirma.de"),
  strato("strato-fahrtrichtung", "fahrtrichtung", "Domainpaket .info – fahrtrichtung.info"),
  strato("strato-heniko", "heniko", "Domainpaket .com – heniko.com"),
  strato("strato-imposter", "imposter", "Domainpaket .com – imposter-online.com"),
  strato("strato-held0", "held0", "Domainpaket .com (Treue-Angebot) – held0.com + offenesprechstunden.de"),
  {
    ...base, id: "hetzner-cloud-server", project: "allgemein", provider: "Hetzner", service: "Cloud-Server 178.104.62.232 (alle Projekte)",
    interval: "monat", minTermMonths: 0, renewalMonths: 0, noticeValue: 0, noticeUnit: "tage",
    note: "stundengenaue Abrechnung, Monatsdeckel; Servertyp und Preis ergänzen",
  },
  {
    ...base, id: "hetzner-volume-checkfirma", project: "checkfirma", provider: "Hetzner", service: "Cloud-Volume HC_Volume_106399635 (Replays)",
    interval: "monat", minTermMonths: 0, renewalMonths: 0, noticeValue: 0, noticeUnit: "tage",
    note: "Größe und Preis ergänzen",
  },
  {
    ...base, id: "hetzner-dns-myveryown", project: "myveryown", provider: "Hetzner", service: "DNS-Zone myveryown.app",
    start: "2026-10-21", amount: 0, interval: "monat", minTermMonths: 0, renewalMonths: 0, noticeValue: 0, noticeUnit: "tage",
    note: "kostenlos",
  },
  {
    ...base, id: "migadu-micro-myveryown", project: "myveryown", provider: "Migadu", service: "E-Mail-Tarif Micro für myveryown.app",
    start: "2026-10-21", amount: 19, interval: "jahr", minTermMonths: 12, renewalMonths: 12, noticeValue: 0, noticeUnit: "tage",
    note: "Preis ca. 19 €/Jahr – genauen Betrag prüfen; Annahme: jährlich im Voraus, vor der Verlängerung kündbar",
  },
  {
    ...base, id: "decodo-proxies", project: "checkfirma", provider: "Decodo", service: "Proxys (Handelsregister-Abfragen; auch offene Sprechstunden)",
    interval: "monat", note: "Tarif, Preis und Laufzeit ergänzen",
  },
  {
    ...base, id: "anthropic", project: "allgemein", provider: "Anthropic", service: "Claude (Abo und/oder API)",
    interval: "monat", note: "u. a. für myveryown und watchsoon; Tarif und Kosten ergänzen",
  },
];
