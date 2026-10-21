// Kurztest der Fristberechnung für /admin:  node scripts/test-abos.mjs
// (Node ≥ 22.18 lädt die TypeScript-Datei direkt.)
import assert from "node:assert/strict";
import { computeTerm, addMonths, monthlyCost, totals, contractEnd, contractState, groupOf } from "../lib/admin/calc.ts";

const base = { status: "aktiv", noticeUnit: "monate" };
const check = (name, abo, today, expected) => {
  const t = computeTerm({ ...base, ...abo }, today);
  for (const [k, v] of Object.entries(expected)) assert.equal(t[k], v, `${name}: ${k} = ${t[k]}, erwartet ${v}`);
  console.log(`✓ ${name}: ${JSON.stringify(t)}`);
};

// 1. 12 Monate Mindestlaufzeit, Verlängerung um 12, Frist 1 Monat zum Laufzeitende
check("Domain 12/12, 1 Monat", { start: "2026-10-20", minTermMonths: 12, renewalMonths: 12, noticeValue: 1 }, "2026-10-21",
  { kind: "laufend", periodEnd: "2027-10-19", deadline: "2027-09-19", nextRenewal: "2027-10-20" });

// 2. Frist der laufenden Periode schon verpasst → nächste Periode zählt, Verlängerung steht trotzdem bevor
check("Frist verpasst", { start: "2025-11-01", minTermMonths: 12, renewalMonths: 12, noticeValue: 1 }, "2026-10-21",
  { kind: "laufend", periodEnd: "2027-10-31", deadline: "2027-09-30", nextRenewal: "2026-11-01" });

// 3. 24 Monate Mindestlaufzeit, danach monatlich, Frist 4 Wochen
check("24 Monate, dann monatlich, 4 Wochen", { start: "2024-03-15", minTermMonths: 24, renewalMonths: 1, noticeValue: 4, noticeUnit: "wochen" }, "2026-10-21",
  { kind: "laufend", periodEnd: "2026-12-14", deadline: "2026-11-16", nextRenewal: "2026-11-15" });

// 4. Monatsende: 31.01. + 1 Monat = 28.02.
assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
assert.equal(addMonths("2028-01-31", 1), "2028-02-29");
console.log("✓ Monatsenden");

// 5. Sonderfälle
check("jederzeit kündbar", { start: "2025-01-01", minTermMonths: 0, renewalMonths: 0, noticeValue: null }, "2026-10-21", { kind: "jederzeit" });
check("gekündigt", { status: "gekuendigt", start: "2025-01-01", minTermMonths: 12, renewalMonths: 12 }, "2026-10-21", { kind: "inaktiv" });
check("Beginn fehlt", { start: null, minTermMonths: 12, renewalMonths: 12, noticeValue: 1 }, "2026-10-21", { kind: "unbekannt" });

// 6. Kosten normalisiert
assert.equal(monthlyCost({ amount: 19, interval: "jahr" }).toFixed(4), (19 / 12).toFixed(4));
assert.equal(monthlyCost({ amount: 50, interval: "einmalig" }), 0);
const t = totals([
  { status: "aktiv", amount: 12, interval: "jahr", currency: "EUR" },
  { status: "aktiv", amount: 5, interval: "monat", currency: "EUR" },
  { status: "aktiv", amount: null, interval: "monat", currency: "EUR" },
  { status: "beendet", amount: 99, interval: "monat", currency: "EUR" },
]);
assert.equal(t.perMonth.EUR, 6);
assert.equal(t.perYear.EUR, 72);
assert.equal(t.missing, 1);
console.log("✓ Kosten und Summen");

// 7. Gekündigt: Ende aus „gekündigt am“ (Kündigung 01.09.2027 kommt für die Laufzeit bis 19.10.2027 rechtzeitig)
const dom = { status: "gekuendigt", start: "2026-10-20", minTermMonths: 12, renewalMonths: 12, noticeValue: 1, noticeUnit: "monate", endDate: null, provider: "Strato", service: "Domainpaket .de" };
assert.equal(contractEnd({ ...dom, cancelledOn: "2027-09-01" }), "2027-10-19");
// zu spät gekündigt (nach dem 19.09.2027) → erst zum Ende der nächsten Periode
assert.equal(contractEnd({ ...dom, cancelledOn: "2027-09-25" }), "2028-10-19");
// eingetragenes Ende hat Vorrang; ohne Datum kein Ende
assert.equal(contractEnd({ ...dom, cancelledOn: "2027-09-01", endDate: "2027-12-31" }), "2027-12-31");
assert.equal(contractEnd({ ...dom }), null);
assert.equal(contractState({ ...dom, cancelledOn: "2027-09-01" }, "2026-10-21").label, "gekündigt zum 19.10.27");
assert.equal(contractState({ ...dom, cancelledOn: "2027-09-01" }, "2027-11-01").kind, "beendet");
assert.equal(contractState({ ...dom, status: "aktiv" }, "2026-10-21").label, "läuft");
// gekündigte Verträge haben keine Kündigungsfrist mehr (keine Warnung)
assert.equal(computeTerm(dom, "2026-10-21").kind, "inaktiv");
console.log("✓ gekündigt / beendet");

assert.equal(groupOf({ provider: "Strato", service: "Domainpaket .app – x" }).label, "Domains (Strato)");
assert.equal(groupOf({ provider: "Hetzner", service: "Cloud-Server" }).label, "Hetzner");
console.log("✓ Gruppen");
