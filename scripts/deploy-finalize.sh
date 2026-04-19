#!/usr/bin/env bash
# One-shot finalization after Supabase + keys are provided.
# Expects a .env.production.local file with all real values.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.production.local ]]; then
  echo "Error: .env.production.local not found"
  exit 1
fi

# Load env
set -a
source .env.production.local
set +a

echo "==> 1/5  Running Supabase migrations..."
for f in supabase/migrations/0001_initial_schema.sql supabase/migrations/0002_rls_policies.sql supabase/migrations/0003_signup_trigger.sql; do
  echo "  Applying $f"
  PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
    "postgresql://postgres.${SUPABASE_PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" \
    -f "$f"
done

echo "==> 2/5  Bootstrapping initial user..."
node scripts/bootstrap-user.mjs

echo "==> 3/5  Updating Vercel env vars..."
for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY ANTHROPIC_API_KEY STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY STRIPE_PRICE_STARTER STRIPE_PRICE_PRO NEXT_PUBLIC_APP_URL; do
  value="${!var:-}"
  if [[ -n "$value" ]]; then
    vercel env rm "$var" production --yes --scope hiromumotodates-projects 2>/dev/null || true
    echo "$value" | vercel env add "$var" production --scope hiromumotodates-projects
  fi
done

echo "==> 4/5  Redeploying to production..."
vercel --prod --scope hiromumotodates-projects --yes

echo "==> 5/5  Verifying login..."
sleep 5
curl -sSL -o /dev/null -w "LP: HTTP %{http_code}\n" "$NEXT_PUBLIC_APP_URL/"
curl -sSL -o /dev/null -w "Login: HTTP %{http_code}\n" "$NEXT_PUBLIC_APP_URL/login"

echo "✅ Done. Try logging in at $NEXT_PUBLIC_APP_URL/login"
