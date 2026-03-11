#!/bin/bash
set -e

cd "$(dirname "$0")/.."

VERSION=$(cat VERSION | tr -d '[:space:]')
echo "Building suno-assist v${VERSION} NSIS installer for Windows (amd64)..."

if ! command -v makensis &> /dev/null; then
  echo "Error: makensis not found. Install with: brew install makensis"
  exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd frontend && pnpm install && cd ..
fi

wails build -platform windows/amd64 -nsis \
  -ldflags "-X main.version=${VERSION}"

echo ""
echo "Build complete: build/bin/suno-assist-amd64-installer.exe"
