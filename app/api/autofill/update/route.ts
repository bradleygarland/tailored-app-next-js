import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1] || '';

  if  (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 500 });
  } else {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token);
      if (authError || !user) {
        console.error('Authentication failed:', authError?.message);
        return NextResponse.json({ error: authError }, { status: 500 });
      }

      const formData = await req.json();

      const { error } = await supabase
        .from('autofill_data')
        .upsert({user_id: user?.id, ...formData});

      if (error) {
        console.error('UPSERT Error:',  error);
        return NextResponse.json({ error: error }, { status: 500 });
      }

      return NextResponse.json({ message: 'Autofill updated' }, { status: 200 });

    } catch (err) {
      console.error("autofill/update failed:", err);
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}