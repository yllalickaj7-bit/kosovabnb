#!/usr/bin/env bash
# Teste regresioni për bazën: krijon një bazë të përkohshme, aplikon migrimet mbi një stub të `auth`, ekzekuton regression.sql.
# Përdorim: supabase/tests/run.sh   (kërkon PostgreSQL 14+ me psql në PATH; DATABASE_URL opsional për serverin ekzistues)
set -euo pipefail
cd "$(dirname "$0")/../.."
PSQL=${PSQL:-psql}
DB=${TEST_DB:-kbnb_regression}
BASE=${DATABASE_URL_ADMIN:-}   # p.sh. postgresql://postgres@localhost:5432/postgres
if [ -n "$BASE" ]; then ADMIN=("$PSQL" "$BASE" -v ON_ERROR_STOP=1 -q); else ADMIN=("$PSQL" -d postgres -v ON_ERROR_STOP=1 -q); fi
"${ADMIN[@]}" -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB"
if [ -n "$BASE" ]; then T=("$PSQL" "${BASE%/*}/$DB" -v ON_ERROR_STOP=1 -q); else T=("$PSQL" -d "$DB" -v ON_ERROR_STOP=1 -q); fi
"${T[@]}" -f supabase/tests/stub.sql
for f in supabase/migrations/*.sql; do "${T[@]}" -f "$f" >/dev/null; done
"${T[@]}" -f supabase/tests/regression.sql
"${ADMIN[@]}" -c "DROP DATABASE $DB"
echo "TË GJITHA TESTET SQL KALUAN"
