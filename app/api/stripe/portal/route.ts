import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/auth';
import { getStripe } from '@/lib/stripe/client';

export async function POST() {
  const { org } = await requireOrg();
  if (!org.stripe_customer_id) {
    return NextResponse.json({ error: 'サブスクリプションがありません' }, { status: 400 });
  }
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${appUrl}/settings`,
  });
  return NextResponse.json({ url: session.url });
}
