#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   VPS="root@66.116.206.132" KEEP=6 ./scripts/remote-weekly-full-backup-jobmaze.sh

VPS="${VPS:-}"
DB_CONTAINER="supabase-db"
DB_NAME="postgres"
DB_USER="postgres"

KEEP="${KEEP:-6}"

OUTDIR="db/jobmaze/backups"
mkdir -p "$OUTDIR"

# Clear, sortable timestamp
TS="$(date +%Y-%m-%d_%H-%M-%S)"
OUTFILE="${OUTDIR}/jobmaze_full_${TS}.dump"
TMPFILE="${OUTFILE}.tmp"

if [[ -z "$VPS" ]]; then
  echo "ERROR: VPS is not set. Example:"
  echo "  VPS=\"root@66.116.206.132\" KEEP=6 $0"
  exit 1
fi

echo "Creating FULL backup (schema+data) from $VPS ..."
echo "Output: $OUTFILE"

ssh "$VPS" "docker exec -i ${DB_CONTAINER} pg_dump -U ${DB_USER} -d ${DB_NAME} -Fc" > "$TMPFILE"

if [[ ! -s "$TMPFILE" ]]; then
  echo "ERROR: backup file is empty. Not rotating/deleting anything."
  rm -f "$TMPFILE"
  exit 1
fi

mv "$TMPFILE" "$OUTFILE"
echo "Backup created ✅"

echo "Rotating backups: keeping latest $KEEP files..."

# Count backups (newest first). If more than KEEP, delete the rest.
TOTAL="$(ls -1t "${OUTDIR}"/jobmaze_full_*.dump 2>/dev/null | wc -l | tr -d ' ')"

if [[ "$TOTAL" -le "$KEEP" ]]; then
  echo "No rotation needed (found $TOTAL backups)."
  exit 0
fi

# List files beyond KEEP and delete them
ls -1t "${OUTDIR}"/jobmaze_full_*.dump | tail -n +"$((KEEP + 1))" | while IFS= read -r f; do
  echo "Deleting old backup: $f"
  rm -f "$f"
done

echo "Rotation done ✅"
