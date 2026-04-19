import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runClaude } from '@/lib/anthropic/client';
import { EVIDENCE_ANALYSIS_SYSTEM, EVIDENCE_ANALYSIS_USER } from '@/lib/anthropic/prompts';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

const bodySchema = z.object({ evidenceId: z.string().uuid() });

export async function POST(request: Request) {
  const { org, profile } = await requireOrg();
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const supabase = await createClient();
  const res = await supabase
    .from('evidence')
    .select('*, cases(*)')
    .eq('id', body.data.evidenceId)
    .single();

  type EvidenceWithCase = Database['public']['Tables']['evidence']['Row'] & {
    cases: Database['public']['Tables']['cases']['Row'] | null;
  };
  const evidence = res.data as EvidenceWithCase | null;

  if (!evidence) return NextResponse.json({ error: 'evidence not found' }, { status: 404 });
  if (!evidence.content_text)
    return NextResponse.json({ error: '証拠本文が未入力です' }, { status: 400 });
  if (!evidence.cases) return NextResponse.json({ error: 'case not found' }, { status: 404 });

  const caseData = evidence.cases;

  try {
    const run = await runClaude({
      system: EVIDENCE_ANALYSIS_SYSTEM,
      user: EVIDENCE_ANALYSIS_USER({
        caseTitle: caseData.title,
        caseType: caseData.case_type,
        side: caseData.side,
        label: evidence.label,
        content: evidence.content_text,
      }),
      maxTokens: 800,
    });

    await supabase.from('evidence').update({ ai_summary: run.text }).eq('id', evidence.id);

    await supabase.from('usage_events').insert({
      organization_id: org.id,
      user_id: profile.id,
      feature: 'evidence_analysis',
      tokens_input: run.inputTokens,
      tokens_output: run.outputTokens,
    });

    return NextResponse.json({ summary: run.text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
