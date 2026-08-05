#!/usr/bin/env bash
# Diffs every commit since a baseline against the current HEAD (or a given ref)
# and flags commits touching security-sensitive paths, so a human can review
# who changed what without reading the full git log by hand.
#
# Usage: scripts/audit-since-baseline.sh [baseline-ref] [head-ref]
# Defaults: baseline-ref = contents of BASELINE file (falls back to first commit),
#           head-ref = HEAD
set -euo pipefail
cd "$(dirname "$0")/.."

BASELINE="${1:-$(cat BASELINE 2>/dev/null || git rev-list --max-parents=0 HEAD)}"
HEAD_REF="${2:-HEAD}"

# ponytail: naive substring match on path, not a real taint/dataflow check. Good enough for a
# human reviewer triage pass; upgrade to per-line diff analysis if false negatives matter.
SENSITIVE_PATTERN='^(server\.ts|server/|src/api\.ts|\.env|package\.json|package-lock\.json)'

echo "Auditing commits from $BASELINE to $HEAD_REF"
echo "================================================"

commits=$(git log --reverse --pretty=format:'%H' "$BASELINE..$HEAD_REF")

if [ -z "$commits" ]; then
  echo "No commits since baseline."
  exit 0
fi

flagged=0
total=0

while IFS= read -r sha; do
  total=$((total + 1))
  author=$(git log -1 --pretty=format:'%an <%ae>' "$sha")
  date=$(git log -1 --pretty=format:'%ad' --date=iso "$sha")
  subject=$(git log -1 --pretty=format:'%s' "$sha")
  files=$(git show --pretty=format: --name-only "$sha" | sed '/^$/d')

  sensitive_hits=$(echo "$files" | grep -E "$SENSITIVE_PATTERN" || true)

  echo ""
  echo "commit $sha"
  echo "  author:  $author"
  echo "  date:    $date"
  echo "  subject: $subject"
  echo "  files:"
  echo "$files" | sed 's/^/    - /'

  if [ -n "$sensitive_hits" ]; then
    flagged=$((flagged + 1))
    echo "  ⚠ FLAGGED: touches security-sensitive path(s):"
    echo "$sensitive_hits" | sed 's/^/      /'
  fi
done <<< "$commits"

echo ""
echo "================================================"
echo "$total commit(s) reviewed, $flagged flagged for security-sensitive changes."
