#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DB_URL="postgresql://..." ./scripts/apply.sh jobmaze

INSTANCE="${1:-}"
if [[ -z "$INSTANCE" ]]; then
  echo "Usage: DB_URL=\"...\" $0 <instance>"
  exit 1
fi

if [[ -z "${DB_URL:-}" ]]; then
  echo "ERROR: DB_URL is not set"
  exit 1
fi

DIR="db/${INSTANCE}/migrations"

if [[ ! -d "$DIR" ]]; then
  echo "ERROR: migrations directory not found: $DIR"
  exit 1
fi

echo "Applying migrations for: $INSTANCE"
echo "Directory: $DIR"

psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
create table if not exists public.schema_migrations (
  filename text primary key,
  applied_at timestamptz not null default now()
);
SQL

shopt -s nullglob
FILES=("$DIR"/*.sql)
if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No migrations found in $DIR"
  exit 0
fi

for f in "${FILES[@]}"; do
  base="$(basename "$f")"
  already="$(psql "$DB_URL" -Atc "select 1 from public.schema_migrations where filename='${base}' limit 1;")"
  if [[ "$already" == "1" ]]; then
    echo "SKIP  $base"
    continue
  fi

  echo "RUN   $base"
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$f"

  psql "$DB_URL" -v ON_ERROR_STOP=1 -c \
    "insert into public.schema_migrations(filename) values ('${base}')"
done

echo "Done ✅"
