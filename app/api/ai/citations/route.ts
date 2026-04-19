import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runClaude } from '@/lib/anthropic/client';
import { CITATIONS_SYSTEM, CITATIONS_USER } from '@/lib/anthropic/prompts';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  caseId: z.string().uuid(),
  query: z.string().min(1).max(500),
});

const citationSchema = z.object({
  court: z.string().optional(),
  case_number: z.string().optional(),
  date: z.string().optional(),
  summary: z.string().optional(),
  relevance_score: z.number().min(0).max(1).optional(),
  ai_reasoning: z.string().optional(),
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

  try {
    const run = await runClaude({
      system: CITATIONS_SYSTEM,
      user: CITATIONS_USER({
        caseTitle: caseRow.title,
        caseType: caseRow.case_type,
        description: caseRow.description,
        query: body.data.query,
      }),
      maxTokens: 3000,
    });

    const start = run.text.indexOf('[');
    const end = run.text.lastIndexOf(']');
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
    }
    const parsed = JSON.parse(run.text.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'AI応答の形式が不正です' }, { status: 500 });
    }

    const results = parsed.flatMap((item) => {
      const r = citationSchema.safeParse(item);
      return r.success ? [r.data] : [];
    });

    if (results.length === 0) {
      return NextResponse.json({ error: '関連判例が見つかりませんでした' }, { status: 500 });
    }

    // Remove old citations for this case, then insert new
    await supabase.from('citations').delete().eq('case_id', body.data.caseId);

    await supabase.from('citations').insert(
      results.map((c) => ({
        case_id: body.data.caseId,
        organization_id: org.id,
        court: c.court ?? null,
        case_number: c.case_number ?? null,
        date: c.date ?? null,
        summary: c.summary ?? null,
        relevance_score: c.relevance_score ?? null,
        ai_reasoning: c.ai_reasoning ?? null,
      })),
    );

    await supabase.from('usage_events').insert({
      organization_id: org.id,
      user_id: profile.id,
      feature: 'citation_search',
      tokens_input: run.inputTokens,
      tokens_output: run.outputTokens,
    });

    return NextResponse.json({ count: results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
