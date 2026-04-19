'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireOrg } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const caseSchema = z.object({
  title: z.string().min(1, '事件名は必須です').max(200),
  case_number: z.string().max(100).optional().or(z.literal('')),
  client_name: z.string().max(100).optional().or(z.literal('')),
  court_name: z.string().max(100).optional().or(z.literal('')),
  case_type: z.string().max(100).optional().or(z.literal('')),
  side: z.enum(['plaintiff', 'defendant', 'third_party']).optional().or(z.literal('')),
  opposing_party: z.string().max(200).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  amount_in_dispute: z.string().optional().or(z.literal('')),
});

function emptyToNull(v: string | undefined | null) {
  if (!v || v === '') return null;
  return v;
}

export async function createCase(formData: FormData): Promise<void> {
  const { org, profile } = await requireOrg();
  const raw = Object.fromEntries(formData.entries());
  const parsed = caseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cases')
    .insert({
      organization_id: org.id,
      created_by: profile.id,
      title: parsed.data.title,
      case_number: emptyToNull(parsed.data.case_number),
      client_name: emptyToNull(parsed.data.client_name),
      court_name: emptyToNull(parsed.data.court_name),
      case_type: emptyToNull(parsed.data.case_type),
      side: parsed.data.side === '' ? null : (parsed.data.side ?? null),
      opposing_party: emptyToNull(parsed.data.opposing_party),
      description: emptyToNull(parsed.data.description),
      amount_in_dispute: parsed.data.amount_in_dispute
        ? Number(parsed.data.amount_in_dispute)
        : null,
    })
    .select('id')
    .single();

  if (error || !data) throw new Error(error?.message ?? '作成に失敗しました');
  revalidatePath('/cases');
  redirect(`/cases/${data.id}`);
}

export async function updateCase(id: string, formData: FormData) {
  await requireOrg();
  const raw = Object.fromEntries(formData.entries());
  const parsed = caseSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(', ') };

  const supabase = await createClient();
  const { error } = await supabase
    .from('cases')
    .update({
      title: parsed.data.title,
      case_number: emptyToNull(parsed.data.case_number),
      client_name: emptyToNull(parsed.data.client_name),
      court_name: emptyToNull(parsed.data.court_name),
      case_type: emptyToNull(parsed.data.case_type),
      side: parsed.data.side === '' ? null : (parsed.data.side ?? null),
      opposing_party: emptyToNull(parsed.data.opposing_party),
      description: emptyToNull(parsed.data.description),
      amount_in_dispute: parsed.data.amount_in_dispute
        ? Number(parsed.data.amount_in_dispute)
        : null,
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath(`/cases/${id}`);
  revalidatePath('/cases');
  return { ok: true };
}

export async function deleteCase(id: string) {
  await requireOrg();
  const supabase = await createClient();
  const { error } = await supabase.from('cases').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/cases');
  redirect('/cases');
}
