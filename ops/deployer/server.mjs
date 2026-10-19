// Deploy-Dienst für den „Live deployen“-Button auf allen dev-Seiten.
// Läuft als Container im kamal-Netz und hängt per kamal-proxy unter dev.<domain>/__deploy.
// „Live deployen“ startet exakt das Image, das gerade auf dev läuft, als Live-Container:
// Healthcheck → kamal-proxy umschalten → alte Live-Container stoppen (bleiben für Rollback stehen).
import http from "node:http";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const PROJECTS = JSON.parse(fs.readFileSync(new URL("./projects.json", import.meta.url)));
const AUTH_FILE = "/host/dev.auth"; // gemeinsamer dev-Zugang (dev:<passwort>), nur lesend eingebunden
const BUTTON = fs.readFileSync(new URL("./button.js", import.meta.url), "utf8");
let busy = false;

const docker = async (...args) => (await run("docker", args, { maxBuffer: 1 << 20 })).stdout.trim();

function authorized(req) {
  const expected = "Basic " + Buffer.from(fs.readFileSync(AUTH_FILE, "utf8").trim()).toString("base64");
  return req.headers.authorization === expected;
}

async function containers(label) {
  const ids = await docker("ps", "-q", "--filter", `label=service=${label}`);
  return ids ? ids.split("\n") : [];
}

async function imageOf(id) {
  return docker("inspect", "-f", "{{.Config.Image}}", id);
}

async function status(p) {
  const [dev] = await containers(p.devService);
  const live = [...new Set([...(await containers(p.liveService)), ...(await containers(p.legacyLabel))])];
  const devImage = dev ? await imageOf(dev) : null;
  const liveImage = live[0] ? await imageOf(live[0]) : null;
  const sha = (img) => (img ? img.split(":").pop().slice(0, 7) : null);
  let subject = null;
  try {
    const info = fs.readFileSync(`/host/state/${p.name}.dev-sha`, "utf8").trim().split(" ");
    if (info[1]) subject = Buffer.from(info[1], "base64").toString("utf8");
  } catch {}
  return { project: p.name, dev: sha(devImage), live: sha(liveImage), subject, devImage, same: devImage === liveImage };
}

async function healthy(id, port) {
  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch(`http://${id}:${port}/up`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

async function promote(p) {
  const s = await status(p);
  if (!s.devImage) throw new Error("Auf dev läuft gerade kein Container.");
  const old = [...new Set([...(await containers(p.liveService)), ...(await containers(p.legacyLabel))])];
  const tag = s.devImage.split(":").pop();
  const name = `${p.liveService}-${tag}`;
  await docker("rm", "-f", name).catch(() => {});
  const id = (await docker("run", "-d", "--name", name, "--network", "kamal", "--restart", "unless-stopped",
    "--log-opt", "max-size=5m", "--log-opt", "max-file=2",
    "--label", `service=${p.liveService}`, "--label", "role=web", "--label", "destination=", s.devImage)).slice(0, 12);
  if (!(await healthy(id, p.port))) {
    await docker("stop", id).catch(() => {});
    throw new Error("Healthcheck fehlgeschlagen – der bisherige Live-Stand bleibt online.");
  }
  await docker("exec", "kamal-proxy", "kamal-proxy", "deploy", p.liveService, "--target", `${id}:${p.port}`,
    ...p.hosts.flatMap((h) => ["--host", h]), "--tls", "--health-check-path", "/up");
  const stop = old.filter((c) => !id.startsWith(c) && !c.startsWith(id));
  if (stop.length) await docker("stop", ...stop);
  return { ok: true, live: tag.slice(0, 7), url: p.liveUrl };
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
  if (!authorized(req)) {
    res.writeHead(401, { "WWW-Authenticate": 'Basic realm="dev"' });
    return res.end();
  }
  try {
    if (path === "/__deploy/button.js") return send(res, 200, BUTTON, "text/javascript; charset=utf-8");
    if (path === "/__deploy/status" && req.method === "GET") return send(res, 200, await status(p));
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
