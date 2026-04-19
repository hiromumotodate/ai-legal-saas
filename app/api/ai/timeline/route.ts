import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runClaude } from '@/lib/anthropic/client';
import { TIMELINE_SYSTEM, TIMELINE_USER } from '@/lib/anthropic/prompts';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({ caseId: z.string().uuid() });

const eventSchema = z.object({
  event_date: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

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

  const { data: evidence } = await supabase
    .from('evidence')
    .select('label, content_text, submitted_at')
    .eq('case_id', body.data.caseId)
    .not('content_text', 'is', null)
    .limit(40);

  if (!evidence || evidence.length === 0) {
    return NextResponse.json({ error: '証拠が未登録です' }, { status: 400 });
  }

  try {
    const run = await runClaude({
      system: TIMELINE_SYSTEM,
      user: TIMELINE_USER({
        caseTitle: caseRow.title,
        caseType: caseRow.case_type,
        evidence: evidence.map((e) => ({
          label: e.label,
          content: e.content_text ?? '',
          submitted_at: e.submitted_at,
        })),
      }),
      maxTokens: 3000,
    });

    const jsonStart = run.text.indexOf('[');
    const jsonEnd = run.text.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
    }
    const raw = JSON.parse(run.text.slice(jsonStart, jsonEnd + 1)) as unknown;
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: 'AI応答の形式が不正です' }, { status: 500 });
    }

    const events = raw.flatMap((item) => {
      const r = eventSchema.safeParse(item);
      return r.success ? [r.data] : [];
    });

    if (events.length === 0) {
      return NextResponse.json({ error: 'タイムラインを抽出できませんでした' }, { status: 500 });
    }

    // Replace AI-generated events (keep manual ones)
    await supabase
      .from('timeline_events')
      .delete()
      .eq('case_id', body.data.caseId)
      .eq('ai_generated', true);

    await supabase.from('timeline_events').insert(
      events.map((e) => ({
        case_id: body.data.caseId,
        organization_id: org.id,
        event_date: e.event_date,
        title: e.title,
        description: e.description ?? null,
        ai_generated: true,
      })),
    );

    await supabase.from('usage_events').insert({
      organization_id: org.id,
      user_id: profile.id,
      feature: 'timeline_generation',
      tokens_input: run.inputTokens,
      tokens_output: run.outputTokens,
    });

    return NextResponse.json({ count: events.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
