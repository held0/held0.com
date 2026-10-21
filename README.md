# held0.com

Schlichte Liste meiner Live-Projekte plus Impressum/Datenschutz.

- Projekte eintragen: `app/projects.ts` (nur live erreichbare, nach Rückfrage; `descriptionEn` in britischem Englisch nicht vergessen)
- Für KI-Assistenten: `/llms.txt`, Startseite als Markdown bei `Accept: text/markdown`, robots.txt und JSON-LD werden aus `app/projects.ts` bzw. `app/agent-text.ts` erzeugt
- `/admin`: private Abo-/Kostenübersicht (Anmeldeseite /admin/login, Sitzungs-Cookie 30 Tage; auf dev ohne das dev-Passwort davor). Zugang in `~/held0-admin.auth` auf dem Server (`benutzer:passwort`, legt Niklas selbst an; ohne Datei antwortet `/admin` mit 503). Daten: `/app/data/abos.json` im Docker-Volume `held0-dev-data` (dev) bzw. `held0-data` (live), lokal `./data/`. Fristberechnung testen: `node scripts/test-abos.mjs`. dev und live haben getrennte Daten – übertragen per „JSON-Sicherung“ und „Import“ (gleiche id → Felder werden überschrieben). Auftragsnummern stehen wegen des öffentlichen Repos nicht im Code, sondern lokal in `data/strato-auftragsnummern.json` (nicht im Repo) zum Importieren
- Lokal: `npm run dev` (für `/admin`: `ADMIN_AUTH=ich:test npm run dev`)
- Deploy:
  - `./deploy.sh dev`: Vorschau auf https://dev.held0.com (Benutzer `dev`, gemeinsames Passwort in `~/dev.auth` auf dem Server)
  - `./deploy.sh live`: held0.com, nur nach Freigabe und nur mit einem Stand, der vorher auf dev lief

Das Skript deployt nur committete Stände und pusht vorher automatisch zu GitHub.
