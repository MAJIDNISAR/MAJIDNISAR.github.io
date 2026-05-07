#!/bin/bash
# Performance build: minify CSS/JS and generate critical CSS inline
set -e
cd "$(dirname "$0")/.."

echo "=== Minifying CSS files ==="
for f in assets/css/*.css; do
  # Skip already-minified files
  if [[ "$f" == *".min.css" ]]; then
    echo "  skip (already min): $f"
    continue
  fi
  # Skip Jekyll-template CSS files (contain Liquid tags that minifier would destroy)
  if [[ "$f" == *"beautifuljekyll.css" ]] || [[ "$f" == *"staticman.css" ]]; then
    echo "  skip (Jekyll template): $f"
    continue
  fi
  ORIG=$(wc -c < "$f")
  npx cleancss -O2 -o "$f.tmp" "$f"
  mv "$f.tmp" "$f"
  NEW=$(wc -c < "$f")
  SAVED=$((ORIG - NEW))
  echo "  $f: ${ORIG}B → ${NEW}B (saved ${SAVED}B)"
done

echo ""
echo "=== Minifying JS files ==="
for f in assets/js/beautifuljekyll.js assets/js/modern-features.js assets/js/ui-enhancements.js assets/js/renaissance.js assets/js/margin-flow.js; do
  if [ -f "$f" ]; then
    ORIG=$(wc -c < "$f")
    npx terser "$f" --compress --mangle -o "$f.tmp"
    mv "$f.tmp" "$f"
    NEW=$(wc -c < "$f")
    SAVED=$((ORIG - NEW))
    echo "  $f: ${ORIG}B → ${NEW}B (saved ${SAVED}B)"
  fi
done

echo ""
echo "=== Generating critical CSS inline ==="
# Extract critical above-the-fold CSS for homepage
# This includes: CSS variables, basic resets, navbar, grid basics, reveal initial states, gateway hero
node scripts/generate-critical-css.js

echo ""
echo "=== Done ==="
echo "Total CSS files:" $(ls -1 assets/css/*.css | wc -l)
echo "Total CSS size:" $(cat assets/css/*.css | wc -c) "bytes"
echo "Total JS size:" $(cat assets/js/beautifuljekyll.js assets/js/modern-features.js assets/js/ui-enhancements.js assets/js/renaissance.js assets/js/margin-flow.js | wc -c) "bytes"
