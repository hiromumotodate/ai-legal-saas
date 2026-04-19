# Legal AI — Design System

## Visual Theme

Minimal, legal-professional, trustworthy. Reference: Linear × Vercel × Apple HIG.
Serious enough for 弁護士 (lawyer) use, modern enough to feel different from existing legal tech (判例秘書, LegalForce).

## Product Name

**Legal AI** (English). 日本語表記「リーガルAI」は補助として使用可。ロゴは `Legal AI` ワードマーク中心。

## Color Palette

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Background | `bg` | `#ffffff` | ページ背景 |
| Surface | `surface` | `#fafafa` | カード・パネル |
| Surface Alt | `surface-alt` | `#f4f4f5` | ホバー背景 |
| Border | `border` | `#e4e4e7` | 標準ボーダー |
| Border Strong | `border-strong` | `#d4d4d8` | 強調ボーダー |
| Text | `fg` | `#09090b` | 本文 |
| Text Secondary | `fg-muted` | `#71717a` | 補助文・プレースホルダー |
| Accent | `accent` | `#0a0a0a` | Primary CTA（モノクロ基調） |
| Accent Hover | `accent-hover` | `#27272a` | Hover |
| Success | `success` | `#16a34a` | 成功状態 |
| Warning | `warning` | `#d97706` | 警告 |
| Danger | `danger` | `#dc2626` | 削除・危険操作 |
| Info | `info` | `#2563eb` | 情報・リンク |

Dark mode (Phase 2 実装):
- bg: `#0a0a0a`, surface: `#111113`, border: `#27272a`, fg: `#fafafa`

## Typography

- Font: `Inter` (UI) + `Noto Sans JP` (日本語) — Next.js next/font/google で読み込み
- Monospace: `JetBrains Mono`（判例引用・コード表示）

| Level | Size | Weight | Line-height | Usage |
|-------|------|--------|-------------|-------|
| Display | 48px | 600 | 1.1 | LP hero のみ |
| H1 | 32px | 600 | 1.2 | ページタイトル |
| H2 | 24px | 600 | 1.3 | セクション見出し |
| H3 | 20px | 600 | 1.4 | カード見出し |
| Body | 14px | 400 | 1.6 | 本文 |
| Body Large | 16px | 400 | 1.6 | LP本文・重要な説明 |
| Small | 12px | 400 | 1.5 | 注釈・メタ情報 |

## Component Stylings

### Button

- Primary: `bg-accent text-white h-10 px-4 rounded-md font-medium hover:bg-accent-hover transition-colors`
- Secondary: `bg-white border border-border text-fg h-10 px-4 rounded-md font-medium hover:bg-surface-alt transition-colors`
- Ghost: `text-fg h-10 px-3 rounded-md hover:bg-surface-alt transition-colors`
- Danger: `bg-danger text-white h-10 px-4 rounded-md hover:bg-red-700 transition-colors`

### Input

- `h-10 px-3 rounded-md border border-border bg-white text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent`

### Card

- `bg-white border border-border rounded-lg p-6`
- Hover state: `hover:border-border-strong transition-colors`

### Badge

- `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`
- Variants: neutral (gray), success, warning, danger, info

## Layout Principles

- Max width: 1280px (`max-w-7xl`) for dashboard, 1120px for marketing LP
- Side padding: `px-6 md:px-8`
- Vertical rhythm: section gaps are `py-16` (marketing) or `py-8` (app)
- Grid: 12-col on desktop, stacking on mobile
- Sidebar: 240px fixed

## Spacing Scale

Tailwind defaults (4px base). 常用: `2 / 3 / 4 / 6 / 8 / 12 / 16`. 奇数は使わない。

## Do's

- 余白を多めに取る（1要素あたり最低 `p-4`）
- モノクロ基調、アクセントは1色のみ
- 14pxベースで情報密度を高く（弁護士は情報量を求める）
- Iconは `lucide-react` のみ使用
- 状態遷移は 150ms ease-out

## Don'ts

- グラデーション（特に紫/青系）禁止 — AI slop 回避
- 複数のシャドウ重ね禁止（`shadow-sm` or `shadow` まで）
- border-radius ミックス禁止（全要素 `rounded-md` or `rounded-lg` に統一）
- 色の乱用（ステータス以外で色を使わない）
- 装飾アイコン・装飾イラスト禁止
- 自動再生アニメーション禁止（スケルトンローダーのみ例外）

## Motion

| Use case | Duration | Easing |
|----------|----------|--------|
| Hover | 150ms | ease-out |
| Modal | 200ms | ease-out (enter) |
| Page | 250ms | ease-in-out |
