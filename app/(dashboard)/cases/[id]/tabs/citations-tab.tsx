'use client';

import { BookOpen, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Database } from '@/lib/supabase/types';

type Citation = Database['public']['Tables']['citations']['Row'];
type CaseRow = Database['public']['Tables']['cases']['Row'];

export function CitationsTab({
  caseId,
  citations,
  caseData,
}: {
  caseId: string;
  citations: Citation[];
  caseData: CaseRow;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setSearching(true);
    setError(null);
    const res = await fetch('/api/ai/citations', {
      method: 'POST',
      body: JSON.stringify({ caseId, query: query || caseData.case_type || caseData.title }),
      headers: { 'content-type': 'application/json' },
    });
    const body = await res.json();
    if (!res.ok) setError(body.error ?? '検索に失敗しました');
    setSearching(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4" />
          <h3 className="font-semibold">AI判例検索</h3>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="検索クエリ（争点・キーワード）を入力。空の場合は案件から自動推論。"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') search();
            }}
          />
          <Button onClick={search} disabled={searching}>
            <Sparkles className="h-4 w-4" />
            {searching ? '検索中…' : '検索'}
          </Button>
        </div>
        {error && <p className="text-sm text-danger mt-3">{error}</p>}
        <p className="text-xs text-fg-muted mt-3">
          Claude
          AIが争点に関連する判例を提案します。実際の判例全文は裁判所Webサイト等でご確認ください。
        </p>
      </div>

      <div className="space-y-3">
        {citations.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg bg-white">
            <p className="text-fg-muted text-sm">まだ検索結果がありません</p>
          </div>
        ) : (
          citations.map((c) => (
            <div key={c.id} className="bg-white border border-border rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-fg-muted mb-1">
                    <span className="font-mono">{c.court}</span>
                    {c.case_number && <span>・{c.case_number}</span>}
                    {c.date && <span>・{new Date(c.date).toLocaleDateString('ja-JP')}</span>}
                  </div>
                  {c.summary && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.summary}</p>
                  )}
                  {c.ai_reasoning && (
                    <div className="mt-3 p-3 bg-surface border border-border rounded-md">
                      <div className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
                        <Sparkles className="h-3 w-3" /> 関連性の説明
                      </div>
                      <p className="text-sm text-fg-muted whitespace-pre-wrap">{c.ai_reasoning}</p>
                    </div>
                  )}
                </div>
                {c.relevance_score !== null && (
                  <div className="text-right shrink-0">
                    <div className="text-xs text-fg-muted">関連度</div>
                    <div className="font-mono text-sm font-semibold">
                      {(Number(c.relevance_score) * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
