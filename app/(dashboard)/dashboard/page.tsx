import { ArrowRight, FileText, FolderKanban, Timer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const { profile, org } = await requireOrg();
  const supabase = await createClient();

  const [{ count: caseCount }, { count: evidenceCount }, { count: docCount }] = await Promise.all([
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('evidence').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
  ]);

  const { data: recentCases } = await supabase
    .from('cases')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  return (
    <div className="flex-1 overflow-auto">
      <header className="h-16 border-b border-border bg-white px-8 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">ダッシュボード</h1>
          <p className="text-xs text-fg-muted">{org.name}</p>
        </div>
        <Link href="/cases/new">
          <Button size="sm">新規案件</Button>
        </Link>
      </header>

      <div className="p-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            おかえりなさい、{profile.full_name ?? ''}さん
          </h2>
          <p className="text-fg-muted text-sm">
            {org.plan === 'trial' &&
              `無料トライアル中 — ${org.trial_ends_at ? new Date(org.trial_ends_at).toLocaleDateString('ja-JP') : ''}まで`}
            {org.plan !== 'trial' && `プラン: ${planLabel(org.plan)}`}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={FolderKanban} label="案件数" value={caseCount ?? 0} href="/cases" />
          <StatCard icon={FileText} label="証拠" value={evidenceCount ?? 0} />
          <StatCard icon={Timer} label="書面" value={docCount ?? 0} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>最近の案件</CardTitle>
            <CardDescription>直近更新された案件</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCases && recentCases.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentCases.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/cases/${c.id}`}
                      className="flex items-center justify-between py-3 hover:bg-surface-alt -mx-2 px-2 rounded-md transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm">{c.title}</div>
                        <div className="text-xs text-fg-muted">
                          更新: {new Date(c.updated_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-fg-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-fg-muted text-sm mb-4">まだ案件がありません</p>
                <Link href="/cases/new">
                  <Button size="sm">最初の案件を作成</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="p-6 rounded-lg border border-border bg-white hover:border-border-strong transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-fg-muted">{label}</span>
        <Icon className="h-4 w-4 text-fg-muted" />
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function planLabel(plan: string) {
  return (
    {
      trial: '無料トライアル',
      starter: 'スターター',
      pro: 'プロフェッショナル',
      enterprise: 'エンタープライズ',
    }[plan] ?? plan
  );
}
