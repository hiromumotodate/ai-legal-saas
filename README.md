# Legal AI

弁護士のためのAIプラットフォーム。訴訟・証拠分析・書面作成・判例検索をAIで加速するSaaS。

## Stack

- Next.js 16 (App Router, Turbopack) + React 19.2 + TypeScript
- Supabase (Auth + Postgres + RLS + Storage)
- Anthropic Claude API (`claude-sonnet-4-6`)
- Stripe (Checkout + Customer Portal + Webhook)
- Tailwind CSS v4 + lucide-react
- Biome (format + lint)

## Local Dev

```bash
npm install
cp .env.example .env.local    # fill in keys
npm run dev                    # http://localhost:3000
```

## Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment.

### Supabase

1. Create project at https://supabase.com
2. Copy URL / anon key / service role key to `.env.local`
3. Run migrations in SQL editor (in order):
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_signup_trigger.sql`
4. (Optional) Regenerate types: `npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts`

### Stripe

1. Create 2 recurring prices (monthly): Starter ¥29,800, Pro ¥79,800
2. Copy price IDs to `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`
3. Webhook endpoint: `https://<app>/api/stripe/webhook`
   - Events: `customer.subscription.created/updated/deleted`

### Anthropic

Set `ANTHROPIC_API_KEY` from https://console.anthropic.com.

## Structure

```
app/
  (auth)/           - login, signup
  (dashboard)/      - authenticated app
  api/
    ai/             - 4 Claude endpoints (evidence/timeline/document/citations)
    cases/          - evidence + timeline mutations
    stripe/         - checkout, portal, webhook
    auth/           - callback, signout
components/
  ui/               - button, input, card, badge
  dashboard/        - sidebar
lib/
  supabase/         - client, server, types
  anthropic/        - Claude client + prompts
  stripe/           - Stripe client + plan mapping
  auth.ts           - requireOrg() helper
supabase/migrations - schema SQL
demo/index.html     - original PoC (preserved)
```
