#!/usr/bin/env bash
# Deploy von held0.com ohne Kamal: Build auf dem Server → neuer Container →
# Healthcheck → kamal-proxy umschalten → alten Container stoppen (für Rollback).
set -euo pipefail

SERVER=deploy@178.104.62.232
SERVICE=held0-portfolio-web
IMAGE=ghcr.io/held0/held0-portfolio
SHA=$(git rev-parse HEAD)

[ -z "$(git status --porcelain -- app public package.json package-lock.json next.config.ts Dockerfile)" ] \
  || { echo "Uncommittete Änderungen – erst committen."; exit 1; }

echo "→ Build $SHA"
git archive HEAD | ssh "$SERVER" "rm -rf /tmp/held0-build && mkdir -p /tmp/held0-build && tar -x -C /tmp/held0-build && cd /tmp/held0-build && docker build -q -t $IMAGE:$SHA ."

OLD=$(ssh "$SERVER" "docker ps -q --filter label=service=held0-portfolio")

echo "→ Container starten"
NEW=$(ssh "$SERVER" "docker run -d --name $SERVICE-$SHA --network kamal --restart unless-stopped \
  --log-opt max-size=5m --log-opt max-file=2 \
  --label service=held0-portfolio --label role=web --label destination= $IMAGE:$SHA" | cut -c1-12)

echo "→ Healthcheck"
sleep 3
for p in / /impressum /up; do
  ssh "$SERVER" "docker run --rm --network kamal curlimages/curl -sf -o /dev/null http://$NEW:3000$p" \
    || { echo "Healthcheck $p fehlgeschlagen – alte Version bleibt live."; ssh "$SERVER" "docker stop $NEW"; exit 1; }
done

echo "→ Proxy umschalten"
ssh "$SERVER" "docker exec kamal-proxy kamal-proxy deploy $SERVICE --target $NEW:3000 --host held0.com --host www.held0.com --tls"

if [ -n "$OLD" ]; then
  echo "→ Alten Container stoppen: $OLD"
  ssh "$SERVER" "docker stop $OLD" >/dev/null
fi

curl -s -o /dev/null -w "held0.com → %{http_code}\n" https://held0.com/
