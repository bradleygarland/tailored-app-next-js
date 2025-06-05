import {wrapRequestHandlerWorker} from "next/dist/experimental/testmode/server";

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, company, position, jobDescription } = await req.json();

    if (!fullName || !company || !position || !jobDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';
    console.log(ip)

    const token = req.headers.get('authorization')?.split(' ')[1] || '';
    const { data: { user } } = await supabase.auth.getUser(token);
    const userId = user?.id || null;

    let usage;
    if (userId) {
      const { data } = await supabase.from('generation_usage').select('*').eq('user_id', userId).single();
      usage = data;
    } else {
      const { data } = await supabase.from('generation_usage').select('*').eq('ip_address', ip).single();
      usage = data;
    }

    const maxFreeGenerations = userId ? 9999 : 3; // 3 for anonymous, unlimited for authenticated
    const currentCount = usage?.count || 0;
    const remainingGenerations = Math.max(0, maxFreeGenerations - (currentCount + 1)); // Pre-calculate next remaining

    // Check limit
    if (usage && usage.count >= maxFreeGenerations) {
      return NextResponse.json({
        error: 'Generation limit reached.',
        remainingGenerations: 0
      }, { status: 403 });
    }

    // Update or insert usage
    if (usage) {
      await supabase.from('generation').update({
        count: usage.count + 1,
        last_generated_at: new Date()
      }).eq(userId ? 'user_id' : 'ip_address', userId || ip);
    } else {
      await supabase.from('generation_usage').insert({
        user_id: userId,
        ip_address: userId ? null : ip,
        count: 1
      });
    }

    const prompt = "Give me a singular short sentence about the date.";

    /*const prompt = `
      Write a professional cover letter for the following job application:
      - Full Name: ${fullName}
      - Email: ${email}
      - Phone: ${phone}
      - Company: ${company}
      - Position: ${position}
      - Job Description: ${jobDescription}

      The tone should be confident, engaging, and professional. Keep it concise and focused on why the applicant is a good fit for the role.
    `;*/

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedLetter = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({
      generatedLetter,
      remainingGenerations
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}