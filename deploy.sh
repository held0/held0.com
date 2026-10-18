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
DEVSHA="~/held0.dev-sha"   # zuletzt auf dev deployter Stand
# eine SSH-Verbindung für alle Schritte (viele Einzelverbindungen weist der Server teils ab)
S() { ssh -o ControlMaster=auto -o ControlPath="/tmp/deploy-%C" -o ControlPersist=120 "$SERVER" "$@"; }
case "$STAGE" in
  dev)  SERVICE=held0-dev;            HOSTS="--host dev.held0.com" ;;
  live) SERVICE=held0-portfolio-web;  HOSTS="--host held0.com --host www.held0.com" ;;
  *)    echo "Aufruf: ./deploy.sh dev | live"; exit 1 ;;
esac

# 1. Nur Committetes deployen, GitHub immer auf demselben Stand halten
[ -z "$(git status --porcelain)" ] || { echo "Uncommittete Änderungen – erst committen:"; git status --short; exit 1; }
git push -q
SHA=$(git rev-parse HEAD)

# 2. Live nur mit einem Stand, der vorher auf dev geprüft wurde
if [ "$STAGE" = live ] && [ "$(S "cat $DEVSHA 2>/dev/null || true")" != "$SHA" ]; then
  echo "Stand ${SHA:0:7} lief noch nicht auf dev – erst ./deploy.sh dev und dort prüfen."; exit 1
fi

echo "→ Build ${SHA:0:7} ($STAGE)"
git archive HEAD | S "rm -rf /tmp/$SERVICE-build && mkdir -p /tmp/$SERVICE-build && tar -x -C /tmp/$SERVICE-build && cd /tmp/$SERVICE-build && docker build -q -t $IMAGE:$SHA ."

OLD=$(S "docker ps -q --filter label=service=$SERVICE" | tr '\n' ' ')
ENV=""
if [ "$STAGE" = dev ]; then
  # Zugang user:passwort liegt nur auf dem Server; wird beim ersten Mal erzeugt
  S "[ -f ~/$SERVICE.auth ] || (umask 077; echo dev:\$(openssl rand -hex 12) > ~/$SERVICE.auth)"
  ENV='-e BASIC_AUTH="$(cat ~/'$SERVICE'.auth)"'
fi

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

OLD=$(for c in $OLD; do [ "$c" != "$NEW" ] && echo -n "$c "; done; true)
if [ -n "$OLD" ]; then
  echo "→ Alten Container stoppen: $OLD(Rollback: docker start <id> + Proxy zurück)"
  S "docker stop $OLD" >/dev/null
fi

if [ "$STAGE" = dev ]; then
  S "echo $SHA > $DEVSHA"
  echo "✓ dev: https://dev.held0.com (Zugang: ~/$SERVICE.auth auf dem Server)"
else
  curl -s -o /dev/null -w "✓ live: held0.com → %{http_code}\n" https://held0.com/
fi
