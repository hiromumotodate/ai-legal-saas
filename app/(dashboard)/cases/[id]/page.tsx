import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';
import { CaseTabs } from './case-tabs';

type CaseRow = Database['public']['Tables']['cases']['Row'];
type Evidence = Database['public']['Tables']['evidence']['Row'];
type Timeline = Database['public']['Tables']['timeline_events']['Row'];
type Doc = Database['public']['Tables']['documents']['Row'];
type Citation = Database['public']['Tables']['citations']['Row'];

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireOrg();
  const supabase = await createClient();

  const { data: caseDataRaw } = await supabase.from('cases').select('*').eq('id', id).single();
  const caseData = caseDataRaw as CaseRow | null;
  if (!caseData) notFound();

  const [evidenceRes, timelineRes, documentsRes, citationsRes] = await Promise.all([
    supabase
      .from('evidence')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('timeline_events')
      .select('*')
      .eq('case_id', id)
      .order('event_date', { ascending: true }),
    supabase
      .from('documents')
      .select('*')
      .eq('case_id', id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('citations')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="flex-1 overflow-auto">
      <header className="h-16 border-b border-border bg-white px-8 flex items-center gap-3">
        <Link href="/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold truncate">{caseData.title}</h1>
            <Badge variant={caseData.status === 'active' ? 'success' : 'neutral'}>
              {caseData.status === 'active' ? '進行中' : '終結'}
            </Badge>
          </div>
          <p className="text-xs text-fg-muted">
            {caseData.case_number ?? '事件番号未設定'} ・ {caseData.court_name ?? '裁判所未設定'}
          </p>
        </div>
      </header>

      <div className="p-8 max-w-7xl">
        <CaseTabs
          caseId={id}
          caseData={caseData}
          evidence={(evidenceRes.data ?? []) as Evidence[]}
          timeline={(timelineRes.data ?? []) as Timeline[]}
          documents={(documentsRes.data ?? []) as Doc[]}
          citations={(citationsRes.data ?? []) as Citation[]}
        />
      </div>
    </div>
  );
}
