import { getUserOrAnonUsage, updateUserOrAnonUsage } from "@/lib/usage";



export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_MAX_GENERATIONS = 3;

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    });

    const { fullName, email, phone, company, position, jobDescription } = await req.json();

    if (!fullName || !company || !position || !jobDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';

    // Console log IP on POST
    console.log('POST', ip);

    const usageData = await getUserOrAnonUsage(supabase, token, ip);
    const usageCount = usageData.usageCount;

    // Check limit
    // TEST_MAX_GENERATIONS DEV VAR
    if (usageCount && usageCount >= TEST_MAX_GENERATIONS) {
      return NextResponse.json({
        error: 'Generation limit reached.',
      }, { status: 403 });
    }

    /* Update or insert usage
    if (usage) {
      await supabase.from('generation_usage').update({
        count: usage.count + 1,
        last_generated_at: new Date(),
      }).eq(userId ? 'user_id' : 'ip_address', userId || ip);
    } else {
      await supabase.from('generation_usage').insert([{
        user_id: userId,
        ip_address: userId ? null : ip,
        count: 1,
        last_generated_at: new Date(),
      }]);
    }*/

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

    // Update usage after generation
    const newCount = usageCount + 1;
    await updateUserOrAnonUsage(supabase, token, ip, newCount);

    return NextResponse.json({
      generatedLetter,
      newCount
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}