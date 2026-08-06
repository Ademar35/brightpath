#!/usr/bin/env bash
# Prepares the Codespace: starts Postgres, writes .env, installs deps, seeds the database.
set -euo pipefail

echo "Starting PostgreSQL..."
sudo service postgresql start
sleep 3

echo "Creating the brightpath database..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='brightpath';" | grep -q 1 \
  || sudo -u postgres createdb brightpath

if [ ! -f .env ]; then
  echo "Writing .env..."
  cat > .env <<'ENVFILE'
# Local Postgres running inside this Codespace.
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brightpath"

# Paste your Anthropic API key between the quotes to enable the AI study buddies.
# Without it the chat shows a friendly fallback message and everything else works.
ANTHROPIC_API_KEY=""
ENVFILE
fi

echo "Installing dependencies..."
npm install

echo "Setting up the database schema..."
npx prisma db push --skip-generate

echo "Seeding..."
npm run db:seed || echo "Seed skipped or already applied."

echo ""
echo "Ready. Run 'npm run dev' and open the forwarded port 3000."
