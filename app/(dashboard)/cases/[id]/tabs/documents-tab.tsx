'use client';

import { FileText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import type { Database } from '@/lib/supabase/types';

type Doc = Database['public']['Tables']['documents']['Row'];
type CaseRow = Database['public']['Tables']['cases']['Row'];

const docTypeLabel: Record<string, string> = {
  complaint: '訴状',
  answer: '答弁書',
  brief: '準備書面',
  motion: '申立書',
  agreement: '和解案',
  other: 'その他',
};

export function DocumentsTab({
  caseId,
  documents,
  caseData,
}: {
  caseId: string;
  documents: Doc[];
  caseData: CaseRow;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('answer');
  const [prompt, setPrompt] = useState('');
  const [viewing, setViewing] = useState<Doc | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    const res = await fetch('/api/ai/document', {
      method: 'POST',
      body: JSON.stringify({ caseId, documentType: selectedType, instructions: prompt }),
      headers: { 'content-type': 'application/json' },
    });
    const body = await res.json();
    if (!res.ok) setError(body.error ?? '書面生成に失敗しました');
    setGenerating(false);
    setPrompt('');
    router.refresh();
  }

  if (viewing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={() => setViewing(null)}>
            ← 一覧に戻る
          </Button>
          <Badge variant="info">
            <FileText className="h-3 w-3" />
            {viewing.document_type ? docTypeLabel[viewing.document_type] : ''}
          </Badge>
        </div>
        <div className="bg-white border border-border rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-4">{viewing.title}</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
            {viewing.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4" />
          <h3 className="font-semibold">AIで書面ドラフト生成</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="docType">書面種別</Label>
            <Select
              id="docType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="answer">答弁書</option>
              <option value="brief">準備書面</option>
              <option value="complaint">訴状</option>
              <option value="motion">申立書</option>
              <option value="agreement">和解案</option>
              <option value="other">その他</option>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label htmlFor="prompt">指示・重点論点</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="例: 請求棄却を求める。契約不成立が最大の争点。甲第5号証に含まれる自白を強調してほしい。"
          />
        </div>
        {error && <p className="text-sm text-danger mb-3">{error}</p>}
        <Button onClick={generate} disabled={generating}>
          <Sparkles className="h-4 w-4" />
          {generating ? 'AI生成中（30秒程度）…' : 'ドラフト生成'}
        </Button>
        {!caseData.description && documents.length === 0 && (
          <p className="text-xs text-fg-muted mt-3">
            ヒント: 案件概要・証拠・タイムラインが充実しているほど質の高いドラフトが生成されます。
          </p>
        )}
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg bg-white">
            <p className="text-fg-muted text-sm">まだ書面がありません</p>
          </div>
        ) : (
          documents.map((d) => (
            <button
              type="button"
              key={d.id}
              onClick={() => setViewing(d)}
              className="w-full text-left bg-white border border-border rounded-lg p-5 hover:border-border-strong transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{d.title}</span>
                    {d.document_type && (
                      <Badge variant="neutral">{docTypeLabel[d.document_type]}</Badge>
                    )}
                    {d.ai_generated && (
                      <Badge variant="info">
                        <Sparkles className="h-3 w-3" /> AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-fg-muted">
                    更新: {new Date(d.updated_at).toLocaleString('ja-JP')}
                  </p>
                </div>
                <FileText className="h-4 w-4 text-fg-muted" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
