"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  CURRENCIES, INTERVALS, NOTICE_UNITS, STATUSES, computeTerm, contractEnd, contractState, daysBetween, formatDate, formatMoney,
  formatShort, formatSums, groupOf, monthlyCost, noticeLabel, termLabel, totals, yearlyCost, type Abo, type ContractState,
  type Interval, type Term,
} from "../../lib/admin/calc";

const KNOWN_PROJECTS = [
  "allgemein", "held0", "myveryown", "checkfirma", "cinenow", "watchsoon", "vokalreim", "imposter", "fahrtrichtung",
  "diary", "palestineflag",
];
const KNOWN_PROVIDERS = ["Strato", "Hetzner", "Anthropic", "Migadu", "Decodo", "Apple", "Google"];
const SOON = 60; // Tage: „Frist läuft ab“
const URGENT = 14;
const OPEN_KEY = "held0-admin-open-groups";

const PER: Record<Interval, string> = { monat: "/Mon.", quartal: "/Quart.", halbjahr: "/Halbj.", jahr: "/Jahr", "2jahre": "/2 J.", einmalig: "einmalig" };

type Row = Abo & {
  term: Term; state: ContractState; perMonth: number | null; perYear: number | null; deadline: string | null; renewal: string | null;
  group: { key: string; label: string };
};
type SortKey = "project" | "service" | "perMonth" | "deadline" | "state";

const COLUMNS: { key: SortKey | null; label: string; className: string }[] = [
  { key: "state", label: "Status", className: "c-state" },
  { key: "service", label: "Leistung", className: "c-service" },
  { key: "project", label: "Projekt", className: "c-project" },
  { key: null, label: "Kosten", className: "c-cost num" },
  { key: "perMonth", label: "€/Mon.", className: "c-month num" },
  { key: null, label: "€/Jahr", className: "c-year num" },
  { key: "deadline", label: "Kündigen bis", className: "c-deadline" },
];

function toRow(a: Abo, today: string): Row {
  const term = computeTerm(a, today);
  return {
    ...a, cancelledOn: a.cancelledOn ?? null, term, state: contractState(a, today), perMonth: monthlyCost(a), perYear: yearlyCost(a),
    deadline: term.kind === "laufend" ? term.deadline : null,
    renewal: term.kind === "laufend" ? term.nextRenewal : null,
    group: groupOf(a),
  };
}

const STATE_ORDER = { laeuft: 0, gekuendigt: 1, beendet: 2 };
function compare(a: Row, b: Row, key: SortKey): number {
  const x = key === "state" ? STATE_ORDER[a.state.kind] : a[key];
  const y = key === "state" ? STATE_ORDER[b.state.kind] : b[key];
  if (x == null && y == null) return 0;
  if (x == null) return 1; // leere Werte immer ans Ende
  if (y == null) return -1;
  return typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "de");
}

const inDays = (n: number) => (n === 0 ? "heute" : n === 1 ? "morgen" : `in ${n} T.`);
const urgency = (d: number | null) => (d == null ? "" : d <= URGENT ? "urgent" : d <= SOON ? "warn" : "");

function details(r: Row): string {
  return [
    r.contractNo && `Nr. ${r.contractNo}`,
    r.start && `Beginn ${formatDate(r.start)}`,
    r.renewal && `nächste Verlängerung ${formatDate(r.renewal)}`,
    r.term.kind === "laufend" && `Kündigung wirksam zum ${formatDate(r.term.periodEnd)}`,
    noticeLabel(r) && `Frist ${noticeLabel(r)}`,
    r.cancelledOn && `gekündigt am ${formatDate(r.cancelledOn)}`,
  ].filter(Boolean).join(" · ");
}

function Badge({ state }: { state: ContractState }) {
  return <span className={`badge ${state.kind}`}>{state.label}</span>;
}

type Group = { key: string; label: string; rows: Row[] };

