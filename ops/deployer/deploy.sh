#!/usr/bin/env bash
# Startet/aktualisiert den Deploy-Dienst (Container „deployer“) und hängt ihn auf jeder dev-Seite
# aus projects.json unter /__deploy ein. Nach Änderungen an projects.json erneut ausführen.
set -euo pipefail
cd "$(dirname "$0")"
SERVER=deploy@178.104.62.232
S() { ssh -o ControlMaster=auto -o ControlPath="/tmp/deploy-%C" -o ControlPersist=120 "$SERVER" "$@"; }

echo "→ Build"
tar -c Dockerfile server.mjs button.js projects.json | S "rm -rf /tmp/deployer-build && mkdir -p /tmp/deployer-build ~/deploy-state && tar -x -C /tmp/deployer-build && docker build -q -t deployer:latest /tmp/deployer-build"

echo "→ Container"
# Docker-Socket: nötig, um Live-Container zu starten und kamal-proxy umzuschalten.
# Zugang nur mit dem gemeinsamen dev-Passwort (~/dev.auth, nur lesend eingebunden).
S "docker rm -f deployer >/dev/null 2>&1; docker run -d --name deployer --network kamal --restart unless-stopped \
  --log-opt max-size=5m --log-opt max-file=2 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v \$HOME/dev.auth:/host/dev.auth:ro -v \$HOME/deploy-state:/host/state:ro \
  deployer:latest >/dev/null"
sleep 2
S "docker run --rm --network kamal curlimages/curl -sf http://deployer:8080/__deploy/up" >/dev/null && echo "  läuft"

echo "→ Auf den dev-Seiten einhängen"
for host in $(python3 -c 'import json;print(" ".join(json.load(open("projects.json"))))'); do
  name=$(python3 -c "import json;print(json.load(open('projects.json'))['$host']['name'])")
  S "docker exec kamal-proxy kamal-proxy deploy deployer-$name --target deployer:8080 --host $host \
    --path-prefix /__deploy --strip-path-prefix=false --health-check-path /__deploy/up" >/dev/null
  echo "  https://$host/__deploy"
done
