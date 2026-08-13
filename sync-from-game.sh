#!/usr/bin/env bash
# Re-sync index.html (and its assets) from the real game repo.
#
# This shell exists to mirror the game's menu, so its index.html goes stale
# every time the real one moves. Rather than hand-editing, regenerate: copy
# the real file and re-apply the only two changes this repo makes.
#
#   1. Google Fonts <link>  ->  local @font-face on public/fonts
#   2. <script src="/src/main.ts">  ->  <script src="/src/ui.js">
#
# Only runs on the box that has the game repo. Bolt just consumes the result.
#
# Usage: ./sync-from-game.sh [path-to-game-repo]     (default /home/memres/fps)
set -euo pipefail

GAME="${1:-/home/memres/fps}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$GAME/web/index.html"

[ -f "$SRC" ] || { echo "no index.html at $SRC" >&2; exit 1; }

python3 - "$SRC" "$HERE/index.html" <<'PY'
import pathlib, re, sys
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
s = src.read_text()

FONT_OLD = re.compile(
    r'[ \t]*<link rel="preconnect" href="https://fonts\.googleapis\.com" />\n'
    r'[ \t]*<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin />\n'
    r'[ \t]*<link\s*\n\s*href="https://fonts\.googleapis\.com/css2\?family=Rajdhani[^"]*"\s*\n\s*rel="stylesheet"\s*\n\s*/>\n'
)
FONT_NEW = '''    <!-- Rajdhani vendored locally (latin subset). This build must not reach
         the network for anything, so no Google Fonts link. -->
    <style>
      @font-face { font-family: "Rajdhani"; font-style: normal; font-weight: 500;
        font-display: swap; src: url("/fonts/rajdhani-500.woff2") format("woff2"); }
      @font-face { font-family: "Rajdhani"; font-style: normal; font-weight: 600;
        font-display: swap; src: url("/fonts/rajdhani-600.woff2") format("woff2"); }
      @font-face { font-family: "Rajdhani"; font-style: normal; font-weight: 700;
        font-display: swap; src: url("/fonts/rajdhani-700.woff2") format("woff2"); }
    </style>
'''
s, n = FONT_OLD.subn(FONT_NEW, s, count=1)
if not n:
    # Already-vendored source, or the block moved. Fail loudly rather than
    # silently shipping a build that phones Google on every load.
    if "fonts.googleapis.com" in s:
        sys.exit("FAIL: Google Fonts link present but did not match the expected block")

BOOT_OLD = '<script type="module" src="/src/main.ts"></script>'
BOOT_NEW = '<script type="module" src="/src/ui.js"></script>'
if BOOT_OLD in s:
    s = s.replace(BOOT_OLD, BOOT_NEW, 1)
elif BOOT_NEW not in s:
    sys.exit("FAIL: no main.ts script tag found and no ui.js tag either")

out = re.findall(r'https?://[^"\'\s)]+', s)
if out:
    sys.exit(f"FAIL: outbound URLs remain: {sorted(set(out))}")

dst.write_text(s)
print(f"index.html synced ({len(s)} bytes), no outbound URLs")
PY

# Copy across any asset the markup references that we don't already have.
missing=0
while read -r p; do
  [ -n "$p" ] || continue
  [ -f "$HERE/public$p" ] && continue
  if [ -f "$GAME/web/public$p" ]; then
    mkdir -p "$(dirname "$HERE/public$p")"
    cp "$GAME/web/public$p" "$HERE/public$p"
    echo "  + added public$p"
  else
    echo "  ! referenced but missing in game repo: $p"; missing=1
  fi
done < <(grep -oE '(url\(|src=|href=)["'"'"']?/[a-zA-Z0-9_./-]+' "$HERE/index.html" \
         | sed -E 's/^(url\(|src=|href=)["'"'"']?//' \
         | grep -vE '^/(src|fonts)/' | sort -u)

echo "done. review with: git -C \"$HERE\" diff --stat"
exit $missing
