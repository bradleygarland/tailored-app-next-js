import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(
  req: NextRequest,
) {
  try {
    const { id, email } = await req.json();

    if (!id || !email) {
      console.error('Missing User ID or email');
      return NextResponse.json({ error: 'Missing User ID or email' }, { status: 400 });
    }

    const customer = await stripe.customers.create({
      email,
      metadata: {
        supabase_user_id: id,
      }
    });

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', id)

    return NextResponse.json({ stripe_customer_id: customer.id }, { status: 200 });
  } catch (error) {
    console.error('Failed to complete /api/create-customer request:', error);
    return NextResponse.json({ error: 'Failed to complete request.' }, { status: 500 });
  }
}