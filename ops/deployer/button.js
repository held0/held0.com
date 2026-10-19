// Schwebender „Live deployen“-Button für dev-Seiten (eingebunden über /__deploy/button.js).
(() => {
  if (window.__held0Deploy) return;
  window.__held0Deploy = true;
  const css = `
  .h0d-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483646;font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
    background:#0e1a14;color:#7ee2a8;border:1px solid #7ee2a8;border-radius:999px;padding:9px 14px;cursor:pointer;opacity:.35;transition:opacity .2s,transform .2s;box-shadow:0 8px 24px -10px #000}
  .h0d-btn:hover,.h0d-btn:focus-visible{opacity:1;transform:translateY(-2px)}
  .h0d-back{position:fixed;inset:0;z-index:2147483647;background:#0008;display:grid;place-items:center;padding:16px;font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
  .h0d-box{background:#0e1a14;color:#d8eadf;border:1px solid #2c4a3b;border-radius:14px;max-width:26rem;width:100%;padding:20px 22px;box-shadow:0 30px 60px -20px #000}
  .h0d-box h2{margin:0 0 12px;font-size:16px;color:#7ee2a8}.h0d-box p{margin:0 0 10px}.h0d-mu{color:#5f7d6c}
  .h0d-row{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
  .h0d-row button{font:inherit;border-radius:8px;padding:8px 14px;cursor:pointer;border:1px solid #2c4a3b;background:transparent;color:#d8eadf}
  .h0d-row .go{background:#7ee2a8;color:#0e1a14;border-color:#7ee2a8;font-weight:700}.h0d-row button:disabled{opacity:.5;cursor:default}
  .h0d-err{color:#ff8a8a}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.className = "h0d-btn";
  btn.type = "button";
  btn.textContent = "▲ live deployen";
  document.body.appendChild(btn);

  const modal = (html) => {
    const back = document.createElement("div");
    back.className = "h0d-back";
    back.innerHTML = `<div class="h0d-box" role="dialog" aria-modal="true">${html}</div>`;
    back.addEventListener("click", (e) => { if (e.target === back) back.remove(); });
    document.body.appendChild(back);
    return back;
  };

  btn.addEventListener("click", async () => {
    const back = modal(`<h2>Live deployen</h2><p class="h0d-mu">Lade Stand …</p>`);
    const box = back.firstElementChild;
    let s;
    try {
      s = await (await fetch("/__deploy/status", { credentials: "same-origin" })).json();
      if (s.error) throw new Error(s.error);
    } catch (e) {
      box.innerHTML = `<h2>Live deployen</h2><p class="h0d-err">${e.message}</p><div class="h0d-row"><button data-x>Schließen</button></div>`;
      box.querySelector("[data-x]").onclick = () => back.remove();
      return;
    }
    box.innerHTML = `<h2>${s.project} live schalten?</h2>
      <p>Dieser dev-Stand geht live:<br><b>${s.dev}</b>${s.subject ? ` – ${s.subject.replace(/</g, "&lt;")}` : ""}</p>
      <p class="h0d-mu">Aktuell live: ${s.live || "–"}${s.same ? " (identisch)" : ""}</p>
      <div class="h0d-row"><button data-x>Abbrechen</button><button class="go" data-go>Ja, live schalten</button></div>`;
    box.querySelector("[data-x]").onclick = () => back.remove();
    box.querySelector("[data-go]").onclick = async (e) => {
      e.target.disabled = true;
      box.querySelector("[data-x]").disabled = true;
      e.target.textContent = "Wird deployt …";
      try {
        const r = await fetch("/__deploy/promote", { method: "POST", credentials: "same-origin", headers: { "X-Held0-Deploy": "1" } });
        const out = await r.json();
        if (!r.ok) throw new Error(out.error || r.status);
        box.innerHTML = `<h2>✓ Live</h2><p>Stand <b>${out.live}</b> ist live.</p><p><a href="${out.url}" target="_blank" style="color:#7ee2a8">${out.url}</a></p><div class="h0d-row"><button data-x>Schließen</button></div>`;
      } catch (err) {
        box.innerHTML = `<h2>Nicht deployt</h2><p class="h0d-err">${err.message}</p><div class="h0d-row"><button data-x>Schließen</button></div>`;
      }
      box.querySelector("[data-x]").onclick = () => back.remove();
    };
  });
})();
