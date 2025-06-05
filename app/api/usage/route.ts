export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const MAX_FREE_GENERATIONS = 3;

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';
    console.log('GET', ip);

    const token = req.headers.get('authorization')?.split(' ')[1] || '';

    const { data: { user } } = await supabase.auth.getUser(token);
    const userId = user?.id;
    console.log('user: ', user);

    const identifier = userId || ip;

    const { data: existingRow, error } = await supabase
      .from('generation_usage')
      .select('count')
      .eq(userId ? 'user_id' : 'ip_address', identifier)
      .maybeSingle();

    if (error) {
      console.error('Error fetching usage:', error.message);
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    console.log('user_id', userId);
    console.log('ip: ', userId ? null : ip);

    if (!existingRow) {
      const insertRes = await supabase.from('generation_usage').insert([{
        user_id: userId,
        ip_address: userId ? null : ip,
        count: 0,
        last_generated_at: null
      }]).single();

      if (insertRes.error) {
        console.error('Insert error:', insertRes.error);
        return NextResponse.json({ error: 'Failed to initialize usage' }, { status: 500 });
      }
    }

    const usageCount = existingRow?.count || 0;
    const remainingGenerations = Math.max(0, MAX_FREE_GENERATIONS - usageCount)

    return NextResponse.json({
      usageCount,
      remainingGenerations,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not fetch usage.' }, { status: 500 });
  }
}