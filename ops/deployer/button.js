// Schwebender „Live deployen“-Button für dev-Seiten (eingebunden über /__deploy/button.js).
// Stile nur per element.style (CSSOM) – funktioniert auch unter strengen CSPs ohne 'unsafe-inline'.
(() => {
  if (window.__held0Deploy) return;
  window.__held0Deploy = true;
  const C = { bg: "#0e1a14", fg: "#d8eadf", mu: "#5f7d6c", ac: "#7ee2a8", line: "#2c4a3b", err: "#ff8a8a" };
  const FONT = "13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace";
  const el = (tag, style = {}, text) => {
    const e = document.createElement(tag);
    Object.assign(e.style, style);
    if (text != null) e.textContent = text;
    return e;
  };
  const button = (label, primary) => {
    const b = el("button", { font: FONT, borderRadius: "8px", padding: "8px 14px", cursor: "pointer", border: `1px solid ${primary ? C.ac : C.line}`,
      background: primary ? C.ac : "transparent", color: primary ? C.bg : C.fg, fontWeight: primary ? "700" : "400" }, label);
    b.type = "button";
    return b;
  };

  const fab = el("button", { position: "fixed", right: "16px", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", zIndex: "2147483646",
    font: "600 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace", background: C.bg, color: C.ac, border: `1px solid ${C.ac}`,
    borderRadius: "999px", padding: "9px 14px", cursor: "pointer", opacity: "0.35", transition: "opacity .2s, transform .2s",
    boxShadow: "0 8px 24px -10px #000" }, "▲ live deployen");
  fab.type = "button";
  const hover = (on) => { fab.style.opacity = on ? "1" : "0.35"; fab.style.transform = on ? "translateY(-2px)" : "none"; };
  ["mouseenter", "focus"].forEach((ev) => fab.addEventListener(ev, () => hover(true)));
  ["mouseleave", "blur"].forEach((ev) => fab.addEventListener(ev, () => hover(false)));
  document.body.appendChild(fab);

  function dialog() {
    const back = el("div", { position: "fixed", inset: "0", zIndex: "2147483647", background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: "16px" });
    const box = el("div", { background: C.bg, color: C.fg, border: `1px solid ${C.line}`, borderRadius: "14px", maxWidth: "26rem", width: "100%",
      padding: "20px 22px", boxShadow: "0 30px 60px -20px #000", font: FONT, fontSize: "14px" });
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    back.appendChild(box);
    back.addEventListener("click", (e) => { if (e.target === back) back.remove(); });
    document.body.appendChild(back);
    const fill = (title, lines, actions) => {
      box.replaceChildren(el("h2", { margin: "0 0 12px", fontSize: "16px", color: C.ac }, title));
      for (const [text, style] of lines) box.appendChild(el("p", { margin: "0 0 10px", ...style }, text));
      const row = el("div", { display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" });
      actions.forEach((a) => row.appendChild(a));
      box.appendChild(row);
    };
    const close = () => { const b = button("Schließen"); b.onclick = () => back.remove(); return b; };
    return { fill, close };
  }

  fab.addEventListener("click", async () => {
    const d = dialog();
    d.fill("Live deployen", [["Lade Stand …", { color: C.mu }]], []);
    let s;
    try {
      s = await (await fetch("/__deploy/status", { credentials: "same-origin" })).json();
      if (s.error) throw new Error(s.error);
    } catch (e) {
      return d.fill("Live deployen", [[e.message, { color: C.err }]], [d.close()]);
    }
    const cancel = button("Abbrechen");
    const go = button("Ja, live schalten", true);
    d.fill(`${s.project} live schalten?`, [
      ["Dieser dev-Stand geht live:", {}],
      [`${s.dev || "–"}${s.subject ? " – " + s.subject : ""}`, { fontWeight: "700" }],
      [`Aktuell live: ${s.live || "–"}${s.same ? " (identisch)" : ""}`, { color: C.mu }],
    ], [cancel, go]);
    cancel.onclick = () => cancel.closest("div[role=dialog]").parentElement.remove();
    go.onclick = async () => {
      go.disabled = cancel.disabled = true;
      go.textContent = "Wird deployt …";
      try {
        const r = await fetch("/__deploy/promote", { method: "POST", credentials: "same-origin", headers: { "X-Held0-Deploy": "1" } });
        const out = await r.json();
        if (!r.ok) throw new Error(out.error || r.status);
        const open = button("Live-Seite öffnen", true);
        open.onclick = () => window.open(out.url, "_blank", "noopener");
        d.fill("✓ Live", [[`Stand ${out.live} ist live.`, {}], [out.url, { color: C.mu }]], [d.close(), open]);
      } catch (err) {
        d.fill("Nicht deployt", [[err.message, { color: C.err }]], [d.close()]);
      }
    };
  });
})();
