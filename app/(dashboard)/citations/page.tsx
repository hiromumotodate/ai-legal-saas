import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type CitationWithCase = Database['public']['Tables']['citations']['Row'] & {
  cases: { title: string } | null;
};

export default async function CitationsIndexPage() {
  await requireOrg();
  const supabase = await createClient();
  const res = await supabase
    .from('citations')
    .select('*, cases(title)')
    .order('created_at', { ascending: false })
    .limit(50);
  const data = (res.data ?? []) as CitationWithCase[];

  return (
    <div className="flex-1 overflow-auto">
      <header className="h-16 border-b border-border bg-white px-8 flex items-center">
        <h1 className="text-base font-semibold">判例検索結果（横断）</h1>
      </header>
      <div className="p-8 max-w-5xl space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg bg-white">
            <p className="text-fg-muted text-sm">
              判例検索は案件ページから実行してください。検索結果がここに一覧表示されます。
            </p>
          </div>
        ) : (
          data.map((c) => (
            <div key={c.id} className="bg-white border border-border rounded-lg p-5">
              <div className="text-xs text-fg-muted mb-1">
                {(c.cases as { title: string } | null)?.title ?? '案件'}
              </div>
              <div className="text-xs font-mono text-fg-muted mb-2">
                {c.court} {c.case_number && `・ ${c.case_number}`}{' '}
                {c.date && `・ ${new Date(c.date).toLocaleDateString('ja-JP')}`}
              </div>
              <p className="text-sm">{c.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
