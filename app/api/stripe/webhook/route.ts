import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  if (!sig || !endpointSecret) {
    return new NextResponse('Missing Stripe Signature or webhook secret', { status: 400 });
  }

  const buf = Buffer.from(await request.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('Event Type:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      {/* Checkout Session Completed */}

      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const customerEmail = session.customer_details?.email;
      const stripeSubscriptionId = session.subscription as string;
      const stripeCustomerId = session.customer as string;
      const plan = session.metadata?.plan as string;
      const interval = session.metadata?.interval as string;

      console.log('METADATA', session.metadata);
      console.log('Subscription Id', session.subscription as string);

      if (!userId || !stripeSubscriptionId) {
        console.error('Missing userId or stripeSubscriptionId in session metadata');
        return NextResponse.json({ received: true});
      }

      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(
          [{
            user_id: userId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            email: customerEmail,
            status: 'active',
            plan: plan,
            interval: interval,
          }],
          { onConflict: 'user_id' }
        );

      if (subError) {
        console.error('Failed to upsert subscription:', subError);
      }

      return NextResponse.json({ received: true });
    }
    case 'invoice.paid': {
      {/* Invoice Paid */}

      const invoice = event.data.object as Stripe.Invoice;
      console.log('Invoice', invoice);
      return NextResponse.json({ received: true });
    }
    case 'customer.subscription.created': {
      {/* Customer Subscription Created */}
      const subscription = event.data.object as Stripe.Subscription;

      const stripeCustomerId = subscription.customer as string;

      const { data: profile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

      if (userError || !profile) {
        console.error('No matching profile found for Stripe customer id:', stripeCustomerId);
        return NextResponse.json({ received: true });
      }

      const userId = profile.id;

      const stripeSubscriptionId = subscription.id;
      const interval = subscription.items.data[0]?.price.recurring?.interval || 'unknown';
      const status = subscription.status;
      const current_period_start = new Date(subscription.billing_cycle_anchor * 1000).toISOString();
      const created_at = new Date(subscription.created * 1000).toISOString();

      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert([
          {
            user_id: userId,
            stripe_subscription_id: stripeSubscriptionId,
            interval: interval,
            status: status,
            current_period_start: current_period_start,
            created_at: created_at,
          }
        ], { onConflict: 'user_id' });

      if  (subError) {
        console.error('Failed to upsert subscription:', subError);
      }

      return NextResponse.json({ received: true });
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      console.log('Subscription:', subscription);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', subscription?.customer as string)
        .single();

      if (updateError) {
        console.error('Failed to update user subscription on delete:', updateError);
      }

      return NextResponse.json({ received: true });
    }
    default:
      // Optionally log ignored events or do nothing

      return NextResponse.json({ received: true });
  }
}