import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOrg } from '@/lib/auth';
import { getStripe, PLAN_PRICE_IDS, type PlanKey } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({ plan: z.enum(['starter', 'pro']) });

export async function POST(request: Request) {
  const { org, profile } = await requireOrg();
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'invalid plan' }, { status: 400 });

  const plan: PlanKey = body.data.plan;
  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) return NextResponse.json({ error: 'price not configured' }, { status: 500 });

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: org.name,
      metadata: { organization_id: org.id },
    });
    customerId = customer.id;
    const supabase = await createClient();
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', org.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?billing=success`,
    cancel_url: `${appUrl}/settings?billing=cancel`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { organization_id: org.id },
    },
    metadata: { organization_id: org.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
