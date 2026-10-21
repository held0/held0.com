"use client";

import { useMemo, useState } from "react";
import {
  CURRENCIES, INTERVALS, NOTICE_UNITS, STATUSES, computeTerm, daysBetween, formatDate, formatMoney, formatSums,
  monthlyCost, noticeLabel, termLabel, totals, yearlyCost, type Abo, type Term,
} from "../../lib/admin/calc";

const KNOWN_PROJECTS = [
  "allgemein", "held0", "myveryown", "checkfirma", "cinenow", "watchsoon", "vokalreim", "imposter", "fahrtrichtung",
  "diary", "palestineflag",
];
const KNOWN_PROVIDERS = ["Strato", "Hetzner", "Anthropic", "Migadu", "Decodo", "Apple", "Google"];
const SOON = 60; // Tage: „Frist läuft ab“
const URGENT = 14;

type Row = Abo & { term: Term; perMonth: number | null; perYear: number | null; deadline: string | null; renewal: string | null };
type SortKey = "project" | "provider" | "service" | "start" | "perMonth" | "renewal" | "deadline" | "status";

const COLUMNS: { key: SortKey | null; label: string; className?: string }[] = [
  { key: "project", label: "Projekt" },
  { key: "provider", label: "Anbieter" },
  { key: "service", label: "Leistung" },
  { key: "start", label: "Beginn" },
  { key: null, label: "Kosten", className: "num" },
  { key: "perMonth", label: "/ Monat", className: "num" },
  { key: null, label: "/ Jahr", className: "num" },
  { key: "renewal", label: "Verlängerung" },
  { key: "deadline", label: "Kündigen bis" },
  { key: "status", label: "Status" },
];

function toRow(a: Abo, today: string): Row {
  const term = computeTerm(a, today);
  return {
    ...a, term, perMonth: monthlyCost(a), perYear: yearlyCost(a),
    deadline: term.kind === "laufend" ? term.deadline : null,
    renewal: term.kind === "laufend" ? term.nextRenewal : null,
  };
}

function compare(a: Row, b: Row, key: SortKey): number {
  const x = a[key], y = b[key];
  if (x == null && y == null) return 0;
  if (x == null) return 1; // leere Werte immer ans Ende
  if (y == null) return -1;
  return typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "de");
}

const inDays = (n: number) => (n === 0 ? "heute" : n === 1 ? "morgen" : `in ${n} Tagen`);

