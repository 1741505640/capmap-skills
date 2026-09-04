#!/usr/bin/env bash
# Copy capmap-skills into a host git repo (.agents/skills + optional extras).
set -euo pipefail

WITH_EXTRAS=0
WITH_EXAMPLE=0
TARGET=""

usage() {
  echo "Usage: $0 [--with-extras] [--with-example-config] <target-repo>"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-extras) WITH_EXTRAS=1; shift ;;
    --with-example-config) WITH_EXAMPLE=1; shift ;;
    -h|--help) usage ;;
    *) TARGET="$1"; shift ;;
  esac
done

[[ -n "$TARGET" ]] || usage
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$(cd "$TARGET" && pwd)"
SKILLS_DST="$TARGET/.agents/skills"
mkdir -p "$SKILLS_DST"

for d in "$ROOT"/skills/capmap-*; do
  name="$(basename "$d")"
  rm -rf "$SKILLS_DST/$name"
  cp -R "$d" "$SKILLS_DST/$name"
  echo "installed $name"
done

if [[ "$WITH_EXTRAS" -eq 1 ]]; then
  mkdir -p "$TARGET/.github/workflows" "$TARGET/.cursor/rules"
  cp "$ROOT/install/github-workflows/capmap-lint.yml" "$TARGET/.github/workflows/"
  cp "$ROOT/install/cursor-rules/capmap-status-no-skip.mdc" "$TARGET/.cursor/rules/"
  echo "installed workflow + cursor rule"
fi

if [[ "$WITH_EXAMPLE" -eq 1 ]]; then
  cfg="$SKILLS_DST/capmap-system/capmap.yaml"
  if [[ ! -f "$cfg" ]]; then
    cp "$ROOT/examples/capmap.yaml" "$cfg"
    echo "wrote example capmap.yaml (edit docs_root)"
  else
    echo "skip capmap.yaml (already exists)"
  fi
fi

echo "done. Next: run capmap-init in the target repo (or edit capmap.yaml)."
