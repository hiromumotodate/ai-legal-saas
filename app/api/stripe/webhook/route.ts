import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, priceIdToPlan } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const stripe = getStripe();
  const sig = request.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing sig' }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      const sub = event.data.object;
      const orgId = sub.metadata?.organization_id;
      const priceId = sub.items.data[0]?.price.id;
      const plan = priceIdToPlan(priceId) ?? 'starter';
      if (orgId) {
        await supabase
          .from('organizations')
          .update({
            stripe_subscription_id: sub.id,
            plan: sub.status === 'active' || sub.status === 'trialing' ? plan : 'trial',
          })
          .eq('id', orgId);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const orgId = sub.metadata?.organization_id;
      if (orgId) {
        await supabase
          .from('organizations')
          .update({ plan: 'trial', stripe_subscription_id: null })
          .eq('id', orgId);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'webhook handler failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
