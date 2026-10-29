#!/usr/bin/env bash
# Deploy von held0.com – Vorlage für alle Projekte.
#   ./deploy.sh dev    → https://dev.held0.com (Passwortschutz, darf jederzeit laufen)
#   ./deploy.sh live   → https://held0.com (nur nach Niklas' Freigabe; nur ein Stand, der vorher auf dev lief)
# Ablauf: nur committeter Stand → push zu GitHub → Build auf dem Server → neuer Container →
# Healthcheck → kamal-proxy umschalten → alten Container stoppen (bleibt für Rollback stehen).
set -euo pipefail
cd "$(dirname "$0")"

STAGE=${1:-}
SERVER=deploy@178.104.62.232
IMAGE=ghcr.io/held0/held0-portfolio
PORT=3000
DEVSHA="~/deploy-state/held0.dev-sha"   # zuletzt auf dev deployter Stand (+ Commit-Titel, liest auch der Deploy-Button)
# eine SSH-Verbindung für alle Schritte (viele Einzelverbindungen weist der Server teils ab)
S() { ssh -o ControlMaster=auto -o ControlPath="/tmp/deploy-%C" -o ControlPersist=120 "$SERVER" "$@"; }
case "$STAGE" in
  dev)  SERVICE=held0-dev;            HOSTS="--host dev.held0.com";                      VOLUME=held0-dev-data ;;
  live) SERVICE=held0-portfolio-web;  HOSTS="--host held0.com --host www.held0.com";     VOLUME=held0-data ;;
  *)    echo "Aufruf: ./deploy.sh dev | live"; exit 1 ;;
esac

# 1. Nur Committetes deployen, GitHub immer auf demselben Stand halten
[ -z "$(git status --porcelain)" ] || { echo "Uncommittete Änderungen – erst committen:"; git status --short; exit 1; }
git push -q
SHA=$(git rev-parse HEAD)

# 2. Live nur mit einem Stand, der vorher auf dev geprüft wurde
if [ "$STAGE" = live ] && [ "$(S "cut -d' ' -f1 $DEVSHA 2>/dev/null || true")" != "$SHA" ]; then
  echo "Stand ${SHA:0:7} lief noch nicht auf dev – erst ./deploy.sh dev und dort prüfen."; exit 1
fi

echo "→ Build ${SHA:0:7} ($STAGE)"
git archive HEAD | S "rm -rf /tmp/$SERVICE-build && mkdir -p /tmp/$SERVICE-build && tar -x -C /tmp/$SERVICE-build && cd /tmp/$SERVICE-build && docker build -q -t $IMAGE:$SHA ."

OLD=$(S "docker ps -q --filter label=service=$SERVICE" | tr '\n' ' ')
ENV=""
if [ "$STAGE" = dev ]; then
  # Gemeinsamer Zugang aller dev-Seiten (Benutzer dev, Passwort legt Niklas selbst fest): ~/dev.auth auf dem Server
  S "test -s ~/dev.auth" || { echo "~/dev.auth fehlt auf dem Server (Inhalt: dev:<passwort>) – bitte zuerst anlegen."; exit 1; }
  ENV='-e BASIC_AUTH="$(cat ~/dev.auth)"'
fi
# /admin (Abo-Übersicht): eigener Zugang, legt Niklas selbst an: ~/held0-admin.auth (benutzer:passwort).
# Fehlt die Datei, läuft die Seite trotzdem – /admin antwortet dann mit 503.
if S "test -s ~/held0-admin.auth"; then
  ENV="$ENV"' -e ADMIN_AUTH="$(cat ~/held0-admin.auth)"'
else
  echo "! ~/held0-admin.auth fehlt auf dem Server – /admin bleibt gesperrt (503)."
  echo "  Anlegen: ssh $SERVER 'umask 077; cat > ~/held0-admin.auth'  (eine Zeile benutzer:passwort, dann Strg-D) und erneut deployen."
fi
# Daten von /admin liegen im Volume $VOLUME (dev und live getrennt)
ENV="$ENV -v $VOLUME:/app/data"

echo "→ Container starten"
NEW=$(S "docker rm -f $SERVICE-$SHA >/dev/null 2>&1; docker run -d --name $SERVICE-$SHA --network kamal --restart unless-stopped \
  --log-opt max-size=5m --log-opt max-file=2 $ENV \
  --label service=$SERVICE --label role=web --label destination= $IMAGE:$SHA" | cut -c1-12)

echo "→ Healthcheck"
sleep 3
S "docker run --rm --network kamal curlimages/curl -sf -o /dev/null http://$NEW:$PORT/up" \
  || { echo "Healthcheck fehlgeschlagen – bisheriger Stand bleibt online."; S "docker stop $NEW" >/dev/null; exit 1; }

echo "→ Proxy umschalten"
S "docker exec kamal-proxy kamal-proxy deploy $SERVICE --target $NEW:$PORT $HOSTS --tls --health-check-path /up"

# nur noch vorhandene alte Container (beim erneuten Deploy desselben Stands ist der gleichnamige schon ersetzt)
OLD=$(for c in $OLD; do [ "$c" != "$NEW" ] && S "docker inspect -f . $c" >/dev/null 2>&1 && echo -n "$c "; done; true)
if [ -n "$OLD" ]; then
  echo "→ Alten Container stoppen: $OLD(Rollback: docker start <id> + Proxy zurück)"
  S "docker stop $OLD" >/dev/null
fi

if [ "$STAGE" = dev ]; then
  S "mkdir -p ~/deploy-state && echo $SHA $(git log -1 --format=%s | base64 | tr -d '\n') > $DEVSHA"
  echo "✓ dev: https://dev.held0.com (Benutzer dev, gemeinsames Passwort)"
else
  curl -s -o /dev/null -w "✓ live: held0.com → %{http_code}\n" https://held0.com/
fi
