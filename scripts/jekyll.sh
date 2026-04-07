#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-9000}"
RUBY_BIN=""
BUNDLE_BIN=""

find_free_port() {
  local port="$1"

  while lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
    port=$((port + 1))
  done

  echo "$port"
}

select_ruby_toolchain() {
  if [ -x "/opt/homebrew/opt/ruby/bin/ruby" ] && [ -x "/opt/homebrew/opt/ruby/bin/bundle" ]; then
    RUBY_BIN="/opt/homebrew/opt/ruby/bin/ruby"
    BUNDLE_BIN="/opt/homebrew/opt/ruby/bin/bundle"
    return
  fi

  RUBY_BIN="$(command -v ruby || true)"
  BUNDLE_BIN="$(command -v bundle || true)"
}

ensure_toolchain() {
  select_ruby_toolchain

  if [ -z "$RUBY_BIN" ] || [ -z "$BUNDLE_BIN" ]; then
    echo "Ruby and Bundler are required to run Jekyll." >&2
    echo "Install Homebrew Ruby or add ruby/bundle to PATH, then retry." >&2
    exit 1
  fi

  echo "Using Ruby: $("$RUBY_BIN" -v)"
  echo "Using Bundler: $("$BUNDLE_BIN" -v)"
}

install_dependencies_if_needed() {
  if [ -d "vendor/bundle" ]; then
    return
  fi

  echo "Installing Ruby dependencies into vendor/bundle..."
  "$BUNDLE_BIN" config set --local path "vendor/bundle"
  "$BUNDLE_BIN" install
}

run_jekyll() {
  local command="${1:-serve}"
  shift || true

  install_dependencies_if_needed

    if [ "$command" = "serve" ]; then
      PORT="$(find_free_port "$PORT")"
      echo "Starting Jekyll at http://localhost:$PORT"
      exec "$BUNDLE_BIN" exec jekyll serve --port "$PORT" --livereload false "$@"
    fi

  exec "$BUNDLE_BIN" exec jekyll "$command" "$@"
}

ensure_toolchain
run_jekyll "$@"
