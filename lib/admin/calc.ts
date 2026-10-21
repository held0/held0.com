// Abo-Verwaltung unter /admin: Datentyp und alle Berechnungen (Laufzeit, Kündigungsfrist, Kosten).
// Reine Funktionen ohne Abhängigkeiten – laufen im Browser, auf dem Server und im Test (scripts/test-abos.mjs).
// Datumsangaben immer als "JJJJ-MM-TT" (ohne Uhrzeit, gerechnet in UTC, damit keine Zeitzone dazwischenfunkt).

export const INTERVALS = {
  monat: { label: "monatlich", months: 1 },
  quartal: { label: "vierteljährlich", months: 3 },
  halbjahr: { label: "halbjährlich", months: 6 },
  jahr: { label: "jährlich", months: 12 },
  "2jahre": { label: "alle 2 Jahre", months: 24 },
  einmalig: { label: "einmalig", months: 0 },
} as const;
export type Interval = keyof typeof INTERVALS;

export const NOTICE_UNITS = { tage: "Tage", wochen: "Wochen", monate: "Monate" } as const;
export type NoticeUnit = keyof typeof NOTICE_UNITS;

export const STATUSES = { aktiv: "aktiv", gekuendigt: "gekündigt", beendet: "beendet" } as const;
export type Status = keyof typeof STATUSES;

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF"] as const;

export type Abo = {
  id: string;
  project: string;
  provider: string;
  service: string; // Leistung
  contractNo: string; // Vertrags-/Auftragsnummer
  start: string | null; // Beginn
  amount: number | null; // Kosten pro Intervall (null = unbekannt)
  currency: string;
  interval: Interval;
  minTermMonths: number | null; // Mindestlaufzeit (0 = keine)
  renewalMonths: number | null; // verlängert sich automatisch um X Monate (0 = keine Verlängerung)
  noticeValue: number | null; // Kündigungsfrist (zum Laufzeitende)
  noticeUnit: NoticeUnit;
  status: Status;
  endDate: string | null; // bei „gekündigt“/„beendet“: Vertragsende
  note: string;
};

// ---------- Datum ----------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isDate = (s: unknown): s is string => typeof s === "string" && DATE_RE.test(s) && !isNaN(Date.parse(s));

const toUTC = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUTC = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Monate addieren; fällt der Tag weg (31.01. + 1 Monat), gilt der Monatsletzte. */
export function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return fromUTC(target.getTime());
}
export const addDays = (date: string, days: number) => fromUTC(toUTC(date) + days * 86400000);
export const daysBetween = (from: string, to: string) => Math.round((toUTC(to) - toUTC(from)) / 86400000);

