import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const prompt = body.prompt

  if (!prompt) {
    return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const token = req.headers.get('authorization')?.split(' ')[1] || ''
  const { data: { user } } = await supabase.auth.getUser(token)
  const userId = user?.id || null

  // Check usage limits
  let usage
  if (userId) {
    const { data } = await supabase.from('generation_usage').select('*').eq('user_id', userId).single()
    usage = data
  } else {
    const { data } = await supabase.from('generation_usage').select('*').eq('ip_address', ip).single()
    usage = data
  }

  const limit = userId ? 9999 : 3

  if (usage && usage.count >= limit) {
    return NextResponse.json({ error: 'Generation limit reached.' }, { status: 403 })
  }

  if (usage) {
    await supabase
    .from('generation_usage')
    .update({ count: usage.count + 1, last_generated_at: new Date() })
    .eq(userId ? 'user_id' : 'ip_address', userId || ip)
  } else {
    await supabase.from('generation_usage').insert({
      ip_address: ip,
      user_id: userId,
      count: 1
    })
  }

  return NextResponse.json({ success: true })
}