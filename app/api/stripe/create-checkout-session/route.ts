import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const PRICE_IDS: Record<string, string> = {
  'starter_month': 'price_1RcxgaRv6X6vj8kslEe4AdmX',
  'pro_month': 'price_1RcxguRv6X6vj8ksgkMI2SzV',
  'starter_year': 'price_1RcxgaRv6X6vj8ksuHBivWlt',
  'pro_year': 'price_1RcxhQRv6X6vj8ksLhfyQyNi',
};

const PLAN_RANKS: Record<string, number> = {
  free: 0,
  starter_month: 1,
  starter_year: 2,
  pro_month: 3,
  pro_year: 4,
};

export async function POST(
  req: NextRequest,
) {
  try {
    const { email, plan, interval, userId, customerId } = await req.json();

    {/*
    Check for existing stripe subscription
    If existing subscription:
      Selected plan is a potential upgrade
      Check to see if the selected plan has higher value than current plan
      If value is higher:
        Continue with upgrade through stripe update subscription
      Else:
        Reject Request
      Check to see if the selected plan has a higher tier than the current plan
      If tier is higher:
        If value is lower:
          Reject Request
        Else: approve and continue with upgrade
    */}

    // Defensive param checking
    if (!email || !plan || !interval || !userId || !customerId) {
      console.error('Missing a parameter:', email, plan, interval, userId, customerId);
      return NextResponse.json({error: 'Missing {email, plan, interval, userId, or customerId}'}, {status: 400});
    }

    // Get Customer from DB (fetch stripe_customer_id)
    const { data: profile, error} = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to get profile data' }, { status: 500 });
    }

    console.log(profile?.stripe_customer_id);
    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found for this user.' }, { status: 500 });
    }

    const stripeCustomerId = profile.stripe_customer_id;

    const activeStripeSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1
    });
    console.log('StripeSubscriptionsList', activeStripeSubscriptions);
    const currentSubscription = activeStripeSubscriptions.data[0];

    const selectedPlanKey = `${plan}_${interval}`;
    const priceId = PRICE_IDS[selectedPlanKey];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 });
    }
    const selectedRank = PLAN_RANKS[selectedPlanKey];

    console.log('currentSubscriptionItem:', currentSubscription?.items.data[0]);
    const currentPlanKey = currentSubscription
      ? `${currentSubscription.items.data[0].price.nickname}`
      : 'free';
    const currentRank = PLAN_RANKS[currentPlanKey] ?? 0;
    console.log('currentPlanKey:', currentPlanKey)

    if (!currentSubscription || currentRank === 0) {
      // Upgrading from free plan
      console.log('Upgrading from free...');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customerId,
        metadata: {
          supabase_user_id: userId,
          plan: plan,
          interval: interval,

        },
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/upgrade',
      });

      console.log("CHECKOUT SESSION:", session);

      return NextResponse.json({ url: session.url }, { status: 200 });
    } else if (selectedRank > currentRank) {
      // Upgrade: Handle with Stripe API
      console.log('Upgrading plan...');

      const subscriptionItemId = currentSubscription.items.data[0].id;
      const updatedSub = await stripe.subscriptions.update(currentSubscription.id, {
        items: [{
          id: subscriptionItemId,
          price: PRICE_IDS[selectedPlanKey],
        }],
        proration_behavior: 'create_prorations',
        collection_method: 'charge_automatically',
      });

      return NextResponse.json({ success: true, message: 'Upgraded!' });
    } else if (selectedRank < currentRank) {
      // Downgrade: Handle with Stripe API
      console.log('Downgrading plan...');

      const subscriptionItemId = currentSubscription.items.data[0].id;
      await stripe.subscriptions.update(currentSubscription.id, {
        items: [{
          id: subscriptionItemId,
          price: PRICE_IDS[selectedPlanKey],
        }],
        proration_behavior: 'create_prorations'
      });
      return NextResponse.json({ success: true, message: 'Downgraded!' });
    } else {
      return NextResponse.json({ success: true, message: 'Already have selected plan!'});
    }
  } catch (error) {
    console.error("Internal server error: ", error);
    return NextResponse.json({ error: `Internal server error: Could not handle request ${error}`}, { status: 500 });
  }
}