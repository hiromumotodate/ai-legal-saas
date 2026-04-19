import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await context.params;
  const { org } = await requireOrg();
  const form = await request.formData();

  const event_date = (form.get('event_date') as string | null)?.trim();
  const title = (form.get('title') as string | null)?.trim();
  if (!event_date || !title) {
    return NextResponse.json({ error: '日付とタイトルは必須です' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('timeline_events').insert({
    case_id: caseId,
    organization_id: org.id,
    event_date,
    title,
    description: (form.get('description') as string) || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
