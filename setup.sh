#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# load nvm if available but not already loaded
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

# Ensure required Node version
if command -v nvm >/dev/null 2>&1 && [[ -f .nvmrc ]]; then
  NODE_VERSION="$(cat .nvmrc)"
  if nvm ls "$NODE_VERSION" >/dev/null 2>&1; then
    nvm use "$NODE_VERSION"
  else
    echo "⚠️  Node $NODE_VERSION not installed. Continuing with $(node -v)" >&2
  fi
elif ! node -v | grep -q "^v20\\." ; then
  echo "⚠️  Node 20.x recommended. Continuing with $(node -v)" >&2
fi

# Enable/activate pnpm via Corepack to match package.json's packageManager
if command -v corepack >/dev/null 2>&1; then
  PM=""
  if command -v jq >/dev/null 2>&1 && [[ -f package.json ]]; then
    PM="$(jq -r '.packageManager // empty' package.json 2>/dev/null)"
  fi
  if [[ "$PM" =~ ^pnpm@[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    corepack prepare "$PM" --activate || corepack enable pnpm
  else
    corepack enable pnpm
  fi
fi

echo "▶ Installing JS dependencies"
if command -v pnpm >/dev/null 2>&1; then
  if ! pnpm install --frozen-lockfile; then
    echo "⚠️  pnpm install failed, trying npm ci as fallback" >&2
    if ! npm ci; then
      echo "❌ Both pnpm and npm install failed" >&2
      exit 1
    fi
  fi
else
  echo "ℹ️  pnpm not found; falling back to npm ci"
  if ! npm ci; then
    echo "❌ npm ci failed" >&2
    exit 1
  fi
fi

echo "▶ Running optional generators"
npm run --if-present prisma generate

# Start Supabase only when the CLI exists and Docker is available
if npx supabase --version >/dev/null 2>&1; then
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "▶ Starting Supabase"
    if ! npx supabase start; then
      echo "⚠️  Failed to start Supabase; continuing without it" >&2
    fi
  else
    echo "⚠️  Docker is not running. Skipping Supabase start" >&2
  fi
fi

echo "▶ Running optional build"
if [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  npm run --if-present build
else
  echo "Skipping build: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
fi

echo "✅ Setup script finished"

