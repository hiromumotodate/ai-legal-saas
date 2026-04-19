'use client';

import { Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import type { Database } from '@/lib/supabase/types';

type Event = Database['public']['Tables']['timeline_events']['Row'];

export function TimelineTab({
  caseId,
  events,
  evidenceCount,
}: {
  caseId: string;
  events: Event[];
  evidenceCount: number;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/cases/${caseId}/timeline`, {
      method: 'POST',
      body: new FormData(e.currentTarget),
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

  async function generate() {
    setGenerating(true);
    setError(null);
    const res = await fetch('/api/ai/timeline', {
      method: 'POST',
      body: JSON.stringify({ caseId }),
      headers: { 'content-type': 'application/json' },
    });
    const body = await res.json();
    if (!res.ok) setError(body.error ?? 'AI生成に失敗しました');
    setGenerating(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-fg-muted">イベント {events.length} 件</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={generate}
            disabled={generating || evidenceCount === 0}
            title={evidenceCount === 0 ? '証拠を先に登録してください' : ''}
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'AI生成中…' : 'AIで自動生成'}
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> 手動追加
          </Button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="event_date">日付 *</Label>
              <Input id="event_date" name="event_date" type="date" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="title">出来事 *</Label>
              <Input id="title" name="title" required />
            </div>
          </div>
          <div>
            <Label htmlFor="description">詳細</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '追加中…' : '追加'}
            </Button>
          </div>
        </form>
      )}

      {error && !showForm && <p className="text-sm text-danger">{error}</p>}

      {events.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-white">
          <p className="text-fg-muted text-sm">
            {evidenceCount === 0
              ? 'まず証拠タブから証拠を登録してください'
              : 'イベントがありません。「AIで自動生成」で証拠から時系列を作成できます'}
          </p>
        </div>
      ) : (
        <ol className="relative border-l border-border ml-3 space-y-4">
          {events.map((e) => (
            <li key={e.id} className="pl-6 relative">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
              <div className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-mono text-fg-muted mb-1">
                      {new Date(e.event_date).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="font-medium text-sm">{e.title}</div>
                    {e.description && (
                      <p className="text-sm text-fg-muted mt-1.5 whitespace-pre-wrap">
                        {e.description}
                      </p>
                    )}
                  </div>
                  {e.ai_generated && (
                    <Badge variant="info">
                      <Sparkles className="h-3 w-3" /> AI
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