export default function AdminApp({ initial, today }: { initial: Abo[]; today: string }) {
  const [items, setItems] = useState<Abo[]>(initial);
  const [filter, setFilter] = useState({ project: "", provider: "", status: "", q: "" });
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "deadline", dir: 1 });
  const [editing, setEditing] = useState<Abo | "new" | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const rows = useMemo(() => items.map((a) => toRow(a, today)), [items, today]);
  const projects = useMemo(() => [...new Set(rows.map((r) => r.project))].sort((a, b) => a.localeCompare(b, "de")), [rows]);
  const providers = useMemo(() => [...new Set(rows.map((r) => r.provider).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de")), [rows]);

  const visible = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return rows
      .filter((r) => (!filter.project || r.project === filter.project)
        && (!filter.provider || r.provider === filter.provider)
        && (!filter.status || r.status === filter.status)
        && (!q || [r.project, r.provider, r.service, r.contractNo, r.note].join(" ").toLowerCase().includes(q)))
      .sort((a, b) => compare(a, b, sort.key) * sort.dir || compare(a, b, "project") || compare(a, b, "service"));
  }, [rows, filter, sort]);

  const sum = useMemo(() => totals(items), [items]);
  const visibleSum = useMemo(() => totals(visible), [visible]);
  const filtered = visible.length !== rows.length;

  const soon = useMemo(
    () => rows
      .filter((r) => r.deadline && daysBetween(today, r.deadline) <= SOON)
      .sort((a, b) => compare(a, b, "deadline")),
    [rows, today],
  );

  const byProject = useMemo(() => {
    const groups = new Map<string, Abo[]>();
    for (const r of rows) groups.set(r.project, [...(groups.get(r.project) ?? []), r]);
    return [...groups.entries()]
      .map(([project, list]) => ({ project, t: totals(list), total: list.length }))
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

  return (
    <div className="admin">
      <header className="admin-head">
        <h1>abos<span>_</span></h1>
        <div className="admin-actions">
          <button type="button" className="primary" onClick={() => setEditing("new")}>+ neuer Eintrag</button>
          <a className="button" href="/admin/api/export" download>CSV-Export</a>
          <a className="button" href="/admin/api/backup" download>JSON-Sicherung</a>
          <label className="button">
            Import
            <input type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importFile(f); }} />
          </label>
        </div>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {info && <p className="admin-info" role="status">{info}</p>}

      <section className="tiles" aria-label="Summen">
        <div><span>pro Monat</span><strong>{formatSums(sum.perMonth)}</strong></div>
        <div><span>pro Jahr</span><strong>{formatSums(sum.perYear)}</strong></div>
        <div><span>aktive Verträge</span><strong>{sum.count}</strong></div>
        <div className={sum.missing ? "warn" : ""}><span>ohne Kostenangabe</span><strong>{sum.missing}</strong></div>
      </section>

      <section className="soon" aria-label="Kündigungsfristen">
        <h2>{"// "}Frist läuft ab – nächste {SOON} Tage</h2>
        {soon.length === 0 ? (
          <p className="muted">Keine Kündigungsfrist in den nächsten {SOON} Tagen.</p>
        ) : (
          <ul>
            {soon.map((r) => {
              const d = daysBetween(today, r.deadline!);
              return (
                <li key={r.id} className={d <= URGENT ? "urgent" : "warn"}>
                  <button type="button" className="link" onClick={() => setEditing(r)}>
                    <strong>{formatDate(r.deadline)}</strong> ({inDays(d)}) · {r.service || r.provider} · {r.provider} · {r.project}
                    {r.term.kind === "laufend" && <span className="muted"> – sonst Verlängerung am {formatDate(r.term.nextRenewal)}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="filters" aria-label="Filter">
        <select value={filter.project} onChange={(e) => setFilter({ ...filter, project: e.target.value })} aria-label="Projekt">
          <option value="">alle Projekte</option>
          {projects.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={filter.provider} onChange={(e) => setFilter({ ...filter, provider: e.target.value })} aria-label="Anbieter">
          <option value="">alle Anbieter</option>
          {providers.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} aria-label="Status">
          <option value="">jeder Status</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="mobile-sort" value={`${sort.key}:${sort.dir}`} aria-label="Sortierung"
          onChange={(e) => { const [key, dir] = e.target.value.split(":"); setSort({ key: key as SortKey, dir: dir === "-1" ? -1 : 1 }); }}>
          {COLUMNS.filter((c) => c.key).flatMap((c) => [
            <option key={`${c.key}:1`} value={`${c.key}:1`}>{c.label.replace("/ ", "pro ")} ↑</option>,
            <option key={`${c.key}:-1`} value={`${c.key}:-1`}>{c.label.replace("/ ", "pro ")} ↓</option>,
          ])}
        </select>
        <input type="search" placeholder="suchen …" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} aria-label="Suche" />
        {filtered && (
          <span className="muted">
            {visible.length} von {rows.length} · {formatSums(visibleSum.perMonth)} / Monat · {formatSums(visibleSum.perYear)} / Jahr
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
            {visible.map((r) => {
              const d = r.deadline ? daysBetween(today, r.deadline) : null;
              return (
                <tr key={r.id} onClick={() => setEditing(r)} className={r.status !== "aktiv" ? "inactive" : ""}>
                  <td data-label="Projekt"><span>{r.project}</span></td>
                  <td data-label="Anbieter"><span>{r.provider}</span></td>
                  <td data-label="Leistung" className="service"><span>
                    <button type="button" className="link" onClick={(e) => { e.stopPropagation(); setEditing(r); }}>{r.service || "—"}</button>
                    {r.contractNo && <small>Nr. {r.contractNo}</small>}
                  </span></td>
                  <td data-label="Beginn"><span>{formatDate(r.start) || <span className="muted">?</span>}</span></td>
                  <td data-label="Kosten" className="num"><span>
                    {r.amount == null ? <span className="muted">?</span> : <>{formatMoney(r.amount, r.currency)} <small>{INTERVALS[r.interval].label}</small></>}
                  </span></td>
                  <td data-label="/ Monat" className="num"><span>{formatMoney(r.perMonth, r.currency)}</span></td>
                  <td data-label="/ Jahr" className="num"><span>{formatMoney(r.perYear, r.currency)}</span></td>
                  <td data-label="Verlängerung"><span>{formatDate(r.renewal)}</span></td>
                  <td data-label="Kündigen bis" className={d == null ? "" : d <= URGENT ? "urgent" : d <= SOON ? "warn" : ""}><span>
                    {r.deadline ? (
                      <>{formatDate(r.deadline)}<small>{d! <= SOON ? inDays(d!) : `zum ${formatDate(r.term.kind === "laufend" ? r.term.periodEnd : null)}`}</small></>
                    ) : r.status !== "aktiv" ? (
                      r.endDate ? <span className="muted">endet {formatDate(r.endDate)}</span> : ""
                    ) : (
                      <span className="muted">{termLabel(r.term)}</span>
                    )}
                  </span></td>
                  <td data-label="Status"><span><span className={`status ${r.status}`}>{STATUSES[r.status]}</span></span></td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={COLUMNS.length} className="muted">Keine Einträge.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="per-project" aria-label="Summen pro Projekt">
        <h2>{"// "}pro Projekt (aktive Verträge)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Projekt</th><th className="num">/ Monat</th><th className="num">/ Jahr</th><th className="num">Verträge</th></tr></thead>
            <tbody>
              {byProject.map(({ project, t, total }) => (
                <tr key={project}>
                  <td><button type="button" className="link" onClick={() => setFilter({ ...filter, project })}>{project}</button></td>
                  <td className="num">{t.count > t.missing ? formatSums(t.perMonth) : <span className="muted">?</span>}</td>
                  <td className="num">{t.count > t.missing ? formatSums(t.perYear) : <span className="muted">?</span>}</td>
                  <td className="num">{t.count}{total > t.count ? <small> (+{total - t.count} inaktiv)</small> : ""}{t.missing ? <small className="warn"> · {t.missing} ohne Kosten</small> : ""}</td>
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

type Form = Record<keyof Omit<Abo, "id">, string>;

const toForm = (a: Abo | null): Form => ({
  project: a?.project ?? "", provider: a?.provider ?? "", service: a?.service ?? "", contractNo: a?.contractNo ?? "",
  start: a?.start ?? "", amount: a?.amount == null ? "" : String(a.amount).replace(".", ","), currency: a?.currency ?? "EUR",
  interval: a?.interval ?? "monat", minTermMonths: a?.minTermMonths == null ? "" : String(a.minTermMonths),
  renewalMonths: a?.renewalMonths == null ? "" : String(a.renewalMonths), noticeValue: a?.noticeValue == null ? "" : String(a.noticeValue),
  noticeUnit: a?.noticeUnit ?? "monate", status: a?.status ?? "aktiv", endDate: a?.endDate ?? "", note: a?.note ?? "",
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
    noticeUnit: f.noticeUnit as Abo["noticeUnit"], status: f.status as Abo["status"], endDate: f.endDate || null, note: f.note.trim(),
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
          {f.status !== "aktiv" && <label>Endet am<input type="date" value={f.endDate} onChange={set("endDate")} /></label>}
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
          ) : null}
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
