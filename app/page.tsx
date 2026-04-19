import { ArrowRight, Check, FileText, Scale, Search, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <MarketingNav />
      <Hero />
      <Features />
      <Workflow />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}

function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1120px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Scale className="h-5 w-5" />
          <span>Legal AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-fg-muted">
          <a href="#features" className="hover:text-fg transition-colors">
            機能
          </a>
          <a href="#workflow" className="hover:text-fg transition-colors">
            使い方
          </a>
          <a href="#pricing" className="hover:text-fg transition-colors">
            料金
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              ログイン
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">無料で始める</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-[1120px] mx-auto px-6 md:px-8 pt-24 pb-20 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-fg-muted mb-6">
        <Sparkles className="h-3 w-3" /> Claude Sonnet 4.6 搭載
      </div>
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl mx-auto">
        弁護士業務を、AIで10倍速に。
      </h1>
      <p className="mt-6 text-lg text-fg-muted max-w-2xl mx-auto leading-relaxed">
        証拠分析、タイムライン生成、書面ドラフト、判例検索——訴訟の全工程をAIが支援します。
        <br className="hidden md:block" />
        個人事務所から大規模法人まで、1,000件超の事件処理で磨かれた実装。
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/signup">
          <Button size="lg" className="min-w-[200px]">
            14日間無料で試す <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href="#features">
          <Button variant="secondary" size="lg" className="min-w-[200px]">
            機能を見る
          </Button>
        </a>
      </div>
      <p className="mt-4 text-xs text-fg-muted">クレジットカード不要・いつでも解約可能</p>
    </section>
  );
}

const features = [
  {
    icon: FileText,
    title: '案件管理',
    desc: '事件番号・当事者・争点を一元管理。AIが重要な動きを自動でハイライト。',
  },
  {
    icon: Search,
    title: '証拠分析',
    desc: 'PDF・メール・契約書をアップロードすると、AIが要約と争点への影響を抽出。',
  },
  {
    icon: Timer,
    title: 'タイムライン生成',
    desc: '証拠と陳述書から時系列を自動生成。矛盾点をAIが検知して報告。',
  },
  {
    icon: FileText,
    title: '書面ドラフト',
    desc: '答弁書・準備書面・訴状をAIが起案。過去の主張とも矛盾しないチェック付き。',
  },
  {
    icon: Search,
    title: '判例検索',
    desc: '争点から類似判例を提示。裁判所・年月日・要旨・関連度スコアで並び替え。',
  },
  {
    icon: Sparkles,
    title: '訴訟シミュレーション',
    desc: '原告/被告/裁判官の3視点でAIが論理攻防を再現。弱点を事前に発見。',
  },
];

function Features() {
  return (
    <section id="features" className="max-w-[1120px] mx-auto px-6 md:px-8 py-20">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          訴訟の全工程を、1つのプラットフォームで。
        </h2>
        <p className="mt-4 text-fg-muted max-w-2xl mx-auto">
          証拠整理から書面作成まで。従来は数十時間かかる作業を、数分で。
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-lg border border-border bg-white hover:border-border-strong transition-colors"
          >
            <div className="h-10 w-10 rounded-md bg-surface-alt flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-fg-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    {
      n: '01',
      title: '案件を登録',
      desc: '事件名・当事者・争点を入力。既存の案件DBから取り込みも可能。',
    },
    {
      n: '02',
      title: '証拠をアップロード',
      desc: 'PDF・画像・メールをドラッグ&ドロップ。AIが自動で要約。',
    },
    {
      n: '03',
      title: 'AIに分析を依頼',
      desc: '争点抽出、タイムライン生成、書面ドラフト。ワンクリック。',
    },
    { n: '04', title: '書面を確定・提出', desc: '弁護士が最終確認。検索可能なPDFで出力・共有。' },
  ];
  return (
    <section id="workflow" className="bg-surface border-y border-border py-20">
      <div className="max-w-[1120px] mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-14">
          4ステップで、事件処理を完結。
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="text-xs font-mono text-fg-muted mb-3">{s.n}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: 'スターター',
    price: '¥29,800',
    period: '月額',
    desc: '個人弁護士・開業初年度向け',
    features: [
      '案件 10件まで',
      '証拠AI分析 月100件',
      '書面ドラフト生成 月30件',
      '判例検索 無制限',
      'メールサポート',
    ],
    cta: '無料で始める',
    highlight: false,
  },
  {
    name: 'プロフェッショナル',
    price: '¥79,800',
    period: '月額',
    desc: '中規模事務所・5名まで',
    features: [
      '案件 無制限',
      '証拠AI分析 無制限',
      '書面ドラフト生成 無制限',
      '訴訟シミュレーション',
      'チーム共有機能',
      '優先サポート',
    ],
    cta: '無料で始める',
    highlight: true,
  },
  {
    name: 'エンタープライズ',
    price: '要問合せ',
    period: '',
    desc: '大規模法人・上場企業顧問',
    features: [
      'プロフェッショナルの全機能',
      'SSO / SAML認証',
      '専用サーバー・オンプレ対応',
      'カスタム開発',
      '専任カスタマーサクセス',
    ],
    cta: 'お問い合わせ',
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="max-w-[1120px] mx-auto px-6 md:px-8 py-20">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">シンプルな料金体系</h2>
        <p className="mt-4 text-fg-muted">14日間の無料トライアル。クレジットカード登録不要。</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`p-8 rounded-lg border bg-white flex flex-col ${
              p.highlight ? 'border-accent border-2' : 'border-border'
            }`}
          >
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
              <p className="text-sm text-fg-muted">{p.desc}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
              {p.period && <span className="text-fg-muted ml-1">/ {p.period}</span>}
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href={p.name === 'エンタープライズ' ? 'mailto:sales@detect.co.jp' : '/signup'}>
              <Button variant={p.highlight ? 'primary' : 'secondary'} className="w-full">
                {p.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-accent text-white py-20">
      <div className="max-w-[1120px] mx-auto px-6 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
          訴訟業務を、次の世代へ。
        </h2>
        <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
          14日間、全機能を無料で。カード登録不要。
        </p>
        <Link href="/signup">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-accent hover:bg-surface-alt"
          >
            無料で始める <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-[1120px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-fg-muted">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span>© 2026 detect Inc. — Legal AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/demo/" className="hover:text-fg transition-colors">
            デモ
          </a>
          <a href="mailto:hello@detect.co.jp" className="hover:text-fg transition-colors">
            お問合せ
          </a>
          <Link href="/privacy" className="hover:text-fg transition-colors">
            プライバシー
          </Link>
          <Link href="/terms" className="hover:text-fg transition-colors">
            利用規約
          </Link>
        </div>
      </div>
    </footer>
  );
}
