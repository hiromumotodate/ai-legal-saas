import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const statusVariant: Record<string, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  closed: 'neutral',
  archived: 'warning',
};
const statusLabel: Record<string, string> = {
  active: '進行中',
  closed: '終結',
  archived: 'アーカイブ',
};

export default async function CasesPage() {
  await requireOrg();
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, case_number, client_name, status, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div className="flex-1 overflow-auto">
      <header className="h-16 border-b border-border bg-white px-8 flex items-center justify-between">
        <h1 className="text-base font-semibold">案件</h1>
        <Link href="/cases/new">
          <Button size="sm">新規案件</Button>
        </Link>
      </header>

      <div className="p-8 max-w-7xl">
        {!cases || cases.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-white">
            <p className="text-fg-muted mb-4">まだ案件がありません</p>
            <Link href="/cases/new">
              <Button>最初の案件を作成</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt border-b border-border text-xs text-fg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">事件名</th>
                  <th className="text-left px-4 py-3 font-medium">事件番号</th>
                  <th className="text-left px-4 py-3 font-medium">当事者</th>
                  <th className="text-left px-4 py-3 font-medium">状態</th>
                  <th className="text-left px-4 py-3 font-medium">更新日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/cases/${c.id}`} className="font-medium hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{c.case_number ?? '—'}</td>
                    <td className="px-4 py-3 text-fg-muted">{c.client_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[c.status] ?? 'neutral'}>
                        {statusLabel[c.status] ?? c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">
                      {new Date(c.updated_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
