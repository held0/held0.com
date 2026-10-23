// Deploy-Dienst für den „Live deployen“-Button auf allen dev-Seiten.
// Läuft als Container im kamal-Netz und hängt per kamal-proxy unter dev.<domain>/__deploy.
// Zwei Arten von Projekten (projects.json):
//   type "image": startet exakt das Image, das gerade auf dev läuft, als Live-Container
//                 (Healthcheck → kamal-proxy umschalten → alte Live-Container stoppen, bleiben für Rollback).
//                 runArgs: zusätzliche docker-run-Argumente (Volumes …), envFiles: { VAR: Datei } → -e VAR=<Inhalt>.
//   type "files": kopiert exakt den dev-Stand (Verzeichnis auf dem Server) nach live und startet neu;
//                 der vorherige Live-Stand bleibt als <dir>.prev liegen.
import http from "node:http";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

const run = promisify(execFile);
const PROJECTS = JSON.parse(fs.readFileSync(new URL("./projects.json", import.meta.url)));
const HOME = "/home/deploy"; // gleicher Pfad wie auf dem Host (eingebunden)
const AUTH_FILE = `${HOME}/dev.auth`; // gemeinsamer dev-Zugang (dev:<passwort>)
const STATE = `${HOME}/deploy-state`;
const BUTTON = fs.readFileSync(new URL("./button.js", import.meta.url), "utf8");
let busy = false;

const sh = async (cmd, args) => (await run(cmd, args, { maxBuffer: 1 << 22 })).stdout.trim();
const docker = (...args) => sh("docker", args);

// Gemeinsames dev-Cookie ws_dev = sha256("dev-cookie:" + Zugang): einmal angemeldet, fragen Browser, die die
// Basic-Daten vergessen (v. a. Safari/iOS), nicht neu. Alle dev-Seiten prüfen und setzen es; hier ebenso –
// der Button lädt auf jeder dev-Seite, setzt das Cookie also auch dort, wo die Seite selbst es nicht kann.
function authorized(req, res) {
  const auth = fs.readFileSync(AUTH_FILE, "utf8").trim();
  const value = createHash("sha256").update("dev-cookie:" + auth).digest("hex");
  const cookie = String(req.headers.cookie || "").split(";").map((s) => s.trim()).find((s) => s.startsWith("ws_dev="));
  if (cookie && cookie.slice(7) === value) return true;
  if (req.headers.authorization !== "Basic " + Buffer.from(auth).toString("base64")) return false;
  res.setHeader("Set-Cookie", `ws_dev=${value}; Path=/; Max-Age=${180 * 86400}; HttpOnly; Secure; SameSite=Lax`);
  return true;
}

function readState(name, stage) {
  try {
    const [sha, subj] = fs.readFileSync(`${STATE}/${name}.${stage}-sha`, "utf8").trim().split(" ");
    return { sha: sha ? sha.slice(0, 7) : null, subject: subj ? Buffer.from(subj, "base64").toString("utf8").trim() : null };
  } catch {
    return { sha: null, subject: null };
  }
}

function writeState(name, stage, sha, subject) {
  fs.mkdirSync(STATE, { recursive: true });
  const file = `${STATE}/${name}.${stage}-sha`;
  fs.writeFileSync(file, `${sha} ${Buffer.from(subject || "").toString("base64")}\n`);
  const { uid, gid } = fs.statSync(HOME);
  fs.chownSync(file, uid, gid);
}

const containersByLabel = async (label) => {
  const ids = await docker("ps", "-q", "--filter", `label=service=${label}`);
  return ids ? ids.split("\n") : [];
};
const containerByName = async (name) => (await docker("ps", "-q", "--filter", `name=^${name}$`)) || null;
const imageOf = (id) => docker("inspect", "-f", "{{.Config.Image}}", id);

async function liveContainers(p) {
  const ids = [...(await containersByLabel(p.liveService)), ...(p.legacyLabel ? await containersByLabel(p.legacyLabel) : [])];
  if (p.fixedName) { const c = await containerByName(p.fixedName); if (c) ids.push(c); }
  return [...new Set(ids)];
}

async function status(p) {
  const dev = readState(p.name, "dev");
  if (p.type === "files") {
    const live = readState(p.name, "live");
    return { project: p.name, dev: dev.sha, subject: dev.subject, live: live.sha, same: !!dev.sha && dev.sha === live.sha };
  }
  const [devId] = p.devFixedName ? [await containerByName(p.devFixedName)].filter(Boolean) : await containersByLabel(p.devService);
  const live = await liveContainers(p);
  const devImage = devId ? await imageOf(devId) : null;
  const liveImage = live[0] ? await imageOf(live[0]) : null;
  const sha = (img) => (img ? img.split(":").pop().slice(0, 7) : null);
  return { project: p.name, dev: sha(devImage), live: sha(liveImage), subject: dev.subject, devImage, same: devImage === liveImage };
}

async function healthy(url) {
  for (let i = 0; i < 20; i++) {
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(3000) })).ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

// Geheimnisse, die nur als Datei auf dem Server liegen (z. B. held0: ~/held0-admin.auth → ADMIN_AUTH).
// Fehlt eine Datei, wird die Variable weggelassen (die App sperrt den Bereich dann selbst).
function envFromFiles(p) {
  return Object.entries(p.envFiles || {}).flatMap(([key, file]) => {
    try {
      const value = fs.readFileSync(file, "utf8").trim();
      return value ? ["-e", `${key}=${value}`] : [];
    } catch {
      return [];
    }
  });
}

