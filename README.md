# held0.com

Schlichte Liste meiner Live-Projekte plus Impressum/Datenschutz.

- Projekte eintragen: `app/projects.ts` (nur live erreichbare, nach Rückfrage)
- Lokal: `npm run dev`
- Deploy:
  - `./deploy.sh dev`: Vorschau auf https://dev.held0.com (Passwort in `~/held0-dev.auth` auf dem Server)
  - `./deploy.sh live`: held0.com, nur nach Freigabe und nur mit einem Stand, der vorher auf dev lief

Das Skript deployt nur committete Stände und pusht vorher automatisch zu GitHub.
