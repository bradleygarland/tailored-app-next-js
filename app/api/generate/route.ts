import { getUserOrAnonUsage, updateUserOrAnonUsage } from "@/lib/usage";
import { PLAN_USAGE_LIMITS, getUserSubscription } from "@/lib/subscription";

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { encoding_for_model } from 'tiktoken';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const enc = encoding_for_model('gpt-4o-mini');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || '';

    const { full_name, email, phone, address, city, state, zip_code, skills, company, position, jobDescription } = await req.json();

    if (!full_name || !email || !phone || !company || !position || !jobDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip || 'unknown';

    // Get Max Generations from subscription
    const plan = await getUserSubscription(supabase, token);
    const maxGenerations = PLAN_USAGE_LIMITS[plan] ?? 0;

    const usageData = await getUserOrAnonUsage(supabase, token, ip);
    const usageCount = usageData.usageCount;

    // Check limit
    // TEST_MAX_GENERATIONS DEV VAR
    if (usageCount && usageCount >= maxGenerations) {
      return NextResponse.json({
        error: 'Generation limit reached.',
      }, { status: 403 });
    }

    //const prompt = `Give me a crazy fact about today's date. Make the description extremely short. Today is ${new Date()}`;

    const prompt = `
      Write a professional cover letter for the following job application:
      - Full Name: ${full_name}
      - Email: ${email}
      - Phone: ${phone}
      - Address: ${address}
      - City: ${city}
      - State: ${state}
      - Zip: ${zip_code}
      - Skills: ${skills}
      - Company: ${company}
      - Position: ${position}
      - Job Description: ${jobDescription}
      - Date: ${new Date()}

      The tone should be confident, engaging, and professional. Keep it concise and focused on why the applicant is a good fit for the role. Maintain honesty and integrity based on the skills provided. Focus on appealing to the recipient's sense of honor and attempt to convince them to look into an interview or further opportunities.
      Make sure that the cover letter is ready to be copied and pasted without any placeholder effects. If no information is given for certain parts, do not include it.
    `;

    const inputTokens = enc.encode(prompt);
    const inputTokenCount = inputTokens.length;
    //enc.free();
    console.log("input tokens:", inputTokenCount);

    if (inputTokenCount > 2048) {
      console.warn(`Prompt exceeds max token limit (2048): ${inputTokenCount}`);
      return NextResponse.json({ error: `Prompt exceeds max token limit (2048): ${inputTokenCount}` }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedLetter = completion.choices[0]?.message?.content?.trim();
    console.log(generatedLetter);

    if (generatedLetter) {
      const outputTokens = enc.encode(generatedLetter);
      const outputTokenCount = outputTokens.length;
      enc.free();
      console.log("output tokens:", outputTokenCount);
    }

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