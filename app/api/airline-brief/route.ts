import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not configured' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { triggerId, triggerLabel, triggerDescription, realWorldRef, impacts, mode } = body;
  // mode: 'cascade' (P&L cascade brief) | 'irrop' (IRROP recovery brief)

  // Summarise cascade impacts — top movers, sorted by magnitude
  const impactLines = Object.entries(
    impacts as Record<string, { impact: number; conf: number; daysToEffect: number; mechanism: string }>
  )
    .filter(([, d]) => Math.abs(d.impact) > 0.04)
    .sort((a, b) => Math.abs(b[1].impact) - Math.abs(a[1].impact))
    .map(([nodeId, d]) => {
      const sign = d.impact > 0 ? '+' : '';
      return `  ${nodeId.replace(/_/g, ' ')}: ${sign}${(d.impact * 100).toFixed(0)}% (T+${d.daysToEffect}d, ${(d.conf * 100).toFixed(0)}% conf)`;
    })
    .join('\n');

  let systemInstruction: string;
  let userPrompt: string;

  if (mode === 'irrop') {
    // IRROP recovery intelligence brief
    const { origin, destination, disruptType, tier, urgency } = body.irropContext ?? {};
    systemInstruction = `You are an airline operations and revenue intelligence advisor with 18+ years inside the GDS stack — Sabre, Amadeus, NDC, IRROP management, and yield management delivery.

You specialise in the gap that PROS RM, Sabre Mosaic, and Fetcherr GPE leave behind: real-time disruption recovery intelligence. GDS IROPS Manager handles manual recovery. NDC-connected systems offer proactive rebooking. But the strategic brief — what does this disruption COST the airline, how should revenue management respond, and what is the network recovery playbook — that is what you generate.

Write like a McKinsey aviation practice partner briefing the VP of Operations. No bullet walls. Specific, actionable, grounded in current airline operations reality.`;

    userPrompt = `A disruption event on ${origin ?? 'unknown'}–${destination ?? 'unknown'}: ${disruptType ?? 'operational disruption'}.
Passenger tier: ${tier ?? 'Mixed'} · Arrival urgency: ${urgency ?? 'Flexible'}

P&L cascade model outputs:
${impactLines}

Real-world reference: ${realWorldRef ?? 'Major operational disruption'}

Search for current news on airline IRROP incidents, GDS recovery practices, and NDC rebooking tools. Then write a 4-section airline operations recovery brief:

## Disruption Impact Assessment
What this specific disruption type costs the airline operationally and financially, with current context.

## Immediate Recovery Playbook
GDS vs NDC rebooking strategy, crew re-rostering priorities, pax reaccommodation sequence. What IROPS Manager does well and where it fails.

## Revenue Management Response
Yield management adjustments in the 72 hours post-disruption. Protecting premium cabin, managing ancillary, and RASK recovery approach.

## Recovery Horizon & Watch Signals
Realistic timeline. Three specific metrics to watch that signal whether recovery is on track.

Rules: reference at least 2 specific airlines or real incidents. Under 450 words total. Plain English.`;
  } else {
    // Cascade P&L intelligence brief
    systemInstruction = `You are an airline revenue intelligence advisor with 18+ years inside the airline stack — GDS distribution (Sabre/Amadeus), NDC migration, yield management delivery, and P&L analytics.

You understand the full airline P&L better than most: PROS RM optimises the revenue engine; Sabre Mosaic CRO adds continuous pricing; Fetcherr GPE adds generative simulation. But none of them give airline leadership a plain-English brief on what a macro shock MEANS for their specific cost structure, hedging position, and network strategy. That is what you provide.

Write like a senior aviation practice analyst at Oliver Wyman. No jargon walls. Specific, current, and actionable. Each section must weave cascade model numbers with real-world events you find via search.`;

    userPrompt = `Airline P&L shock scenario: ${triggerLabel}
Description: ${triggerDescription ?? ''}
Real-world reference: ${realWorldRef ?? ''}

BFS P&L cascade model outputs (cite at least 2 in your brief):
${impactLines}

Search for what is happening RIGHT NOW related to ${triggerLabel} in the airline industry. Then write a 4-section airline revenue intelligence brief:

## What Just Happened
The trigger and its immediate P&L mechanics. What PROS RM and Sabre Mosaic see in their demand signals right now.

## Revenue Management Response Required
Specific yield management actions: booking class opens, capacity decisions, NDC vs GDS pricing divergence. Timeline.

## Cost Side — Hedge Book, Labor, Distribution
Fuel hedge book position, labor cost exposure, GDS fee impact vs NDC migration opportunity. What airlines can and cannot control in 90 days.

## Recovery Horizon
Realistic RASK and CASK recovery timeline. The 3 metrics that will tell you if the airline is executing the recovery correctly.

Rules: reference at least 2 specific airlines or real events from search. Cite 2+ cascade model percentages. Under 500 words. Plain English. No all-caps sentences.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} }] as any,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
