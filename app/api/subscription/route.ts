export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_USAGE_LIMITS, getUserSubscription } from "@/lib/subscription";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || '';

  try {

    const subscription = await getUserSubscription(supabase, token);
    /*
    const plan = subscription.plan || 'free';

    const maxUsage = PLAN_USAGE_LIMITS[plan] ?? 0; // default to 0 if unknown
    */


    return NextResponse.json({ status: 200, data: subscription });
  } catch (err) {
    return NextResponse.json({ error: `Error fetching subscription details` }, { status: 500 });
  }
}