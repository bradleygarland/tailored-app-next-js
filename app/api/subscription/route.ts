export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_USAGE_LIMITS} from "@/lib/subscription";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  console.log('GET subscription route');

  const token = req.headers.get('authorization')?.split(' ')[1] || '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    if (error || !subscription) return NextResponse.json({ error: "Fetch subscription failed" }, { status: 500 });

    const plan = subscription.plan || 'free';

    const maxUsage = PLAN_USAGE_LIMITS[plan] ?? 0; // default to 0 if unknown

    return NextResponse.json({ status: 200, plan, maxUsage });
  } catch (err) {
    return NextResponse.json({ error: `Error fetching subscription details` }, { status: 500 });
  }
}