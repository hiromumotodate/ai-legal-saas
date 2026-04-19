'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function PlanSelector({
  currentPlan,
  hasSubscription,
}: {
  currentPlan: string;
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: 'starter' | 'pro') {
    setLoading(plan);
    setError(null);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
      headers: { 'content-type': 'application/json' },
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? '失敗しました');
      setLoading(null);
      return;
    }
    window.location.href = body.url;
  }

  async function openPortal() {
    setLoading('portal');
    setError(null);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? '失敗しました');
      setLoading(null);
      return;
    }
    window.location.href = body.url;
  }

  if (hasSubscription) {
    return (
      <div className="space-y-3">
        <Button onClick={openPortal} disabled={loading !== null} variant="secondary">
          {loading === 'portal' ? 'リダイレクト中…' : '請求情報・プラン変更'}
        </Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border rounded-lg p-4">
          <div className="text-sm font-medium">スターター</div>
          <div className="text-2xl font-semibold tracking-tight my-2">¥29,800</div>
          <div className="text-xs text-fg-muted mb-3">/ 月額</div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => subscribe('starter')}
            disabled={loading !== null || currentPlan === 'starter'}
          >
            {loading === 'starter' ? 'リダイレクト中…' : 'スターターに申込'}
          </Button>
        </div>
        <div className="border border-accent border-2 rounded-lg p-4">
          <div className="text-sm font-medium">プロフェッショナル</div>
          <div className="text-2xl font-semibold tracking-tight my-2">¥79,800</div>
          <div className="text-xs text-fg-muted mb-3">/ 月額</div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => subscribe('pro')}
            disabled={loading !== null || currentPlan === 'pro'}
          >
            {loading === 'pro' ? 'リダイレクト中…' : 'プロに申込'}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs text-fg-muted">
        14日間の無料トライアル付き。エンタープライズプランは
        <a className="underline ml-1" href="mailto:sales@detect.co.jp">
          sales@detect.co.jp
        </a>
        までご連絡ください。
      </p>
    </div>
  );
}
