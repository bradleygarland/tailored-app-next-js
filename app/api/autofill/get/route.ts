import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || '';

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const { data: { user },
    error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 402 });
    }

    const { data, error } = await supabase
      .from('autofill_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('autofill/api/get SELECT Error:', error);
      return NextResponse.json({ error: "Failed to retrieve data from supabase/autofill_data." }, { status: 403 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Failed to complete GET Request:', error);
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 405 });
  }
}