#!/usr/bin/env bash
#
# End-to-end test for "stack migrate".
#
# Scaffolds a workspace with the last PUBLISHED CLI, migrates it with the
# locally built one, then installs, formats, builds, lints, and format-checks
# the result. This is the real upgrade path: the input is the artifact users
# actually have on npm, not a fixture we wrote to match.
#
# Usage: e2e/run-migrate-e2e.sh [published-version]
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$REPO_ROOT/apps/cli/dist/index.js"
PUBLISHED="${1:-@stack-dev/cli@0.3.5}"

WORKDIR=""

cleanup() {
  if [[ -n "$WORKDIR" && -d "$WORKDIR" ]]; then
    rm -rf "$WORKDIR"
  fi
}
trap cleanup EXIT

step() { printf '\n\033[1;34m== %s\033[0m\n' "$1"; }
pass() { printf '\033[1;32mPASS\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31mFAIL\033[0m %s\n' "$1"; exit 1; }

stack() { node "$CLI" "$@"; }
published() { npx -y "$PUBLISHED" "$@"; }

# --- Build the CLI under test -------------------------------------------------

step "Building @stack-dev/cli"
pnpm --filter @stack-dev/core build >/dev/null
pnpm --filter @stack-dev/cli build >/dev/null
[[ -f "$CLI" ]] || fail "CLI did not build at $CLI"
pass "CLI built"

# --- Scaffold with the published CLI -----------------------------------------

WORKDIR="$(mktemp -d "${TMPDIR:-$(dirname "$(mktemp -u)")}/stack-dev-migrate-e2e.XXXXXX")"
step "Scaffolding a $PUBLISHED workspace in $WORKDIR"

cd "$WORKDIR"
published create ws
cd "$WORKDIR/ws"
published g my-lib --type library
published g my-cli --type cli

# The old stack is what we expect to find on the way in.
[[ -f packages/my-lib/eslint.config.mjs ]] || fail "expected a legacy eslint config"
[[ -f packages/my-lib/prettier.config.mjs ]] || fail "expected a legacy prettier config"
[[ -f packages/my-lib/tsup.config.ts ]] || fail "expected a legacy tsup config"
[[ -d configs/eslint-config ]] || fail "expected a legacy eslint-config package"
pass "scaffolded the old stack"

# migrate refuses to touch a dirty tree, so commit the baseline.
git init -q
git -c user.email=e2e@example.com -c user.name=e2e add -A
git -c user.email=e2e@example.com -c user.name=e2e commit -qm "published baseline"

# --- Migrate ------------------------------------------------------------------

step "stack migrate --dry-run"
dry_run="$(stack migrate --dry-run)"
echo "$dry_run" | grep -q 'Dry run: nothing written.' || fail "dry run did not say so"
[[ -f packages/my-lib/eslint.config.mjs ]] || fail "dry run deleted a file"
pass "dry run wrote nothing"

step "stack migrate"
stack migrate
pass "migrated"

step "Verifying the new stack"
[[ ! -f packages/my-lib/eslint.config.mjs ]] || fail "eslint config survived"
[[ ! -f packages/my-lib/prettier.config.mjs ]] || fail "prettier config survived"
[[ ! -f packages/my-lib/tsup.config.ts ]] || fail "tsup config survived"
[[ ! -d configs/eslint-config ]] || fail "eslint-config package survived"
[[ ! -d configs/prettier-config ]] || fail "prettier-config package survived"
[[ -f packages/my-lib/.oxlintrc.json ]] || fail "missing oxlint config"
[[ -f packages/my-lib/oxfmt.config.mts ]] || fail "missing oxfmt config"
[[ -f packages/my-lib/tsdown.config.ts ]] || fail "missing tsdown config"
[[ -d configs/oxlint-config ]] || fail "missing oxlint-config package"
[[ -d configs/oxfmt-config ]] || fail "missing oxfmt-config package"
grep -q 'oxfmt:' pnpm-workspace.yaml || fail "catalog has no oxfmt entry"
pass "the old stack is gone and the new one is in place"

step "stack migrate is idempotent"
stack migrate | grep -q 'Already up to date.' || fail "re-running found more work"
pass "re-running is a no-op"

# --- The migrated workspace has to actually work ------------------------------

step "pnpm install"
pnpm install
pass "installed"

# migrate deliberately does not reformat source; it tells you to run this.
step "turbo run format"
pnpm exec turbo run format
pass "formatted"

step "turbo run build"
pnpm exec turbo run build
pass "built"

step "turbo run lint"
pnpm exec turbo run lint
pass "linted"

step "turbo run format:check"
pnpm exec turbo run format:check
pass "format checked"

step "Running the migrated CLI app"
cli_out="$(node "$WORKDIR/ws/apps/my-cli/dist/index.mjs" split "a,b,c")"
echo "$cli_out" | grep -q "'a', 'b', 'c'" || fail "cli split output was: $cli_out"
pass "the migrated cli still runs"

printf '\n\033[1;32mMigrate E2E passed.\033[0m\n'
