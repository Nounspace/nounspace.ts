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

# Enable pnpm through corepack if available
if command -v corepack >/dev/null 2>&1; then
  # Try to extract pnpm version from package.json packageManager field
  if [[ -f package.json ]] && command -v jq >/dev/null 2>&1; then
    PACKAGE_MANAGER=$(jq -r '.packageManager // empty' package.json 2>/dev/null || echo "")
    if [[ -n "$PACKAGE_MANAGER" ]] && [[ "$PACKAGE_MANAGER" =~ ^pnpm@[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
echo "▶ Installing JS dependencies"
if command -v pnpm >/dev/null 2>&1; then
  if ! pnpm install --frozen-lockfile; then
    echo "⚠️  pnpm install failed; continuing" >&2
  fi
else
  echo "ℹ️  pnpm not found; falling back to npm ci"
  if ! npm ci; then
    echo "⚠️  npm ci failed; continuing" >&2
  fi
fi
      else
        echo "⚠️  Failed to prepare $PACKAGE_MANAGER, falling back to default" >&2
        corepack enable pnpm
      fi
    else
      echo "▶ No valid packageManager field found, using default pnpm"
      corepack enable pnpm
    fi
  else
    # Fallback when jq is not available or package.json is missing
    echo "▶ jq not available or package.json missing, using default pnpm"
    corepack enable pnpm
  fi
fi

echo "▶ Installing JS dependencies"
if ! pnpm install; then
  echo "⚠️  Failed to install JS dependencies; continuing" >&2
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

