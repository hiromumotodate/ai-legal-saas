# Deployment Checklist

本番デプロイまでの手順。上から順に実行。

## 1. Supabase セットアップ

- [ ] https://supabase.com で新規プロジェクト作成（リージョン: `ap-northeast-1` 推奨）
- [ ] Project Settings → API から以下をコピー:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon/public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（サーバー専用・公開禁止）
- [ ] SQL Editor で順番に実行:
  1. `supabase/migrations/0001_initial_schema.sql`
  2. `supabase/migrations/0002_rls_policies.sql`
  3. `supabase/migrations/0003_signup_trigger.sql`
- [ ] Authentication → Providers → Email を有効化
- [ ] Authentication → URL Configuration:
  - Site URL: `https://<本番URL>`
  - Redirect URLs: `https://<本番URL>/auth/callback`, `http://localhost:3000/auth/callback`
- [ ] 型再生成（任意）: `npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts`

## 2. Anthropic

- [ ] https://console.anthropic.com でAPIキー発行
- [ ] `ANTHROPIC_API_KEY` に設定
- [ ] Usage limits を設定（事故防止）

## 3. Stripe

- [ ] https://dashboard.stripe.com でアカウント
- [ ] Products → 2つのサブスク商品作成:
  - **Legal AI Starter** — 月額 ¥29,800 (JPY, recurring/month)
  - **Legal AI Pro** — 月額 ¥79,800 (JPY, recurring/month)
- [ ] 各商品の Price ID を `.env` にコピー:
  - `STRIPE_PRICE_STARTER=price_xxx`
  - `STRIPE_PRICE_PRO=price_xxx`
- [ ] API Keys から以下をコピー:
  - `Secret key` → `STRIPE_SECRET_KEY`
  - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Webhooks → エンドポイント追加:
  - URL: `https://<本番URL>/api/stripe/webhook`
  - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Signing secret → `STRIPE_WEBHOOK_SECRET`
- [ ] Customer Portal → Settings で解約・プラン変更を許可

## 4. Vercel デプロイ

- [ ] https://vercel.com/new でGitHubリポをimport
- [ ] Environment Variables に全て投入:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_PRICE_STARTER
  STRIPE_PRICE_PRO
  NEXT_PUBLIC_APP_URL            # https://<本番URL>
  ```
- [ ] Deploy → 完了後、本番URLをメモ
- [ ] Supabase の Site URL / Redirect URLs を本番URLに更新
- [ ] Stripe Webhook URL を本番URLに更新

## 5. 動作確認

- [ ] `https://<本番URL>/` でLP表示
- [ ] `/signup` でアカウント作成 → メール確認 → `/dashboard` にリダイレクト
- [ ] 新規案件作成
- [ ] 証拠を追加 → AI分析ボタンで要約生成
- [ ] タイムライン自動生成（AI）
- [ ] 書面ドラフト生成（AI）
- [ ] 判例検索（AI）
- [ ] 設定 → プラン申込 → Stripe Checkout → テストカード `4242 4242 4242 4242`
- [ ] Webhook で `organizations.plan` が更新されることを確認
- [ ] `/auth/signout` でログアウト

## 6. Post-Launch

- [ ] Vercel Analytics を有効化
- [ ] Sentry / LogSnag 等のエラー監視を追加（任意）
- [ ] `usage_events` テーブルを見てAI使用量をモニター
- [ ] Stripe Dashboard で MRR / 解約率を確認

## Rollback

```bash
# Vercel
vercel rollback

# Supabase
# → バックアップから復元（Project Settings → Database → Backups）
```

## 既存デモとの関係

- 既存GitHub Pagesのデモ: https://hiromumotodate.github.io/ai-legal-saas/
- このリポのルートはNext.jsアプリになったため、GitHub Pagesは配信しなくなる
- 必要ならGitHub Pages配信を `gh-pages` ブランチに移すか、Vercelの `/demo/index.html` に誘導する（リダイレクト設定例）:

```js
// next.config.ts
async redirects() {
  return [{ source: '/ai-legal-saas', destination: '/demo/', permanent: false }];
}
```
