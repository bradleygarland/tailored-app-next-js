export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { getUserOrAnonUsage } from "@/lib/usage";
import { getUserSubscription, PLAN_USAGE_LIMITS } from "@/lib/subscription";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || null;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';

    if (!token && !ip) {
      return NextResponse.json({ error: 'Missing auth token and IP address' }, { status: 400 });
    }

    const usageCount = await getUserOrAnonUsage(supabase, token, ip);

    let usageLimit: number = 3;
    if (token) {
      const plan = await getUserSubscription(supabase, token) || 'free';
      usageLimit = PLAN_USAGE_LIMITS[plan] ?? 3;
    }

    return NextResponse.json({
      usageCount,
      usageLimit,
    });
  } catch (err: any) {
    console.error('Usage API error:', err.message);
    return NextResponse.json({ error: 'Failed to retrieve usage info'}, { status: 500});
  }
}