/** Heutiges Datum in deutscher Zeit. */
export function todayBerlin(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

export const formatDate = (s: string | null) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}` : "");

function subtractNotice(end: string, value: number, unit: NoticeUnit): string {
  if (unit === "monate") return addMonths(end, -value);
  return addDays(end, -(unit === "wochen" ? value * 7 : value));
}

// ---------- Laufzeit & Kündigung ----------

export type Term =
  | { kind: "inaktiv" } // gekündigt oder beendet
  | { kind: "unbekannt"; reason: string } // Angaben fehlen
  | { kind: "jederzeit" } // keine Mindestlaufzeit, keine Verlängerung
  | { kind: "auslaufend"; end: string; deadline: string | null } // endet ohne Verlängerung (Kündigung nicht nötig)
  | {
      kind: "laufend";
      periodEnd: string; // letzter Tag der Laufzeit, zu der man spätestens kündigen kann
      deadline: string; // spätestmögliches Kündigungsdatum (Eingang beim Anbieter)
      nextRenewal: string | null; // nächster Tag, an dem sich der Vertrag verlängert
      noticeMissing: boolean;
    };

/**
 * Laufzeitende = Beginn + Mindestlaufzeit (bzw. + n × Verlängerung) − 1 Tag.
 * Spätestmögliches Kündigungsdatum = Laufzeitende − Kündigungsfrist; liegt es schon zurück,
 * zählt die nächste Verlängerungsperiode. Monatsfristen rechnen wir mit Kalendermonaten
 * (eher einen Tag zu früh als zu spät).
 */
export function computeTerm(a: Pick<Abo, "status" | "start" | "minTermMonths" | "renewalMonths" | "noticeValue" | "noticeUnit">, today: string): Term {
  if (a.status !== "aktiv") return { kind: "inaktiv" };
  const min = a.minTermMonths ?? 0;
  const renew = a.renewalMonths ?? 0;
  if (a.minTermMonths == null && a.renewalMonths == null) return { kind: "unbekannt", reason: "Laufzeit fehlt" };
  if (min === 0 && renew === 0) return { kind: "jederzeit" };
  if (!a.start || !isDate(a.start)) return { kind: "unbekannt", reason: "Beginn fehlt" };

  const notice = a.noticeValue ?? 0;
  const firstMonths = min > 0 ? min : renew;
  const endOf = (k: number) => addDays(addMonths(a.start!, firstMonths + k * renew), -1);
  const deadlineOf = (end: string) => subtractNotice(end, notice, a.noticeUnit);

  if (renew === 0) {
    const end = endOf(0);
    const deadline = deadlineOf(end);
    return { kind: "auslaufend", end, deadline: deadline >= today ? deadline : null };
  }

  let nextRenewal: string | null = null;
  for (let k = 0; k < 2000; k++) {
    const end = endOf(k);
    if (nextRenewal === null && end >= today) nextRenewal = addDays(end, 1);
    const deadline = deadlineOf(end);
    if (deadline >= today) {
      return { kind: "laufend", periodEnd: end, deadline, nextRenewal: nextRenewal ?? addDays(end, 1), noticeMissing: a.noticeValue == null };
    }
  }
  return { kind: "unbekannt", reason: "Laufzeit nicht berechenbar" };
}

export function termLabel(t: Term): string {
  switch (t.kind) {
    case "inaktiv": return "";
    case "unbekannt": return t.reason;
    case "jederzeit": return "jederzeit kündbar";
    case "auslaufend": return `läuft aus am ${formatDate(t.end)}`;
    case "laufend": return "";
  }
}

export function noticeLabel(a: Pick<Abo, "noticeValue" | "noticeUnit">): string {
  if (a.noticeValue == null) return "";
  if (a.noticeValue === 0) return "bis Laufzeitende";
  const singular = { tage: "Tag", wochen: "Woche", monate: "Monat" }[a.noticeUnit];
  return `${a.noticeValue} ${a.noticeValue === 1 ? singular : NOTICE_UNITS[a.noticeUnit]} zum Laufzeitende`;
}

// ---------- Kosten ----------

export function monthlyCost(a: Pick<Abo, "amount" | "interval">): number | null {
  if (a.amount == null) return null;
  const months = INTERVALS[a.interval]?.months ?? 0;
  return months === 0 ? 0 : a.amount / months;
}
export const yearlyCost = (a: Pick<Abo, "amount" | "interval">) => {
  const m = monthlyCost(a);
  return m == null ? null : m * 12;
};

export function formatMoney(value: number | null, currency: string): string {
  if (value == null) return "";
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2).replace(".", ",")} ${currency}`;
  }
}

export type Totals = { perMonth: Record<string, number>; perYear: Record<string, number>; missing: number; count: number };

/** Summen laufender Kosten (nur aktive Verträge), getrennt nach Währung. */
export function totals(items: Abo[]): Totals {
  const t: Totals = { perMonth: {}, perYear: {}, missing: 0, count: 0 };
  for (const a of items) {
    if (a.status !== "aktiv") continue;
    t.count++;
    const m = monthlyCost(a);
    if (m == null) { t.missing++; continue; }
    t.perMonth[a.currency] = (t.perMonth[a.currency] ?? 0) + m;
    t.perYear[a.currency] = (t.perYear[a.currency] ?? 0) + m * 12;
  }
  return t;
}

export function formatSums(sums: Record<string, number>): string {
  const keys = Object.keys(sums).sort((x, y) => (x === "EUR" ? -1 : y === "EUR" ? 1 : x.localeCompare(y)));
  return keys.length ? keys.map((c) => formatMoney(sums[c], c)).join(" + ") : formatMoney(0, "EUR");
}

// ---------- Prüfen von Eingaben (Server) ----------

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, { int = false, min = 0, max = 1e9 } = {}): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return int ? Math.round(n) : Math.round(n * 100) / 100;
};

export function sanitizeAbo(input: Record<string, unknown>, id: string): Abo {
  const interval = (input.interval as string) in INTERVALS ? (input.interval as Interval) : "monat";
  const noticeUnit = (input.noticeUnit as string) in NOTICE_UNITS ? (input.noticeUnit as NoticeUnit) : "monate";
  const status = (input.status as string) in STATUSES ? (input.status as Status) : "aktiv";
  const currency = /^[A-Z]{3}$/.test(str(input.currency)) ? str(input.currency) : "EUR";
  return {
    id,
    project: str(input.project, 80) || "allgemein",
    provider: str(input.provider, 80),
    service: str(input.service, 200),
    contractNo: str(input.contractNo, 80),
    start: isDate(input.start) ? input.start : null,
    amount: num(input.amount),
    currency,
    interval,
    minTermMonths: num(input.minTermMonths, { int: true, max: 600 }),
    renewalMonths: num(input.renewalMonths, { int: true, max: 600 }),
    noticeValue: num(input.noticeValue, { int: true, max: 3650 }),
    noticeUnit,
    status,
    endDate: isDate(input.endDate) ? input.endDate : null,
    note: str(input.note, 2000),
  };
}
