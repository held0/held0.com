"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  computeTerm, contractState, daysBetween, formatDate, formatEUR, formatMoney, formatShort, groupOf, monthlyCost, noticeLabel,
  termLabel, toEUR, totals, type Abo, type ContractState, type Interval, type Term, type Totals,
} from "../../lib/admin/calc";

// Nur Anzeige: Die Daten pflegt der Assistent direkt in der Datei auf dem Server.
const SOON = 60; // Tage: Kündigungsfrist hervorheben
const URGENT = 14; // Tage: rot
const MIN_DEADLINES = 3; // so viele kommende Fristen immer zeigen, auch wenn später
const OPEN_KEY = "held0-admin-open-groups";

const PER: Record<Interval, string> = { monat: "/Mon.", quartal: "/Quart.", halbjahr: "/Halbj.", jahr: "/Jahr", "2jahre": "/2 J.", einmalig: "einmalig" };

type Row = Abo & {
  term: Term; state: ContractState; perMonth: number | null; perYear: number | null; deadline: string | null; renewal: string | null;
  group: { key: string; label: string };
}; // perMonth/perYear in Euro (umgerechnet)
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
  const m = monthlyCost(a);
  const perMonth = m == null ? null : toEUR(m, a.currency);
  return {
    ...a, cancelledOn: a.cancelledOn ?? null, term, state: contractState(a, today), perMonth, perYear: perMonth == null ? null : perMonth * 12,
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
const inDaysLong = (n: number) => (n === 0 ? "heute" : n === 1 ? "morgen" : `in ${n} Tagen`);
const urgency = (d: number | null) => (d == null ? "" : d <= URGENT ? "urgent" : d <= SOON ? "warn" : "");
const eur = (value: number | null, r: Row) => formatEUR(value, r.currency !== "EUR" && !!value);
const sumText = (t: Totals, key: "perMonth" | "perYear") => formatEUR(t[key], t.converted);

/** Angaben für die aufgeklappte Detailzeile (nur befüllte). */
function details(r: Row): [string, string][] {
  const list: [string, string | false | null | undefined][] = [
    ["Leistung", [r.provider, r.service].filter(Boolean).join(" · ")],
    ["Vertragsnr.", r.contractNo],
    ["Beginn", r.start && formatDate(r.start)],
    ["nächste Verlängerung", r.renewal && formatDate(r.renewal)],
    ["Kündigung wirksam zum", r.term.kind === "laufend" && formatDate(r.term.periodEnd)],
    ["Laufzeit", termLabel(r.term)],
    ["Frist", noticeLabel(r)],
    ["gekündigt am", r.cancelledOn && formatDate(r.cancelledOn)],
    ["Notiz", r.note],
  ];
  return list.filter((x): x is [string, string] => !!x[1]);
}

function Badge({ state }: { state: ContractState }) {
  return <span className={`badge ${state.kind}`}>{state.label}</span>;
}

type Group = { key: string; label: string; rows: Row[] };

export default function AdminApp({ initial, today }: { initial: Abo[]; today: string }) {
  const [filter, setFilter] = useState({ project: "", provider: "", state: "offen", q: "" });
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "deadline", dir: 1 });
  const [open, setOpen] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const toggleRow = (id: string) => setExpanded((x) => (x === id ? null : id));
  /** aus der Fristenliste: Gruppe aufklappen, Zeile aufklappen und hinscrollen */
  const showRow = (r: Row) => {
    setFilter((f) => ({ ...f, state: f.state === "offen" || f.state === "alle" || f.state === r.state.kind ? f.state : "offen" }));
    setOpen((list) => (list.includes(r.group.key) ? list : [...list, r.group.key]));
    setExpanded(r.id);
    requestAnimationFrame(() => document.getElementById(`abo-${r.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
  };

  const rows = useMemo(() => initial.map((a) => toRow(a, today)), [initial, today]);
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

  // Kacheln und Fristen gelten für Projekt/Anbieter/Suche (der Vertragsfilter blendet nur Tabellenzeilen aus –
  // Summen zählen ohnehin nur laufende Verträge)
  const scoped = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return rows.filter((r) => (!filter.project || r.project === filter.project)
      && (!filter.provider || r.provider === filter.provider)
      && (!q || [r.project, r.provider, r.service, r.contractNo, r.note].join(" ").toLowerCase().includes(q)));
  }, [rows, filter]);
  const scope = [filter.project, filter.provider, filter.q.trim() && `„${filter.q.trim()}“`].filter(Boolean).join(" · ");
  const sum = useMemo(() => totals(scoped), [scoped]);
  const counts = useMemo(() => {
    const c = { laeuft: 0, gekuendigt: 0, beendet: 0 };
    for (const r of scoped) c[r.state.kind]++;
    return c;
  }, [scoped]);

  // Kündigungsfristen: alles in den nächsten SOON Tagen, mindestens aber die nächsten MIN_DEADLINES
  const deadlines = useMemo(() => {
    const all = scoped
      .filter((r) => r.state.kind === "laeuft" && r.deadline)
      .sort((a, b) => compare(a, b, "deadline") || compare(a, b, "project"));
    const soon = all.filter((r) => daysBetween(today, r.deadline!) <= SOON);
    return soon.length >= MIN_DEADLINES ? soon : all.slice(0, MIN_DEADLINES);
  }, [scoped, today]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const searching = filter.q.trim() !== "";

  const renderRow = (r: Row, inGroup: boolean) => {
    const d = r.deadline ? daysBetween(today, r.deadline) : null;
    const isExpanded = expanded === r.id;
    return (
      <Fragment key={r.id}>
      <tr id={`abo-${r.id}`} onClick={() => toggleRow(r.id)}
        className={`state-${r.state.kind} ${inGroup ? "child" : ""} ${isExpanded ? "expanded" : ""}`}>
        <td className="c-state"><Badge state={r.state} /></td>
        <td className="c-service">
          <button type="button" className="link" aria-expanded={isExpanded} onClick={(e) => { e.stopPropagation(); toggleRow(r.id); }}>
            {!inGroup && r.provider && <span className="muted">{r.provider} · </span>}
            {r.service || "—"}
          </button>
          {r.note && <span className="note" aria-hidden="true">ⓘ</span>}
        </td>
        <td className="c-project">{r.project}</td>
        <td className="c-cost num">
          {r.amount == null ? <span className="muted">?</span> : <>{formatMoney(r.amount, r.currency)}<span className="per">{PER[r.interval]}</span></>}
        </td>
        <td className="c-month num">{eur(r.perMonth, r)}</td>
        <td className="c-year num">{eur(r.perYear, r)}</td>
        <td className={`c-deadline ${urgency(d)} ${r.deadline ? "has-date" : ""}`}>
          {r.deadline ? <>{formatShort(r.deadline)}{d! <= SOON && <span className="per"> {inDays(d!)}</span>}</>
            : r.state.kind === "laeuft" ? <span className="muted">{termLabel(r.term)}</span> : <span className="muted">–</span>}
        </td>
      </tr>
      {isExpanded && (
        <tr className={`detail ${inGroup ? "child" : ""}`}>
          <td colSpan={COLUMNS.length}>
            <dl>
              {details(r).map(([k, v]) => <div key={k} className={k === "Notiz" || k === "Leistung" ? "wide" : ""}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </td>
        </tr>
      )}
      </Fragment>
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
          <td className="c-month num">{t.count > t.missing ? sumText(t, "perMonth") : <span className="muted">?</span>}</td>
          <td className="c-year num">{t.count > t.missing ? sumText(t, "perYear") : <span className="muted">?</span>}</td>
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
          <form method="post" action="/admin/api/logout"><button type="submit" className="ghost">Abmelden</button></form>
        </div>
      </header>

      <section className="tiles" aria-label="Summen">
        <div><span>pro Monat · {scope || "nur laufende"}</span><strong>{sumText(sum, "perMonth")}</strong></div>
        <div><span>pro Jahr · {scope || "nur laufende"}</span><strong>{sumText(sum, "perYear")}</strong></div>
        <div className="tile-states"><span>Verträge{scope && ` · ${scope}`}</span><strong>
          <span className="badge laeuft">{counts.laeuft} laufen</span>
          <span className="badge gekuendigt">{counts.gekuendigt} gekündigt</span>
          <span className="badge beendet">{counts.beendet} beendet</span>
        </strong></div>
        {sum.missing > 0 && <div className="warn"><span>ohne Kostenangabe</span><strong>{sum.missing}</strong></div>}
      </section>

      <section className="soon" aria-label="Kündigungsfristen">
        <h2>Kündigungsfristen{scope && ` · ${scope}`}</h2>
        {deadlines.length === 0 ? (
          <p className="muted">Keine anstehenden Kündigungsfristen bei laufenden Verträgen.</p>
        ) : (
          <ul>
            {deadlines.map((r) => {
              const d = daysBetween(today, r.deadline!);
              return (
                <li key={r.id} className={urgency(d) || "later"}>
                  <button type="button" className="link" onClick={() => showRow(r)}>
                    <span className="when"><strong>{formatShort(r.deadline)}</strong> <span className="days">{inDaysLong(d)}</span></span>
                    <span className="what">{r.service || r.provider} <span className="muted">· {r.project}</span></span>
                    {r.renewal && <span className="else muted">sonst Verlängerung am {formatShort(r.renewal)}</span>}
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

    </div>
  );
}
