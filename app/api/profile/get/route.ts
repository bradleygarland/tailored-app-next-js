import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || '';

  if (!token) {
    console.warn("No token provided.")
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 402 });
    }

    const { data, error } = await supabase
      .from('user_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('profile/api/get', error);
      return NextResponse.json({ error: 'Failed to return profile data' }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('Failed to complete GET request:', err);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 405 });
  }
}