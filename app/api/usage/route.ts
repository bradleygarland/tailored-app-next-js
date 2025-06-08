export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { getUserOrAnonUsage } from "@/lib/usage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {

  const token = req.headers.get('authorization')?.split(' ')[1] || '';

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';

  // Console log IP on GET
  console.log('GET', ip);


  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  });

  try {
    const usageCount = await getUserOrAnonUsage(supabase, token, ip);
    console.log('usage', usageCount);
    return NextResponse.json(usageCount);
  } catch (err: any) {
    console.error('Usage API error:', err.message);
    return NextResponse.json({ error: 'Failed to retrieve usage info'}, { status: 500});
  }
}