export default function AdminApp({ initial, today }: { initial: Abo[]; today: string }) {
  const [items, setItems] = useState<Abo[]>(initial);
  const [filter, setFilter] = useState({ project: "", provider: "", state: "offen", q: "" });
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "deadline", dir: 1 });
  const [editing, setEditing] = useState<Abo | "new" | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [open, setOpen] = useState<string[]>([]);

  // aufgeklappte Gruppen merken (nur in diesem Browser)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPEN_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalig nach dem Laden aus localStorage
      if (Array.isArray(saved)) setOpen(saved.filter((k) => typeof k === "string"));
    } catch {}
  }, []);
  const toggleGroup = (key: string) => setOpen((list) => {
    const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
    try { localStorage.setItem(OPEN_KEY, JSON.stringify(next)); } catch {}
    return next;
  });

  const rows = useMemo(() => items.map((a) => toRow(a, today)), [items, today]);
  const projects = useMemo(() => [...new Set(rows.map((r) => r.project))].sort((a, b) => a.localeCompare(b, "de")), [rows]);
  const providers = useMemo(() => [...new Set(rows.map((r) => r.provider).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de")), [rows]);

  const visible = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return rows
      .filter((r) => (!filter.project || r.project === filter.project)
        && (!filter.provider || r.provider === filter.provider)
        && (filter.state === "alle" || (filter.state === "offen" ? r.state.kind !== "beendet" : r.state.kind === filter.state))
        && (!q || [r.project, r.provider, r.service, r.contractNo, r.note].join(" ").toLowerCase().includes(q)))
      .sort((a, b) => compare(a, b, sort.key) * sort.dir || compare(a, b, "project") || compare(a, b, "service"));
  }, [rows, filter, sort]);

  // Gruppen in der Reihenfolge ihres ersten (sortierten) Eintrags
  const groups = useMemo(() => {
    const map = new Map<string, Group>();
    for (const r of visible) {
      const g = map.get(r.group.key) ?? { key: r.group.key, label: r.group.label, rows: [] };
      g.rows.push(r);
      map.set(r.group.key, g);
    }
    return [...map.values()];
  }, [visible]);

  const sum = useMemo(() => totals(items), [items]);
  const visibleSum = useMemo(() => totals(visible), [visible]);
  const filtered = visible.length !== rows.length;
  const counts = useMemo(() => {
    const c = { laeuft: 0, gekuendigt: 0, beendet: 0 };
    for (const r of rows) c[r.state.kind]++;
    return c;
  }, [rows]);

  const soon = useMemo(
    () => rows
      .filter((r) => r.state.kind === "laeuft" && r.deadline && daysBetween(today, r.deadline) <= SOON)
      .sort((a, b) => compare(a, b, "deadline")),
    [rows, today],
  );

  const byProject = useMemo(() => {
    const groups = new Map<string, Abo[]>();
    for (const r of rows) groups.set(r.project, [...(groups.get(r.project) ?? []), r]);
    return [...groups.entries()]
      .map(([project, list]) => ({ project, t: totals(list), total: list.length }))
      .filter((p) => p.t.count > 0)
      .sort((a, b) => (b.t.perYear.EUR ?? 0) - (a.t.perYear.EUR ?? 0) || a.project.localeCompare(b.project, "de"));
  }, [rows]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  async function save(data: Abo, isNew: boolean) {
    setError("");
    const res = await fetch(isNew ? "/admin/api/abos" : `/admin/api/abos/${encodeURIComponent(data.id)}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) { location.href = "/admin/login"; return false; }
    if (!res.ok) { setError(`Speichern fehlgeschlagen (${res.status}). Seite neu laden und erneut versuchen.`); return false; }
    const saved = (await res.json()) as Abo;
    setItems((list) => (isNew ? [...list, saved] : list.map((a) => (a.id === saved.id ? saved : a))));
    return true;
  }

  async function importFile(file: File) {
    setError(""); setInfo("");
    let body: unknown;
    try { body = JSON.parse(await file.text()); } catch { setError("Die Datei ist kein gültiges JSON."); return; }
    const res = await fetch("/admin/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { setError(`Import fehlgeschlagen (${res.status}).`); return; }
    const r = (await res.json()) as { added: number; updated: number; items: Abo[] };
    setItems(r.items);
    setInfo(`Import: ${r.added} neu, ${r.updated} aktualisiert.`);
  }

  async function remove(id: string) {
    setError("");
    const res = await fetch(`/admin/api/abos/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) { setError(`Löschen fehlgeschlagen (${res.status}).`); return false; }
    setItems((list) => list.filter((a) => a.id !== id));
    return true;
  }

  const searching = filter.q.trim() !== "";

  const renderRow = (r: Row, inGroup: boolean) => {
    const d = r.deadline ? daysBetween(today, r.deadline) : null;
    return (
      <tr key={r.id} onClick={() => setEditing(r)} className={`state-${r.state.kind} ${inGroup ? "child" : ""}`}>
        <td className="c-state"><Badge state={r.state} /></td>
        <td className="c-service" title={[r.service, details(r)].filter(Boolean).join("\n")}>
          <button type="button" className="link" onClick={(e) => { e.stopPropagation(); setEditing(r); }}>
            {!inGroup && r.provider && <span className="muted">{r.provider} · </span>}
            {r.service || "—"}
          </button>
          {r.note && <span className="note" title={r.note} aria-label={`Notiz: ${r.note}`}>ⓘ</span>}
        </td>
        <td className="c-project">{r.project}</td>
        <td className="c-cost num">
          {r.amount == null ? <span className="muted">?</span> : <>{formatMoney(r.amount, r.currency)}<span className="per">{PER[r.interval]}</span></>}
        </td>
        <td className="c-month num">{formatMoney(r.perMonth, r.currency)}</td>
        <td className="c-year num">{formatMoney(r.perYear, r.currency)}</td>
        <td className={`c-deadline ${urgency(d)} ${r.deadline ? "has-date" : ""}`}>
          {r.deadline ? <>{formatShort(r.deadline)}{d! <= SOON && <span className="per"> {inDays(d!)}</span>}</>
            : r.state.kind === "laeuft" ? <span className="muted">{termLabel(r.term)}</span> : <span className="muted">–</span>}
        </td>
      </tr>
    );
  };

  const renderGroup = (g: Group) => {
    const isOpen = searching || open.includes(g.key);
    const t = totals(g.rows);
    const next = g.rows.filter((r) => r.deadline && r.state.kind === "laeuft").sort((a, b) => compare(a, b, "deadline"))[0];
    const d = next?.deadline ? daysBetween(today, next.deadline) : null;
    const c = { laeuft: 0, gekuendigt: 0, beendet: 0 };
    for (const r of g.rows) c[r.state.kind]++;
    const projectsInGroup = new Set(g.rows.map((r) => r.project));
    const noun = g.label.startsWith("Domains") ? "Pakete" : "Verträge";
    return (
      <Fragment key={g.key}>
        <tr className="group" onClick={() => toggleGroup(g.key)} aria-expanded={isOpen}>
          <td className="c-state">
            {c.laeuft > 0 && <span className="badge laeuft">{c.laeuft} {c.laeuft === 1 ? "läuft" : "laufen"}</span>}
            {c.gekuendigt > 0 && <span className="badge gekuendigt">{c.gekuendigt} gekündigt</span>}
            {c.beendet > 0 && <span className="badge beendet">{c.beendet} beendet</span>}
          </td>
          <td className="c-service">
            <button type="button" className="link group-toggle" onClick={(e) => { e.stopPropagation(); toggleGroup(g.key); }} aria-expanded={isOpen}>
              <span className="caret" aria-hidden="true">{isOpen ? "▾" : "▸"}</span> {g.label}
            </button>
            <span className="muted"> · {g.rows.length} {noun}</span>
          </td>
          <td className="c-project muted">{projectsInGroup.size === 1 ? g.rows[0].project : `${projectsInGroup.size} Projekte`}</td>
          <td className="c-cost num muted">{t.missing ? `${t.missing}× ?` : ""}</td>
          <td className="c-month num">{t.count > t.missing ? formatSums(t.perMonth) : <span className="muted">?</span>}</td>
          <td className="c-year num">{t.count > t.missing ? formatSums(t.perYear) : <span className="muted">?</span>}</td>
          <td className={`c-deadline ${urgency(d)} ${next ? "has-date" : ""}`}>
            {next ? <>{formatShort(next.deadline)}<span className="per"> {d! <= SOON ? inDays(d!) : "nächste"}</span></> : <span className="muted">–</span>}
          </td>
        </tr>
        {isOpen && g.rows.map((r) => renderRow(r, true))}
      </Fragment>
    );
  };

  return (
    <div className="admin">
      <header className="admin-head">
        <h1>Abos &amp; laufende Kosten</h1>
        <div className="admin-actions">
          <button type="button" className="primary" onClick={() => setEditing("new")}>+ neuer Eintrag</button>
          <a className="button" href="/admin/api/export" download>CSV-Export</a>
          <a className="button" href="/admin/api/backup" download>JSON-Sicherung</a>
          <label className="button">
            Import
            <input type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importFile(f); }} />
          </label>
          <form method="post" action="/admin/api/logout"><button type="submit" className="ghost">Abmelden</button></form>
        </div>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {info && <p className="admin-info" role="status">{info}</p>}

      <section className="tiles" aria-label="Summen">
        <div><span>pro Monat · nur laufende</span><strong>{formatSums(sum.perMonth)}</strong></div>
        <div><span>pro Jahr · nur laufende</span><strong>{formatSums(sum.perYear)}</strong></div>
        <div className="tile-states"><span>Verträge</span><strong>
          <span className="badge laeuft">{counts.laeuft} laufen</span>
          <span className="badge gekuendigt">{counts.gekuendigt} gekündigt</span>
          <span className="badge beendet">{counts.beendet} beendet</span>
        </strong></div>
        {sum.missing > 0 && <div className="warn"><span>ohne Kostenangabe</span><strong>{sum.missing}</strong></div>}
      </section>

      <section className="soon" aria-label="Kündigungsfristen">
        <h2>Frist läuft ab – nächste {SOON} Tage</h2>
        {soon.length === 0 ? (
          <p className="muted">Keine Kündigungsfrist in den nächsten {SOON} Tagen.</p>
        ) : (
          <ul>
            {soon.map((r) => {
              const d = daysBetween(today, r.deadline!);
              return (
                <li key={r.id} className={d <= URGENT ? "urgent" : "warn"}>
                  <button type="button" className="link" onClick={() => setEditing(r)}>
                    <strong>{formatShort(r.deadline)}</strong> ({inDays(d)}) · {r.service || r.provider} · {r.project}
                    {r.renewal && <span className="muted"> – sonst Verlängerung am {formatShort(r.renewal)}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="filters" aria-label="Filter">
        <select value={filter.state} onChange={(e) => setFilter({ ...filter, state: e.target.value })} aria-label="Vertrag">
          <option value="offen">laufende + gekündigte</option>
          <option value="alle">alle (auch beendete)</option>
          <option value="laeuft">nur laufende</option>
          <option value="gekuendigt">nur gekündigte</option>
          <option value="beendet">nur beendete</option>
        </select>
        <select value={filter.project} onChange={(e) => setFilter({ ...filter, project: e.target.value })} aria-label="Projekt">
          <option value="">alle Projekte</option>
          {projects.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={filter.provider} onChange={(e) => setFilter({ ...filter, provider: e.target.value })} aria-label="Anbieter">
          <option value="">alle Anbieter</option>
          {providers.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="mobile-sort" value={`${sort.key}:${sort.dir}`} aria-label="Sortierung"
          onChange={(e) => { const [key, dir] = e.target.value.split(":"); setSort({ key: key as SortKey, dir: dir === "-1" ? -1 : 1 }); }}>
          {COLUMNS.filter((c) => c.key).flatMap((c) => [
            <option key={`${c.key}:1`} value={`${c.key}:1`}>{c.label} ↑</option>,
            <option key={`${c.key}:-1`} value={`${c.key}:-1`}>{c.label} ↓</option>,
          ])}
        </select>
        <input type="search" placeholder="suchen …" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} aria-label="Suche" />
        {filtered && (
          <span className="muted">
            {visible.length} von {rows.length} · {formatSums(visibleSum.perMonth)}/Mon. · {formatSums(visibleSum.perYear)}/Jahr
          </span>
        )}
      </section>

      <div className="table-wrap">
        <table className="abos">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.label} className={c.className} aria-sort={c.key && sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
                  {c.key ? (
                    <button type="button" onClick={() => toggleSort(c.key!)}>
                      {c.label}{sort.key === c.key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (g.rows.length > 1 ? renderGroup(g) : renderRow(g.rows[0], false)))}
            {visible.length === 0 && (
              <tr><td colSpan={COLUMNS.length} className="muted">Keine Einträge.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="per-project" aria-label="Summen pro Projekt">
        <h2>pro Projekt (laufende Verträge)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Projekt</th><th className="num">/ Monat</th><th className="num">/ Jahr</th><th className="num">Verträge</th></tr></thead>
            <tbody>
              {byProject.map(({ project, t, total }) => (
                <tr key={project}>
                  <td><button type="button" className="link" onClick={() => setFilter({ ...filter, project })}>{project}</button></td>
                  <td className="num">{t.count > t.missing ? formatSums(t.perMonth) : <span className="muted">?</span>}</td>
                  <td className="num">{t.count > t.missing ? formatSums(t.perYear) : <span className="muted">?</span>}</td>
                  <td className="num">{t.count}{total > t.count ? <small> (+{total - t.count} gekündigt/beendet)</small> : ""}{t.missing ? <small className="warn"> · {t.missing} ohne Kosten</small> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <Editor
          abo={editing === "new" ? null : editing}
          projects={[...new Set([...KNOWN_PROJECTS, ...projects])]}
          providers={[...new Set([...KNOWN_PROVIDERS, ...providers])]}
          today={today}
          onClose={() => setEditing(null)}
          onSave={async (a, isNew) => (await save(a, isNew)) && setEditing(null)}
          onDelete={async (id) => (await remove(id)) && setEditing(null)}
        />
      )}
    </div>
  );
}

// ---------- Formular ----------

type Form = Record<Exclude<keyof Abo, "id">, string>;

const toForm = (a: Abo | null): Form => ({
  project: a?.project ?? "", provider: a?.provider ?? "", service: a?.service ?? "", contractNo: a?.contractNo ?? "",
  start: a?.start ?? "", amount: a?.amount == null ? "" : String(a.amount).replace(".", ","), currency: a?.currency ?? "EUR",
  interval: a?.interval ?? "monat", minTermMonths: a?.minTermMonths == null ? "" : String(a.minTermMonths),
  renewalMonths: a?.renewalMonths == null ? "" : String(a.renewalMonths), noticeValue: a?.noticeValue == null ? "" : String(a.noticeValue),
  noticeUnit: a?.noticeUnit ?? "monate", status: a?.status ?? "aktiv", endDate: a?.endDate ?? "", cancelledOn: a?.cancelledOn ?? "",
  note: a?.note ?? "",
});

const numOrNull = (s: string) => {
  const n = Number(s.replace(",", ".").trim());
  return s.trim() === "" || !Number.isFinite(n) ? null : n;
};

function fromForm(f: Form, id: string): Abo {
  return {
    id, project: f.project.trim() || "allgemein", provider: f.provider.trim(), service: f.service.trim(), contractNo: f.contractNo.trim(),
    start: f.start || null, amount: numOrNull(f.amount), currency: f.currency, interval: f.interval as Abo["interval"],
    minTermMonths: numOrNull(f.minTermMonths), renewalMonths: numOrNull(f.renewalMonths), noticeValue: numOrNull(f.noticeValue),
    noticeUnit: f.noticeUnit as Abo["noticeUnit"], status: f.status as Abo["status"], endDate: f.endDate || null, cancelledOn: f.cancelledOn || null, note: f.note.trim(),
  };
}

function Editor({ abo, projects, providers, today, onClose, onSave, onDelete }: {
  abo: Abo | null; projects: string[]; providers: string[]; today: string;
  onClose: () => void; onSave: (a: Abo, isNew: boolean) => Promise<unknown>; onDelete: (id: string) => Promise<unknown>;
}) {
  const [f, setF] = useState<Form>(() => toForm(abo));
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const preview = fromForm(f, abo?.id ?? "neu");
  const term = computeTerm(preview, today);
  const perMonth = monthlyCost(preview);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSave(preview, !abo);
    setBusy(false);
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <form className="editor" onSubmit={submit} role="dialog" aria-modal="true" aria-label={abo ? "Eintrag bearbeiten" : "Neuer Eintrag"}>
        <h2>{abo ? "Eintrag bearbeiten" : "Neuer Eintrag"}</h2>
        <div className="grid">
          <label>Projekt<input list="dl-projects" value={f.project} onChange={set("project")} placeholder="allgemein" autoFocus /></label>
          <label>Anbieter<input list="dl-providers" value={f.provider} onChange={set("provider")} required /></label>
          <label className="wide">Leistung<input value={f.service} onChange={set("service")} placeholder="z. B. Domainpaket .app – myveryown.app" required /></label>
          <label>Vertrags-/Auftragsnr.<input value={f.contractNo} onChange={set("contractNo")} /></label>
          <label>Beginn<input type="date" value={f.start} onChange={set("start")} /></label>
          <label>Kosten<input inputMode="decimal" value={f.amount} onChange={set("amount")} placeholder="unbekannt" /></label>
          <label>Währung
            <select value={f.currency} onChange={set("currency")}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Intervall
            <select value={f.interval} onChange={set("interval")}>{Object.entries(INTERVALS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          </label>
          <label>Mindestlaufzeit (Monate)<input inputMode="numeric" value={f.minTermMonths} onChange={set("minTermMonths")} placeholder="0 = keine" /></label>
          <label>Verlängert sich um (Monate)<input inputMode="numeric" value={f.renewalMonths} onChange={set("renewalMonths")} placeholder="0 = keine" /></label>
          <label>Kündigungsfrist zum Laufzeitende
            <span className="pair">
              <input inputMode="numeric" value={f.noticeValue} onChange={set("noticeValue")} placeholder="?" />
              <select value={f.noticeUnit} onChange={set("noticeUnit")}>{Object.entries(NOTICE_UNITS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </span>
          </label>
          <label>Status
            <select value={f.status} onChange={set("status")}>{Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          {f.status !== "aktiv" && <label>Gekündigt am<input type="date" value={f.cancelledOn} onChange={set("cancelledOn")} /></label>}
          {f.status !== "aktiv" && (
            <label>Endet am <span className="hint">(leer = berechnet)</span>
              <input type="date" value={f.endDate} onChange={set("endDate")} />
            </label>
          )}
          <label className="wide">Notiz<textarea rows={2} value={f.note} onChange={set("note")} /></label>
        </div>
        <datalist id="dl-projects">{projects.map((p) => <option key={p} value={p} />)}</datalist>
        <datalist id="dl-providers">{providers.map((p) => <option key={p} value={p} />)}</datalist>

        <p className="calc">
          {perMonth != null && preview.interval !== "einmalig" && <>{formatMoney(perMonth, preview.currency)} / Monat · {formatMoney(perMonth * 12, preview.currency)} / Jahr<br /></>}
          {term.kind === "laufend" ? (
            <>
              Nächste Verlängerung: <strong>{formatDate(term.nextRenewal)}</strong> · spätestens kündigen bis{" "}
              <strong>{formatDate(term.deadline)}</strong> (wirksam zum {formatDate(term.periodEnd)})
              {term.noticeMissing && <span className="warn"> – Frist fehlt, gerechnet ohne Frist</span>}
            </>
          ) : term.kind === "auslaufend" ? (
            <>Läuft ohne Verlängerung aus am <strong>{formatDate(term.end)}</strong>.</>
          ) : term.kind === "jederzeit" ? (
            <>Jederzeit kündbar{noticeLabel(preview) && preview.noticeValue ? ` (Frist ${noticeLabel(preview)})` : ""}.</>
          ) : term.kind === "unbekannt" ? (
            <span className="muted">Kündigungsdatum: {term.reason}.</span>
          ) : (
            <>Vertrag: <strong>{contractState(preview, today).label}</strong>
              {!preview.endDate && contractEnd(preview) && <span className="muted"> (Ende berechnet aus „gekündigt am“)</span>}
              {preview.status === "gekuendigt" && !contractEnd(preview) && <span className="warn"> – „gekündigt am“ oder „Endet am“ eintragen</span>}
            </>
          )}
        </p>

        <div className="editor-actions">
          {abo && (confirmDelete ? (
            <button type="button" className="danger" onClick={() => onDelete(abo.id)}>wirklich löschen</button>
          ) : (
            <button type="button" className="ghost" onClick={() => setConfirmDelete(true)}>löschen</button>
          ))}
          <span className="spacer" />
          <button type="button" className="ghost" onClick={onClose}>abbrechen</button>
          <button type="submit" className="primary" disabled={busy}>{busy ? "speichert …" : "speichern"}</button>
        </div>
      </form>
    </div>
  );
}
