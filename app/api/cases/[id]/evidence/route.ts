import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type EvidenceType = Database['public']['Tables']['evidence']['Row']['evidence_type'];
type SubmittedBy = Database['public']['Tables']['evidence']['Row']['submitted_by'];

const EVIDENCE_TYPES = ['contract', 'email', 'document', 'testimony', 'other'] as const;
const SUBMITTED_BY = ['us', 'opposing', 'court'] as const;

function parseEvidenceType(v: string | null): EvidenceType {
  if (!v) return null;
  return (EVIDENCE_TYPES as readonly string[]).includes(v) ? (v as EvidenceType) : null;
}
function parseSubmittedBy(v: string | null): SubmittedBy {
  if (!v) return null;
  return (SUBMITTED_BY as readonly string[]).includes(v) ? (v as SubmittedBy) : null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await context.params;
  const { org } = await requireOrg();
  const form = await request.formData();

  const label = (form.get('label') as string | null)?.trim();
  if (!label) return NextResponse.json({ error: 'ラベルは必須です' }, { status: 400 });

  const supabase = await createClient();

  const { data: caseRow } = await supabase.from('cases').select('id').eq('id', caseId).single();
  if (!caseRow) return NextResponse.json({ error: '案件が見つかりません' }, { status: 404 });

  const submittedAt = (form.get('submitted_at') as string | null) || null;

  const { data, error } = await supabase
    .from('evidence')
    .insert({
      case_id: caseId,
      organization_id: org.id,
      label,
      evidence_type: parseEvidenceType(form.get('evidence_type') as string | null),
      submitted_by: parseSubmittedBy(form.get('submitted_by') as string | null),
      submitted_at: submittedAt,
      content_text: (form.get('content_text') as string) || null,
    })
    .select('id')
    .single();

  if (error || !data)
    return NextResponse.json({ error: error?.message ?? 'failed' }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
