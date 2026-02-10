#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DB_URL="postgresql://..." ./scripts/backup.sh jobmaze

INSTANCE="${1:-}"
if [[ -z "$INSTANCE" ]]; then
  echo "Usage: DB_URL=\"...\" $0 <instance>"
  exit 1
fi

if [[ -z "${DB_URL:-}" ]]; then
  echo "ERROR: DB_URL is not set"
  exit 1
fi

OUTDIR="db/${INSTANCE}/snapshots"
mkdir -p "$OUTDIR"

DATE="$(date +%Y%m%d_%H%M%S)"

echo "Exporting functions (RPCs) to $OUTDIR/functions_${DATE}.sql"
psql "$DB_URL" -v ON_ERROR_STOP=1 -At <<'SQL' > "${OUTDIR}/functions_${DATE}.sql"
select pg_get_functiondef(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public')
order by n.nspname, p.proname, pg_get_function_identity_arguments(p.oid);
SQL

echo "Exporting schema-only dump to $OUTDIR/schema_${DATE}.sql"
pg_dump --schema-only --no-owner --no-privileges "$DB_URL" > "${OUTDIR}/schema_${DATE}.sql"

echo "Done ✅"

