import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe() {
  if (_stripe) return _stripe;
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });
  return _stripe;
}

export const PLAN_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER ?? '',
  pro: process.env.STRIPE_PRICE_PRO ?? '',
} as const;

export type PlanKey = keyof typeof PLAN_PRICE_IDS;

export function priceIdToPlan(priceId: string | null | undefined): 'starter' | 'pro' | null {
  if (!priceId) return null;
  if (priceId === PLAN_PRICE_IDS.starter) return 'starter';
  if (priceId === PLAN_PRICE_IDS.pro) return 'pro';
  return null;
}
