#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/nvttrong2511/travel-booking-design-studio.git"
IMPORT_LINE="@CLAUDE.design-studio.md"
TARGET_DIR="${1:-$(pwd)}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required." >&2
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: target directory does not exist: $TARGET_DIR" >&2
  exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo "Installing Travel Booking Design Studio into: $TARGET_DIR"
git clone --depth 1 "$REPO_URL" "$TMP_DIR/studio" >/dev/null 2>&1

mkdir -p "$TARGET_DIR/.claude"
rm -rf "$TARGET_DIR/.claude/agents" "$TARGET_DIR/.claude/commands" "$TARGET_DIR/.claude/rules"
cp -R "$TMP_DIR/studio/.claude/agents" "$TARGET_DIR/.claude/"
cp -R "$TMP_DIR/studio/.claude/commands" "$TARGET_DIR/.claude/"
cp -R "$TMP_DIR/studio/.claude/rules" "$TARGET_DIR/.claude/"

rm -rf "$TARGET_DIR/design-studio-docs" "$TARGET_DIR/design-studio-templates" "$TARGET_DIR/design-studio-checklists"
cp -R "$TMP_DIR/studio/docs" "$TARGET_DIR/design-studio-docs"
cp -R "$TMP_DIR/studio/templates" "$TARGET_DIR/design-studio-templates"
cp -R "$TMP_DIR/studio/checklists" "$TARGET_DIR/design-studio-checklists"
cp "$TMP_DIR/studio/CLAUDE.md" "$TARGET_DIR/CLAUDE.design-studio.md"

CLAUDE_FILE="$TARGET_DIR/CLAUDE.md"
if [ ! -f "$CLAUDE_FILE" ]; then
  printf '%s\n' "$IMPORT_LINE" > "$CLAUDE_FILE"
elif ! grep -Fxq "$IMPORT_LINE" "$CLAUDE_FILE"; then
  printf '\n%s\n' "$IMPORT_LINE" >> "$CLAUDE_FILE"
fi

echo
printf '%s\n' "Installation complete."
printf '%s\n' "Next steps:"
printf '%s\n' "  cd $TARGET_DIR"
printf '%s\n' "  claude"
printf '%s\n' "  Run /create-concept inside Claude Code"
