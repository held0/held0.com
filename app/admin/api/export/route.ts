import { adminGuard } from "../../../../lib/admin/auth";
import { listAbos } from "../../../../lib/admin/store";
import {
  INTERVALS, STATUSES, computeTerm, contractEnd, contractState, monthlyCost, noticeLabel, termLabel, todayBerlin, formatDate, yearlyCost,
} from "../../../../lib/admin/calc";

export const dynamic = "force-dynamic";

// CSV für Excel/Numbers in deutscher Einstellung: Semikolon, Dezimalkomma, UTF-8 mit BOM.
const cell = (v: string | number | null) => {
  const s = v == null ? "" : typeof v === "number" ? v.toFixed(2).replace(".", ",") : v;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(request: Request) {
  const denied = await adminGuard(request);
  if (denied) return denied;
  const today = todayBerlin();
  const header = [
    "Projekt", "Anbieter", "Leistung", "Vertragsnr.", "Beginn", "Betrag", "Währung", "Intervall", "pro Monat", "pro Jahr",
    "Mindestlaufzeit (Monate)", "Verlängerung (Monate)", "Kündigungsfrist", "Nächste Verlängerung", "Spätestens kündigen bis",
    "Wirksam zum", "Status", "Vertrag", "Gekündigt am", "Endet am", "Hinweis", "Notiz",
  ];
  const rows = (await listAbos()).map((a) => {
    const t = computeTerm(a, today);
    return [
      a.project, a.provider, a.service, a.contractNo, formatDate(a.start), a.amount, a.currency, INTERVALS[a.interval].label,
      monthlyCost(a), yearlyCost(a), a.minTermMonths == null ? "" : String(a.minTermMonths),
      a.renewalMonths == null ? "" : String(a.renewalMonths), noticeLabel(a),
      t.kind === "laufend" ? formatDate(t.nextRenewal) : "",
      t.kind === "laufend" ? formatDate(t.deadline) : t.kind === "auslaufend" ? formatDate(t.deadline) : "",
      t.kind === "laufend" ? formatDate(t.periodEnd) : t.kind === "auslaufend" ? formatDate(t.end) : "",
      STATUSES[a.status], contractState(a, today).label, formatDate(a.cancelledOn), formatDate(contractEnd(a)), termLabel(t), a.note,
    ].map(cell).join(";");
  });
  const csv = "\uFEFF" + [header.join(";"), ...rows].join("\r\n") + "\r\n";
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abos-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
