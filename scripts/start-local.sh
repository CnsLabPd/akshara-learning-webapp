#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/python_backend"
VENV_DIR="$BACKEND_DIR/akshara-code-env"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

log() {
  printf '[akshara-local] %s\n' "$*"
}

find_python() {
  for candidate in python3.11 python3.10 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
      version="$("$candidate" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
      case "$version" in
        3.10|3.11)
          printf '%s\n' "$candidate"
          return 0
          ;;
      esac
    fi
  done

  return 1
}

PYTHON_BIN="$(find_python || true)"
if [[ -z "$PYTHON_BIN" ]]; then
  cat >&2 <<'EOF'
Could not find Python 3.10 or 3.11.

The speech backend pins tensorflow-cpu==2.15.0, which is not expected to install
cleanly on Python 3.14. Install Python 3.10 or 3.11, then rerun this script.
EOF
  exit 1
fi

cleanup() {
  log "Stopping local servers..."
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

cd "$ROOT_DIR"

if [[ ! -d node_modules ]]; then
  log "Installing frontend dependencies..."
  npm install
fi

if [[ ! -d "$VENV_DIR" ]]; then
  log "Creating Python virtual environment with $PYTHON_BIN..."
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

if "$VENV_DIR/bin/python" -c 'import fastapi, uvicorn, mangum, numpy, pydantic, tensorflow, h5py, librosa, scipy, numba, llvmlite, soundfile, sklearn, soxr' >/dev/null 2>&1; then
  log "Python backend dependencies already installed."
else
  log "Installing Python backend dependencies..."
  REQUIREMENTS_FILE="$BACKEND_DIR/requirements.txt"
  if [[ "$(uname -s)" == "Darwin" && "$(uname -m)" == "arm64" ]]; then
    REQUIREMENTS_FILE="$(mktemp "${TMPDIR:-/tmp}/akshara-requirements.XXXXXX.txt")"
    sed 's/^tensorflow-cpu==2\.15\.0$/tensorflow==2.15.0/' \
      "$BACKEND_DIR/requirements.txt" > "$REQUIREMENTS_FILE"
  fi
  "$VENV_DIR/bin/python" -m pip install -r "$REQUIREMENTS_FILE"
fi

log "Starting speech backend on http://localhost:$BACKEND_PORT"
(
  cd "$BACKEND_DIR"
  MODEL_PATH="$BACKEND_DIR/models/kfold_i_identify_phonemes.weights.h5" \
    "$VENV_DIR/bin/python" -m uvicorn server:app --host 127.0.0.1 --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

log "Starting frontend on http://localhost:$FRONTEND_PORT"
SPEECH_API_URL="http://localhost:$BACKEND_PORT" \
  npm run dev -- --hostname 127.0.0.1 --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

log "Servers started. Press Ctrl+C to stop both."
wait "$BACKEND_PID" "$FRONTEND_PID"
