import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  // Fetch subscription from DB
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .single();

  if (error || !subscription) {
    console.error('/api/stripe/resume-subscription: Failed to fetch subscription:', error?.message);
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 500 });
  }

  const stripeSubscriptionId = subscription?.stripe_subscription_id;

  try {
    // Resume the subscription in Stripe
    const resumedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update user subscription:', updateError?.message);
      return NextResponse.json({ error: 'Failed to update user subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true , subscription: resumedSubscription });
  } catch (err) {
    console.error('Failed to resume subscription:', err);
    return NextResponse.json({ error: 'Failed to resume subscription' }, { status: 500 });
  }
}