async function promoteImage(p, s) {
  if (!s.devImage) throw new Error("Auf dev läuft gerade kein Container.");
  const old = await liveContainers(p);
  const tag = s.devImage.split(":").pop();
  // Projekte mit festem Containernamen (Cronjobs!) laufen erst als „…-next“ und werden danach umbenannt
  let name = p.fixedName ? `${p.fixedName}-next` : `${p.liveService}-${tag}`;
  // Läuft genau dieser Stand schon live (Button zweimal gedrückt), den laufenden Container nicht wegräumen,
  // sondern den neuen unter anderem Namen starten – sonst ist live kurz weg und „docker stop“ findet ihn nicht mehr.
  const existing = await docker("ps", "-aq", "--no-trunc", "--filter", `name=^${name}$`).catch(() => "");
  if (existing && old.some((c) => existing.startsWith(c))) name = `${name}-${Date.now().toString(36)}`;
  else await docker("rm", "-f", name).catch(() => {});
  const id = (await docker("run", "-d", "--name", name, "--network", "kamal", "--restart", "unless-stopped",
    "--log-opt", "max-size=5m", "--log-opt", "max-file=2", ...(p.runArgs || []), ...envFromFiles(p),
    "--label", `service=${p.liveService}`, "--label", "role=web", s.devImage)).slice(0, 12);
  if (!(await healthy(`http://${id}:${p.port}${p.healthPath || "/up"}`))) {
    await docker("rm", "-f", id).catch(() => {});
    throw new Error("Healthcheck fehlgeschlagen – der bisherige Live-Stand bleibt online.");
  }
  await docker("exec", "kamal-proxy", "kamal-proxy", "deploy", p.liveService, "--target", `${id}:${p.port}`,
    ...p.hosts.flatMap((h) => ["--host", h]), "--tls", "--health-check-path", p.healthPath || "/up");
  const stop = old.filter((c) => !id.startsWith(c) && !c.startsWith(id));
  // einzeln und fehlertolerant: ein schon entfernter Container darf den erfolgreichen Deploy nicht als Fehler melden
  for (const c of stop) await docker("stop", c).catch(() => {});
  if (p.fixedName) {
    await docker("rm", "-f", `${p.fixedName}-prev`).catch(() => {});
    if (await docker("ps", "-aq", "--filter", `name=^${p.fixedName}$`)) await docker("rename", p.fixedName, `${p.fixedName}-prev`);
    await docker("rename", name, p.fixedName);
  }
  return tag;
}

async function promoteFiles(p, s) {
  if (!s.dev) throw new Error("Für dev ist noch kein Stand vermerkt – einmal ./deploy.sh dev ausführen.");
  const ex = (p.exclude || []).flatMap((e) => ["--exclude", e]);
  await sh("rsync", ["-a", "--delete", ...ex, `${p.liveDir}/`, `${p.liveDir}.prev/`]);
  await sh("rsync", ["-a", "--delete", ...ex, `${p.devDir}/`, `${p.liveDir}/`]);
  if (p.after) await sh(p.after[0], p.after.slice(1));
  if (p.healthUrl && !(await healthy(p.healthUrl))) {
    await sh("rsync", ["-a", "--delete", ...ex, `${p.liveDir}.prev/`, `${p.liveDir}/`]);
    if (p.after) await sh(p.after[0], p.after.slice(1));
    throw new Error("Healthcheck fehlgeschlagen – der vorherige Live-Stand wurde wiederhergestellt.");
  }
  return s.dev;
}

async function promote(p) {
  const s = await status(p);
  const sha = p.type === "files" ? await promoteFiles(p, s) : await promoteImage(p, s);
  writeState(p.name, "live", sha, readState(p.name, "dev").subject);
  return { ok: true, live: sha.slice(0, 7), url: p.liveUrl };
}

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

http.createServer(async (req, res) => {
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").split(":")[0];
  const p = PROJECTS[host];
  const path = req.url.split("?")[0];
  if (path === "/__deploy/up") return send(res, 200, "OK", "text/plain");
  if (!p) return send(res, 404, { error: "unbekannte dev-Seite" });
  if (!authorized(req, res)) {
    res.writeHead(401, { "WWW-Authenticate": 'Basic realm="dev"' });
    return res.end();
  }
  try {
    if (path === "/__deploy/button.js") return send(res, 200, BUTTON, "text/javascript; charset=utf-8");
    if (path === "/__deploy/status" && req.method === "GET") {
      const { devImage, ...pub } = await status(p);
      return send(res, 200, pub);
    }
    if (path === "/__deploy/promote" && req.method === "POST") {
      // Schutz gegen Auslösen von fremden Seiten: nur same-origin mit eigenem Header
      if (req.headers["x-held0-deploy"] !== "1" || (req.headers.origin && req.headers.origin !== `https://${host}`)) {
        return send(res, 403, { error: "nicht erlaubt" });
      }
      if (busy) return send(res, 409, { error: "Es läuft schon ein Deploy." });
      busy = true;
      try { return send(res, 200, await promote(p)); } finally { busy = false; }
    }
    send(res, 404, { error: "nicht gefunden" });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}).listen(8080, () => console.log("deployer läuft auf :8080"));
