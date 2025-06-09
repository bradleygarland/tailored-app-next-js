export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { getUserOrAnonUsage } from "@/lib/usage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1] || null;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';

    // Console log IP on GET
    console.log('GET', ip);

    if (!token && !ip) {
      return NextResponse.json({ error: 'Missing auth token and IP address' }, { status: 400 });
    }


    const usageCount = await getUserOrAnonUsage(supabase, token, ip);
    console.log('usage', usageCount);
    return NextResponse.json(usageCount);
  } catch (err: any) {
    console.error('Usage API error:', err.message);
    return NextResponse.json({ error: 'Failed to retrieve usage info'}, { status: 500});
  }
}