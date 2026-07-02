#!/usr/bin/env bash
# Pre-build Capacitor smoke test.
# Boots the dev server (if not already running), runs the smoke spec, then exits.
# Used as a gate before `npx cap sync` / `npx cap run ios|android`.
set -euo pipefail

BASE_URL="${SMOKE_BASE_URL:-http://localhost:8080}"
STARTED_SERVER=0
SERVER_PID=""

cleanup() {
  if [[ "$STARTED_SERVER" == "1" && -n "$SERVER_PID" ]]; then
    echo "▶ stopping dev server (pid $SERVER_PID)"
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "▶ checking dev server at $BASE_URL"
if ! curl -sfo /dev/null "$BASE_URL"; then
  echo "▶ starting dev server"
  npm run dev >/tmp/cap-smoke-dev.log 2>&1 &
  SERVER_PID=$!
  STARTED_SERVER=1
  for i in {1..60}; do
    if curl -sfo /dev/null "$BASE_URL"; then
      echo "▶ dev server ready"
      break
    fi
    sleep 1
    if [[ $i -eq 60 ]]; then
      echo "✗ dev server failed to start — see /tmp/cap-smoke-dev.log"
      exit 1
    fi
  done
fi

echo "▶ running Capacitor smoke spec"
SMOKE_BASE_URL="$BASE_URL" npx playwright test tests/e2e/capacitor-smoke.spec.ts --reporter=list

echo "✓ smoke passed — safe to run cap sync / cap run"
