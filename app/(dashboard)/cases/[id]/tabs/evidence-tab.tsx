'use client';

import { Sparkles, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import type { Database } from '@/lib/supabase/types';

type Evidence = Database['public']['Tables']['evidence']['Row'];

export function EvidenceTab({ caseId, items }: { caseId: string; items: Evidence[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(items.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? '作成に失敗しました');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setShowForm(false);
    router.refresh();
  }

  async function analyze(evidenceId: string) {
    setAnalyzingId(evidenceId);
    setError(null);
    const res = await fetch('/api/ai/evidence', {
      method: 'POST',
      body: JSON.stringify({ evidenceId }),
      headers: { 'content-type': 'application/json' },
    });
    const body = await res.json();
    if (!res.ok) setError(body.error ?? 'AI分析に失敗しました');
    setAnalyzingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-fg-muted">証拠 {items.length} 件</p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Upload className="h-4 w-4" /> 証拠を追加
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="label">ラベル（例: 甲1号証）*</Label>
              <Input id="label" name="label" required />
            </div>
            <div>
              <Label htmlFor="evidence_type">種別</Label>
              <Select id="evidence_type" name="evidence_type">
                <option value="">選択</option>
                <option value="contract">契約書</option>
                <option value="email">メール</option>
                <option value="document">文書</option>
                <option value="testimony">陳述書</option>
                <option value="other">その他</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="submitted_by">提出者</Label>
              <Select id="submitted_by" name="submitted_by">
                <option value="">選択</option>
                <option value="us">当方</option>
                <option value="opposing">相手方</option>
                <option value="court">裁判所</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="submitted_at">提出日</Label>
              <Input id="submitted_at" name="submitted_at" type="date" />
            </div>
          </div>
          <div>
            <Label htmlFor="content_text">本文・要旨（AI分析対象）</Label>
            <Textarea
              id="content_text"
              name="content_text"
              rows={6}
              placeholder="証拠の本文を貼り付け、または要旨を記入してください。AIがこの内容を分析します。"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '登録中…' : '登録'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="bg-white border border-border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm">{e.label}</span>
                  {e.evidence_type && <Badge variant="neutral">{typeLabel(e.evidence_type)}</Badge>}
                  {e.submitted_by && (
                    <Badge variant={e.submitted_by === 'us' ? 'info' : 'warning'}>
                      {submittedByLabel(e.submitted_by)}
                    </Badge>
                  )}
                </div>
                {e.submitted_at && (
                  <p className="text-xs text-fg-muted">
                    提出日: {new Date(e.submitted_at).toLocaleDateString('ja-JP')}
                  </p>
                )}
                {e.content_text && (
                  <p className="text-sm text-fg-muted mt-2 line-clamp-3 whitespace-pre-wrap">
                    {e.content_text}
                  </p>
                )}
                {e.ai_summary ? (
                  <div className="mt-3 p-3 bg-surface border border-border rounded-md">
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-1.5">
                      <Sparkles className="h-3 w-3" /> AI分析
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{e.ai_summary}</p>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={() => analyze(e.id)}
                    disabled={analyzingId === e.id || !e.content_text}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {analyzingId === e.id ? 'AI分析中…' : 'AIで分析'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function typeLabel(t: string) {
  return (
    { contract: '契約書', email: 'メール', document: '文書', testimony: '陳述書', other: 'その他' }[
      t
    ] ?? t
  );
}
function submittedByLabel(s: string) {
  return ({ us: '当方', opposing: '相手方', court: '裁判所' }[s] ?? s) as string;
}
