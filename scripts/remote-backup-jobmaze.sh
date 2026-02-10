#!/usr/bin/env bash
set -euo pipefail

VPS="${VPS:-}"
DB_CONTAINER="supabase-db"
DB_NAME="postgres"
DB_USER="postgres"

OUTDIR="db/jobmaze/snapshots"
mkdir -p "$OUTDIR"
DATE="$(date +%Y%m%d_%H%M%S)"

if [[ -z "$VPS" ]]; then
  echo "ERROR: VPS is not set. Example:"
  echo "  VPS=\"root@66.116.206.132\" $0"
  exit 1
fi

echo "Exporting all public functions from $VPS..."

ssh "$VPS" "docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -At -v ON_ERROR_STOP=1" <<'SQL' \
> "${OUTDIR}/functions_${DATE}.sql"
select pg_get_functiondef(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname, pg_get_function_identity_arguments(p.oid);
SQL

echo "Saved: ${OUTDIR}/functions_${DATE}.sql ✅"
