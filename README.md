# held0.com

Schlichte Liste meiner Live-Projekte plus Impressum/Datenschutz.

- Projekte eintragen: `app/projects.ts` (nur live erreichbare, nach Rückfrage; `descriptionEn` in britischem Englisch nicht vergessen)
- Für KI-Assistenten: `/llms.txt`, Startseite als Markdown bei `Accept: text/markdown`, robots.txt und JSON-LD werden aus `app/projects.ts` bzw. `app/agent-text.ts` erzeugt
- Lokal: `npm run dev`
- Deploy:
  - `./deploy.sh dev`: Vorschau auf https://dev.held0.com (Benutzer `dev`, gemeinsames Passwort in `~/dev.auth` auf dem Server)
  - `./deploy.sh live`: held0.com, nur nach Freigabe und nur mit einem Stand, der vorher auf dev lief

Das Skript deployt nur committete Stände und pusht vorher automatisch zu GitHub.
