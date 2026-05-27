import { NextRequest, NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const PERSONA_PROMPTS: Record<string, string> = {
  logistics:    'You are briefing a CFO of a logistics and freight company. Focus on: fuel cost exposure, freight rate impact, inventory carrying cost, route disruption risk, and working capital pressure. Be specific about timelines and magnitude.',
  aviation:     'You are briefing a strategy director at an airline or travel company. Focus on: jet fuel hedging windows, passenger demand signals, yield management implications, and competitor capacity moves. Reference IATA benchmarks where relevant.',
  investment:   'You are briefing a portfolio manager with broad equity exposure. Focus on: sector rotation signals, timing windows for re-entry, correlation breakdown risks, and specific hedging instruments to consider.',
  retail:       'You are briefing a CEO of a retail or e-commerce business. Focus on: consumer discretionary spend trajectory, supply chain cost pass-through, credit availability for customers, and inventory risk.',
  startup:      'You are briefing a Series B/C startup founder. Focus on: VC sentiment and fundraising climate, hiring market tightening or loosening, B2B customer budget freeze risk, and burn rate implications.',
  risk:         'You are briefing a Chief Risk Officer or underwriter. Focus on: claims exposure increases, reserve adequacy, reinsurance cost impact, and specific lines of business most affected.',
  jobseeker_it:        'You are briefing a technology professional (software engineer, data scientist, product manager) who is job searching. Focus on: tech sector hiring freezes vs growth areas, how the macro shock shifts budget toward or away from tech investment, which tech sub-sectors are counter-cyclical, and how AI adoption accelerates or decelerates in this environment. Be honest about layoff risk.',
  jobseeker_banking:   'You are briefing a banking or financial services professional who is job searching. Focus on: front-office vs back-office hiring dynamics under this scenario, which desks or divisions expand (e.g. fixed income in rate hikes), M&A activity signals, and how AI is reshaping analyst and associate roles specifically.',
  jobseeker_logistics: 'You are briefing a logistics, supply chain, or operations professional who is job searching. Focus on: hiring demand for supply chain talent under this shock, which roles are in demand (procurement, planning, last-mile), and how automation is changing the logistics workforce.',
  jobseeker_retail:    'You are briefing a retail, e-commerce, or consumer goods professional who is job searching. Focus on: retail sector employment signals, which functions are being cut vs invested in, and how AI-driven personalisation and automation is restructuring retail teams.',
  jobseeker_healthcare:'You are briefing a healthcare professional who is job searching. Focus on: healthcare sector resilience or exposure to this macro shock, government spending signals, and how AI diagnostics and automation are affecting clinical and administrative hiring.',
  jobseeker_realestate:'You are briefing a real estate professional (agent, developer, analyst) who is job searching. Focus on: transaction volume signals under this scenario, which real estate segments hold up, and how proptech and AI are affecting headcount in the sector.',
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 });
  }

  const body = await req.json();
  const { persona, triggers, impacts, liveData, intensity, context } = body;

  const personaPrompt = PERSONA_PROMPTS[persona] ?? PERSONA_PROMPTS.investment;

  const impactSummary = Object.entries(impacts as Record<string, { impact: number; lag: number; conf: number; mechanism: string }>)
    .sort((a, b) => Math.abs(b[1].impact) - Math.abs(a[1].impact))
    .slice(0, 8)
    .map(([sector, d]) => `${sector}: ${d.impact > 0 ? '+' : ''}${(d.impact * 100).toFixed(0)}% impact, T+${d.lag} days, ${(d.conf * 100).toFixed(0)}% confidence`)
    .join('\n');

  const liveContext = liveData ? `
Current live market conditions:
- VIX: ${liveData.vix ?? 'unavailable'}
- WTI Crude: $${liveData.oil ?? 'unavailable'} (${liveData.oilChange ?? 'N/A'} today)
- S&P 500: ${liveData.sp500Change ?? 'N/A'} today
- USD/EUR: ${liveData.usdEur ?? 'unavailable'}
- Data source: ${liveData.source}
` : '';

  const systemPrompt = `You are a plain-English macro analyst. Your job is to translate complex economic cascade effects into clear, actionable intelligence for non-economists. No jargon. No bullet-point walls. Write like you're briefing a smart, busy person who needs to act, not study.

${personaPrompt}

Format your response in exactly 4 sections with these headers:
## What just happened
## What this means for you in the next 90 days
## What most people will miss
## What to watch — your 3 signals

Keep each section to 3–5 sentences max. Total response under 400 words. Plain English. Specific and actionable.`;

  const userPrompt = `Macro shock scenario: ${triggers.join(' + ')}
Intensity: ${intensity}
Market context: ${context}

Cascade model output (top impacted sectors):
${impactSummary}

${liveContext}

Write the strategic brief for this persona.`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
