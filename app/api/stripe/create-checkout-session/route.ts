import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PRICE_IDS: Record<string, string> = {
  'starter_monthly': 'price_1RadgLRv6X6vj8ksgKDNGpZl',
  'pro_monthly': 'price_1RaMVxRv6X6vj8ks5Q0ccN3E',
  'starter_yearly': 'price_1RaMlIRv6X6vj8ksSwd0XR45',
  'pro_yearly': 'price_1RaMlyRv6X6vj8ksrJoHeMx2',
};

export async function POST(
  req: NextRequest,
) {
  try {
    const { email, plan, interval, userId, customerId } = await req.json();

    // Defensive param checking
    if (!email || !plan || !interval || !userId || !customerId) {
      console.error('Missing a parameter:', email, plan, interval, userId, customerId);
      return NextResponse.json({error: 'Missing {email, plan, interval, userId, or customerId}'}, {status: 400});
    }

    const priceKey = `${plan}_${interval}`;
    const priceId = PRICE_IDS[priceKey];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or interval' }, { status: 400 });
    }

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
  } catch (error) {
    console.error("Internal server error: ", error);
    return NextResponse.json({ error: `Internal server error: Could not handle request ${error}`}, { status: 500 });
  }
}