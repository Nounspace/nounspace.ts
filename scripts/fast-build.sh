#!/usr/bin/env bash
# Ultra-fast build script for development

set -e

echo "🚀 Starting ultra-fast build..."

# Set environment variables for maximum speed
export NODE_OPTIONS="--max-old-space-size=8192"
export SKIP_ENV_VALIDATION=1
export NEXT_PRIVATE_SKIP_SIZE_LIMIT=1
export NEXT_TELEMETRY_DISABLED=1
export DISABLE_ESLINT_PLUGIN=true

# Skip type checking (run separately if needed)
export TSC_COMPILE_ON_ERROR=true

# Build with timing
time pnpm exec next build

echo "✅ Build completed!"
