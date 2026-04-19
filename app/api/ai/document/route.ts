import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runClaude } from '@/lib/anthropic/client';
import { DOCUMENT_SYSTEM, DOCUMENT_USER } from '@/lib/anthropic/prompts';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  caseId: z.string().uuid(),
  documentType: z.enum(['complaint', 'answer', 'brief', 'motion', 'agreement', 'other']),
  instructions: z.string().max(2000).optional().default(''),
});

const docTypeLabel: Record<string, string> = {
  complaint: '訴状',
  answer: '答弁書',
  brief: '準備書面',
  motion: '申立書',
  agreement: '和解案',
  other: 'その他の書面',
};

export async function POST(request: Request) {
  const { org, profile } = await requireOrg();
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const supabase = await createClient();
  const { data: caseRow } = await supabase
    .from('cases')
    .select('*')
    .eq('id', body.data.caseId)
    .single();
  if (!caseRow) return NextResponse.json({ error: 'case not found' }, { status: 404 });

  const [{ data: evidence }, { data: timeline }] = await Promise.all([
    supabase
      .from('evidence')
      .select('label, ai_summary, content_text')
      .eq('case_id', body.data.caseId)
      .limit(20),
    supabase
      .from('timeline_events')
      .select('event_date, title, description')
      .eq('case_id', body.data.caseId)
      .order('event_date', { ascending: true })
      .limit(30),
  ]);

  const label = docTypeLabel[body.data.documentType];

  try {
    const run = await runClaude({
      system: DOCUMENT_SYSTEM,
      user: DOCUMENT_USER({
        caseTitle: caseRow.title,
        caseType: caseRow.case_type,
        side: caseRow.side,
        documentType: label,
        description: caseRow.description,
        instructions: body.data.instructions,
        evidence: (evidence ?? []).map((e) => ({
          label: e.label,
          summary: e.ai_summary,
          content: e.content_text,
        })),
        timeline: (timeline ?? []).map((t) => ({
          event_date: t.event_date,
          title: t.title,
          description: t.description,
        })),
      }),
      maxTokens: 8000,
    });

    const { data: created, error: insertErr } = await supabase
      .from('documents')
      .insert({
        case_id: body.data.caseId,
        organization_id: org.id,
        title: `${label}ドラフト — ${new Date().toLocaleString('ja-JP')}`,
        document_type: body.data.documentType,
        content: run.text,
        ai_generated: true,
        created_by: profile.id,
      })
      .select('id')
      .single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    await supabase.from('usage_events').insert({
      organization_id: org.id,
      user_id: profile.id,
      feature: 'document_generation',
      tokens_input: run.inputTokens,
      tokens_output: run.outputTokens,
    });

    return NextResponse.json({ id: created?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
