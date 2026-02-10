#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   VPS="root@66-116-206-132" ./scripts/remote-apply-jobmaze.sh
#
# Applies all SQL files in db/jobmaze/migrations to the remote Supabase Postgres container.

VPS="${VPS:-}"
DB_CONTAINER="supabase-db"
DB_NAME="postgres"
DB_USER="postgres"
DIR="db/jobmaze/migrations"

if [[ -z "$VPS" ]]; then
  echo "ERROR: VPS is not set. Example:"
  echo "  VPS=\"root@66-116-206-132\" $0"
  exit 1
fi

if [[ ! -d "$DIR" ]]; then
  echo "ERROR: migrations directory not found: $DIR"
  exit 1
fi

echo "Applying JobMaze migrations to $VPS (container: $DB_CONTAINER)"

# Ensure migration tracker exists
ssh "$VPS" "docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1" <<'SQL'
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
  already="$(ssh "$VPS" "docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -Atc \"select 1 from public.schema_migrations where filename='${base}' limit 1;\"")"

  if [[ "$already" == "1" ]]; then
    echo "SKIP  $base"
    continue
  fi

  echo "RUN   $base"
  ssh "$VPS" "docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1" < "$f"

  ssh "$VPS" "docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1 -c \"insert into public.schema_migrations(filename) values ('${base}')\""
done

echo "Done ✅"
