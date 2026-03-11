#!/bin/bash
set -e

cd "$(dirname "$0")/.."

VERSION=$(cat VERSION | tr -d '[:space:]')
echo "Building suno-assist v${VERSION} for Windows (amd64)..."

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && pnpm install && cd ..
fi

wails build -platform windows/amd64 \
  -ldflags "-X main.version=${VERSION}"

echo ""
echo "Build complete: build/bin/suno-assist.exe"
