import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { sanitizeAbo, type Abo } from "./calc";
import { SEED } from "./seed";

// Ablage: eine JSON-Datei im Docker-Volume (deploy.sh hängt es unter /app/data ein; dev und live getrennt).
const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "abos.json");

type Store = { version: 1; items: Abo[] };

async function read(): Promise<Store> {
  try {
    const data = JSON.parse(await fs.readFile(FILE, "utf8")) as Store;
    return { version: 1, items: Array.isArray(data.items) ? data.items : [] };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; // kaputte Datei nicht überschreiben
    const store: Store = { version: 1, items: SEED };
    await write(store);
    return store;
  }
}

async function write(store: Store) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2) + "\n");
  await fs.copyFile(FILE, `${FILE}.bak`).catch(() => {}); // vorheriger Stand als Sicherung
  await fs.rename(tmp, FILE);
}

// Schreibzugriffe nacheinander abarbeiten
let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
}

export const listAbos = () => locked(async () => (await read()).items);

export const createAbo = (input: Record<string, unknown>) =>
  locked(async () => {
    const store = await read();
    const abo = sanitizeAbo(input, randomUUID());
    store.items.push(abo);
    await write(store);
    return abo;
  });

export const updateAbo = (id: string, input: Record<string, unknown>) =>
  locked(async () => {
    const store = await read();
    const i = store.items.findIndex((a) => a.id === id);
    if (i < 0) return null;
    store.items[i] = sanitizeAbo(input, id);
    await write(store);
    return store.items[i];
  });

export const deleteAbo = (id: string) =>
  locked(async () => {
    const store = await read();
    const before = store.items.length;
    store.items = store.items.filter((a) => a.id !== id);
    if (store.items.length === before) return false;
    await write(store);
    return true;
  });

/** Import (z. B. Sicherung von dev): Felder von Einträgen mit gleicher id werden überschrieben
 *  (fehlende Felder bleiben, wie sie sind), unbekannte ids kommen neu dazu. */
export const importAbos = (input: unknown[]) =>
  locked(async () => {
    const store = await read();
    let added = 0, updated = 0;
    for (const raw of input.slice(0, 1000)) {
      if (!raw || typeof raw !== "object") continue;
      const r = raw as Record<string, unknown>;
      const id = typeof r.id === "string" && /^[\w.-]{1,80}$/.test(r.id) ? r.id : randomUUID();
      const i = store.items.findIndex((a) => a.id === id);
      const abo = sanitizeAbo(i >= 0 ? { ...store.items[i], ...r } : r, id);
      if (i >= 0) { store.items[i] = abo; updated++; } else { store.items.push(abo); added++; }
    }
    await write(store);
    return { added, updated, items: store.items };
  });
