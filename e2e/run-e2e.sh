#!/usr/bin/env bash
#
# End-to-end test for the @stack-dev/cli.
#
# Scaffolds a fresh workspace in a throwaway temp directory, generates one of
# every package type, links a library into the CLI app, then installs, builds,
# lints, runs the generated apps, and runs the workspace test suite. Nothing is
# written outside the temp directory, which is removed on exit.
#
# Usage: e2e/run-e2e.sh
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$REPO_ROOT/apps/cli/dist/index.js"

# Background PIDs to reap and the temp workspace to delete on exit.
BG_PIDS=()
WORKDIR=""

cleanup() {
  for pid in "${BG_PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  done
  if [[ -n "$WORKDIR" && -d "$WORKDIR" ]]; then
    rm -rf "$WORKDIR"
  fi
}
trap cleanup EXIT

step() { printf '\n\033[1;34m== %s\033[0m\n' "$1"; }
pass() { printf '\033[1;32mPASS\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31mFAIL\033[0m %s\n' "$1"; exit 1; }

# Prints an OS-assigned free TCP port.
free_port() {
  node -e "const s=require('net').createServer().listen(0,()=>{const p=s.address().port;s.close(()=>console.log(p))})"
}

# Polls url until it answers 200, up to ~10s. Returns non-zero on timeout.
wait_for_200() {
  local url="$1"
  for _ in $(seq 1 40); do
    if [[ "$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)" == "200" ]]; then
      return 0
    fi
    sleep 0.25
  done
  return 1
}

stack() { node "$CLI" "$@"; }

# --- Build the CLI under test -------------------------------------------------

step "Building @stack-dev/cli"
pnpm --filter @stack-dev/core build >/dev/null
pnpm --filter @stack-dev/cli build >/dev/null
[[ -f "$CLI" ]] || fail "CLI did not build at $CLI"
pass "CLI built"

# --- Scaffold -----------------------------------------------------------------

WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/stack-dev-e2e.XXXXXX")"
step "Scaffolding workspace in $WORKDIR"

cd "$WORKDIR"
stack create ws
cd "$WORKDIR/ws"

stack g my-lib --type library
stack g my-ui --type react --style styled-components
stack g my-cli --type cli
stack g my-api --type fastify
stack g my-web --type vite
pass "generated library, react, cli, fastify, and vite packages"

step "Linking my-lib into my-cli"
( cd "$WORKDIR/ws/apps/my-cli" && stack link @ws/my-lib )
grep -q '@ws/my-lib' "$WORKDIR/ws/apps/my-cli/package.json" || fail "link did not add dependency"
pass "linked"

# --- Install / build / lint ---------------------------------------------------

step "pnpm install"
pnpm install
pass "installed"

step "turbo run build"
pnpm exec turbo run build
pass "built"

step "turbo run lint"
pnpm exec turbo run lint
pass "linted"

# --- Run the generated apps ---------------------------------------------------

step "Running the CLI app"
cli_out="$(node "$WORKDIR/ws/apps/my-cli/dist/index.mjs" split "a,b,c")"
echo "$cli_out" | grep -q "'a', 'b', 'c'" || fail "cli split output was: $cli_out"
node "$WORKDIR/ws/apps/my-cli/dist/index.mjs" --version >/dev/null || fail "cli --version exited non-zero"
pass "cli runs and splits input"

step "Running the Fastify app"
api_port="$(free_port)"
PORT="$api_port" node "$WORKDIR/ws/apps/my-api/dist/index.mjs" >/dev/null 2>&1 &
BG_PIDS+=($!)
wait_for_200 "http://localhost:$api_port/" || fail "fastify never returned 200"
api_root="$(curl -s "http://localhost:$api_port/")"
api_add="$(curl -s "http://localhost:$api_port/add/2/3")"
echo "$api_root" | grep -q '"hello":"world"' || fail "fastify / body was: $api_root"
echo "$api_add" | grep -q '"result":5' || fail "fastify /add/2/3 body was: $api_add"
pass "fastify serves 200 with expected payloads"

step "Running the Vite app"
web_port="$(free_port)"
( cd "$WORKDIR/ws/apps/my-web" && pnpm exec vite preview --port "$web_port" --strictPort ) >/dev/null 2>&1 &
BG_PIDS+=($!)
wait_for_200 "http://localhost:$web_port/" || fail "vite preview never returned 200"
web_body="$(curl -s "http://localhost:$web_port/")"
echo "$web_body" | grep -q '<div id="root">' || fail "vite body missing root div"
pass "vite builds and serves the app"

# --- Test ---------------------------------------------------------------------

step "turbo run test"
pnpm exec turbo run test
pass "tests passed"

printf '\n\033[1;32mE2E passed.\033[0m\n'
