'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};
const viewport = { once: true, margin: '0px 0px -40px 0px' };

// ── Domain definitions ──────────────────────────────────────────────────────

const domains = [
  {
    id: 'DOMAIN_01',
    label: 'E-Commerce',
    color: '#ff3b30',
    status: 'COMPLETE',
    statusColor: '#00e676',
    href: '/ecommerce',
    problem: 'How many AI systems does it take to replicate what a marketplace team of 17 normally does? One person was the only way to find out.',
    agents: [
      { name: 'Autonomous Content Engine', desc: 'Batch LLM processing across 9,300 SKUs — staged apply/rollback with per-batch locks. Runs nightly, unattended.', frontend: 'None — headless nightly batch job (no UI)', backend: 'Python · Google Gemini Flash · MySQL · cron scheduler · staged apply/rollback with per-batch locks', why: 'Optimising 9,300 SKUs is a bulk, unattended job — not a user interaction — so it runs as a scheduled backend batch, not an app. The staged apply/rollback and per-batch locks matter more than any UI: if a batch fails at 3am it must resume cleanly without corrupting the catalog.' },
      { name: 'Conversational Storefront Assistant', desc: 'Buyer Q&A in plain language. Worked around the commerce engine stripping JS via a server-level injection layer.', frontend: 'Vanilla JavaScript chat widget, injected at server level', backend: 'PHP endpoints · Anthropic Claude', why: 'The commerce platform stripped custom JS from the theme, so the assistant had to be injected through a server-level layer instead. It is kept dependency-free (vanilla JS, not a framework) so it survives platform updates; Claude handles the natural-language Q&A while thin PHP endpoints bridge to the catalog.' },
      { name: 'Buyer Intelligence Tool', desc: 'Location-aware recommendation engine — surfaces parts relevant to a regional market from a sprawling catalog.', frontend: 'Lightweight JS embedded in product pages', backend: 'Anthropic Claude · location lookup · rule layer', why: 'Recommendations must be location-aware and fast, so a deterministic rule layer narrows the sprawling catalog to a regional shortlist before the LLM reasons over it. That keeps latency and token cost low while keeping results relevant to each market — the LLM is the last mile, not the whole pipeline.' },
      { name: 'Vendor Intelligence Dashboard', desc: 'Financial-terminal-style demand dashboard with live heatmaps across 15 regional markets + LLM demand reports on request.', frontend: 'JavaScript real-time dashboard — financial-terminal-style heatmaps across 15 markets', backend: 'Deterministic rule engine · Anthropic Claude (on-demand reports)', why: 'Vendors need live demand at a glance, so the heavy lifting is a deterministic rule engine driving a real-time heatmap UI; the LLM is invoked only on request to write a demand narrative. Fast and cheap where it must be (the dashboard), intelligent where it adds value (the report) — not an LLM call on every refresh.' },
      { name: 'Product Imagery Studio', desc: 'Bulk image-generation pipeline with dual-model A/B (Gemini vs GPT Image) and live cost tracking per batch.', frontend: 'Batch console with live per-batch cost tracking', backend: 'Python pipeline · Gemini Flash Image · GPT Image (dual-model A/B)', why: 'Image generation is expensive and quality varies by model, so a dual-model A/B pipeline runs both and tracks cost per batch — letting the better model win on evidence rather than assumption. It is a backend pipeline because the work is bulk and unattended, not an interactive editor.' },
      { name: 'Commerce Integration Layer', desc: 'Payments, logistics, transactional email, order messaging, and government-API vendor verification wired as one.', frontend: 'None — server-side integration layer', backend: 'Payments · logistics · SMTP · order-messaging API · government verification (vendor KYC) APIs', why: 'Payments, shipping, email, and vendor KYC are all fragile third-party calls. Wiring them as one server-side layer keeps the storefront thin and concentrates every external dependency in a single observable, retryable place — so when a provider fails, it fails in one known spot, not scattered across the app.' },
      { name: 'Infrastructure & Safety Layer', desc: 'Linux admin, CDN/WAF, automated nightly backups, and a written ops runbook. The rules are the real product.', frontend: 'None — operations layer', backend: 'Linux server admin · CDN/WAF at the edge · automated nightly backups · written ops runbook', why: 'A solo-run marketplace needs guardrails more than features. The real product here is operational discipline: a WAF at the edge, automated nightly backups, and a written runbook so that recovery is a checklist to follow — not a 2am improvisation with nobody to call.' },
    ],
    metrics: [{ v: '9,300', l: 'Products optimized' }, { v: '7', l: 'AI / automation systems' }, { v: '17+', l: 'Roles covered solo' }, { v: '200+', l: 'Self-generating pages' }],
  },
  {
    id: 'DOMAIN_02',
    label: 'Fin-Tech',
    color: '#2979ff',
    status: 'LIVE',
    statusColor: '#00e676',
    href: '/fintech',
    problem: 'India has a $530B MSME credit gap. The bottleneck is underwriters spending hours triangulating documents — not a shortage of capital.',
    agents: [
      { name: 'SME Credit Analyst Agent', desc: 'Triangulates GST annual turnover, 12-month bank credits, and ITR declared income. Applies underwriting scoring logic and generates a structured credit narrative with risk flags and recommended limit range. Runs in under 10 seconds.',
        frontend: 'React · TypeScript · single-page agent UI (inputs → structured credit brief)',
        backend: 'None — all triangulation and scoring runs in-browser; no API calls',
        why: 'The underwriting logic is deterministic and lightweight, so it runs entirely client-side. That is a deliberate choice: sensitive financial figures (GST, bank, ITR) never leave the browser, decisions return in under 10 seconds with no network round-trip, and there is zero server cost or attack surface to host the demo.' },
    ],
    metrics: [{ v: '$530B', l: 'MSME credit gap (India)' }, { v: '70%', l: 'Analyst time on doc review' }, { v: '<10s', l: 'Agent decision time' }, { v: '63M+', l: 'MSMEs in India' }],
  },
  {
    id: 'DOMAIN_04',
    label: 'Travel-Tech',
    color: '#00acc1',
    status: 'LIVE',
    statusColor: '#00e676',
    href: '/traveltech',
    problem: 'Revenue management software on the airline side costs millions. A passenger booking LHR→JFK has no tools to model what a fuel spike, route disruption, or geopolitical event will do to fares over the following week. AirWave inverts this: pull live fares, run a deterministic P&L cascade model, deploy 8 independent market agents each with a fixed behavioral profile and fuel hedge position, then weight their votes by market share into a consensus fare prediction with a confidence band. A second system, SQUALL.IROPS, applies the same philosophy to operations: it predicts airline irregular-operations (IROPS) disruption risk before a flight is officially cancelled and drafts proactive passenger outreach — turning a reactive, siloed scramble into an early, coordinated response. Together: AirWave models revenue under pressure, Squall models operations under pressure.',
    agents: [
      {
        name: 'AirWave · Fare Scenario Intelligence Engine',
        desc: '8 market agents (LCC Revenue Manager, Legacy Network Carrier, ULCC Revenue Manager, Premium Boutique, Enterprise Travel Manager, Price-Elastic Consumer, Online Travel Agency, Miles Optimizer) each receive live fare data, a cascaded P&L shock output, and their own behavioral profile. Each produces an independent fare vote and confidence score. Votes are market-share-weighted (Legacy 42%, LCC 28%, ULCC 12%, Premium 7%) into a consensus predicted fare with a ±band. Stack multiple shock triggers for compounded scenarios. A/B comparison mode for two concurrent runs. Rate-limited Flask API (5 req/60s). Simulation history in localStorage. PDF export. Open-source on GitHub.',
        frontend: 'Vue 3 (Composition API) · Vite · reactive multi-step simulation UI · A/B comparison view · PDF export',
        backend: 'Flask · Python · Gemini 2.5 Flash · deterministic P&L cascade engine · rate limiter (5 req/60s) · Duffel NDC · OpenSky · Yahoo Finance · SerpAPI · News RSS · AGPL-3.0',
        why: 'Fares come from rate-limited, key-protected third-party APIs and the 8-agent simulation is compute-heavy — so it needs a real server to hold credentials, cache responses, and rate-limit. The P&L cascade is plain deterministic Python (not an LLM) so the maths stays auditable; the model only writes narrative. Vue + Vite was chosen for a fast, reactive UI to drive the multi-step "pick route → stack shocks → compare" flow without a heavy framework.',
        repo: 'https://github.com/Ashwath-VS/airwave',
      },
      {
        name: 'SQUALL.IROPS · Airline Disruption Intelligence Engine',
        desc: 'The operations counterpart to AirWave. Enter an origin–destination pair; the Predictor fans out concurrently to live weather (Open-Meteo), disruption news (SerpAPI Google News), and air-traffic density (OpenSky) at both endpoints, then runs a deterministic risk cascade — each signal normalised 0–100, weight-blended (Weather 50% · News 30% · Traffic 20%) and renormalised over whatever is live, so it works from the busiest hub to a Tier-3 regional field. Real flights on the route (SerpAPI Google Flights) inherit the route risk plus a departure-window overlay. The Communicator then builds synthetic passenger personas grounded in the real flight and uses Gemini to draft tailored, proactive rebooking messages. A transparent business-case panel quantifies disruption cost avoided plus an Air-Canada-"On My Way"-style protection-fee revenue stream. Predictions are capped to a credible 3-day nowcast horizon. Honestly scoped: live where measurable, synthetic only for passenger identities — declared openly.',
        frontend: 'React 18 · Vite · TypeScript · typed ops-dashboard UI · count-up + staged-load animations · Methodology drawer',
        backend: 'FastAPI (async) · Python · gunicorn + uvicorn workers · nginx · Gemini 2.5 Flash · Open-Meteo · OpenSky · SerpAPI Flights + News · airportsdata (28k+ airports)',
        why: 'Every request fans out to four live APIs at both airports, so the backend is async (FastAPI + asyncio.gather) — it fetches them concurrently, making total latency the slowest single call rather than the sum of all four. I deliberately chose a different stack from AirWave (FastAPI vs Flask, React vs Vue) for two reasons: async genuinely fits a live multi-source fan-out and streaming, and it demonstrates range across stacks. The risk score is a deterministic cascade in plain Python so it is fully auditable; the LLM only drafts the passenger messages.',
        repo: 'https://github.com/Ashwath-VS/squall',
      },
    ],
    metrics: [{ v: '2', l: 'Live systems (fare + IROPS)' }, { v: '11', l: 'Reasoning agents total' }, { v: '9', l: 'Live data sources' }, { v: '3-day', l: 'IROPS nowcast horizon' }],
  },
  {
    id: 'DOMAIN_05',
    label: 'Macro Engine',
    color: '#ff9100',
    status: 'LIVE',
    statusColor: '#00e676',
    href: '/scenarios',
    problem: 'A Bloomberg terminal costs $25,000 a year. Oxford Economics and Macrobond serve institutional desks. None of them produce a plain-English brief for the CFO, the startup founder, or the logistics professional who needs to understand what a macro shock means for their specific role. This platform replicates the same four-layer analytical pipeline — live news trigger detection, live market seeding, a calibrated sector cascade model, and AI narrative grounded in today\'s real events — and delivers institutional-rigour output in plain English, for any decision-maker, free.',
    pipeline: [
      { step: '01', label: 'RSS NEWS SIGNALS',    src: 'BBC World · BBC Business · NYT World · NYT Business', detail: '15-min server cache. Keyword-matched to 6 shock categories. Returns signal strength 0–3 and a live headline per trigger. Cards reflect real news — not static labels.' },
      { step: '02', label: 'LIVE MARKET SEEDING', src: 'Yahoo Finance · open.exchangerate-api.com', detail: '5-min cache. VIX is extracted and converted to a cascade depth multiplier (VIX 14 = 0.82×, VIX 38 = 1.45×). WTI and S&P500 changes dampen first-order impacts already priced in today.' },
      { step: '03', label: 'BFS CASCADE MODEL',   src: '13 sectors · 31 data-calibrated edges', detail: 'Breadth-first search propagates shock impact sector-by-sector. Edge weights calibrated via event-conditional regression against 23 historical shocks (Gulf War 1990 → Ukraine 2022) using Yahoo Finance ETF data. Circuit breakers cap runaway cascades.' },
      { step: '04', label: 'AI SEARCH GROUNDING', src: 'Gemini 2.5 Flash · Google Search API', detail: 'Gemini receives the full 13-sector cascade output plus live market data. Google Search Grounding fires at inference time — the model searches the current web before writing. The brief must cite specific cascade numbers AND specific current events. 11 persona cuts.' },
    ],
    agents: [
      { name: 'BFS Cascade Propagation Engine', desc: 'Breadth-first search across 13 sectors and 31 directional edges. Each trigger fires first-order shocks; the BFS engine propagates them sector-by-sector with sector-specific lag, confidence, and circuit-breaker thresholds. Edge weights are data-calibrated — not authored — via event-conditional correlation analysis across 23 historical shock events using Yahoo Finance ETF return data. VIX is applied as a real-time cascade multiplier: same WAR_CONFLICT trigger produces different sector numbers at VIX 14 vs VIX 38. Already-priced-in dampening prevents double-counting sectors the market is already moving on today.', frontend: 'TypeScript in the Next.js app · D3 force-directed network graph (13 nodes, 31 edges) · live cascade overlay',
        backend: 'Next.js API route (TypeScript) · custom BFS propagation engine · yfinance-calibrated edge weights · VIX multiplier · priced-in dampening',
        why: 'The cascade is deterministic graph maths, not generative — so it lives in plain code for auditability and millisecond speed, and the edge weights are calibrated offline from 23 historical shocks rather than guessed. It runs in a Next.js API route so it is co-located with the site and instantly callable, with D3 rendering the propagation visually on the client.' },
      { name: 'Live Trigger Intelligence · RSS Engine', desc: 'Pulls BBC World, BBC Business, NYT World, and NYT Business RSS feeds every 15 minutes. Keyword-matches each headline to 6 shock categories (WAR_CONFLICT, OIL_SHOCK, RATE_HIKE, PANDEMIC, SUPPLY_CHAIN, MARKET_CRASH). Returns signal strength 0–1 and a real headline per trigger category — so every trigger card shows real news relevance, not a static label. ACTIVE badge fires when signal strength crosses threshold.', frontend: 'Trigger cards in the Next.js UI · live signal-strength dots + ACTIVE badge',
        backend: 'Next.js API route · BBC + NYT RSS · regex keyword engine · 15-min server cache · 6 shock categories',
        why: 'News must be live, but RSS feeds are slow and rate-sensitive, so fetching and keyword-matching happen server-side behind a 15-minute cache — the browser only renders the scored result. Server-side keeps the app within feed limits and avoids CORS, while the cache keeps it fast and polite to the sources.' },
      { name: 'Macro Intelligence Brief · Gemini Search Grounding', desc: 'Receives the full 13-sector cascade output (all sectors, with impact %, lag, confidence, and propagation mechanism) plus live market data. Google Search Grounding fires at inference time — Gemini searches the current web before writing, not its training data. The system instruction requires the model to cite at least two specific cascade sectors by percentage AND anchor each claim to a specific current real-world event. Output: 4-section plain-English brief, under 500 words, specific to one of 11 decision-maker personas. Not a generic macro summary — a personalised analytical report.', frontend: 'Brief panel in the Next.js UI · 11-persona selector · Scenario A/B toggle',
        backend: 'Next.js API route · Gemini 2.5 Flash · Google Search Grounding · temperature 0.4 · full cascade context injected',
        why: 'The brief must cite current real-world events, so Gemini runs with Google Search Grounding — and that has to happen server-side: the API key must never reach the browser, and the prompt carries the full 13-sector cascade plus live market data, which is too large and sensitive to expose client-side.' },
    ],
    metrics: [{ v: '4-layer', l: 'Pipeline depth' }, { v: '23', l: 'Calibration events' }, { v: '11', l: 'Briefing personas' }, { v: 'Live', l: 'Search-grounded output' }],
  },
  {
    id: 'DOMAIN_03',
    label: 'Insurance',
    color: '#7c4dff',
    status: 'LIVE',
    statusColor: '#00e676',
    href: '/insurance',
    problem: 'India processes over 250 million insurance claims annually. Adjusters spend 60% of their time reading FNOL attachments before making a single triage decision. Fraud patterns — early-inception claims, high-frequency claimants, over-valued amounts — surface only when you hold all signals together. Manual review processes them in isolation.',
    agents: [
      { name: 'Claims Triage Agent', desc: 'Takes six FNOL parameters — policy type, incident category, claim quantum, filing delay, prior claims history, and policy age — and runs them through a multi-signal fraud scoring engine. Outputs fraud risk (LOW to CRITICAL), coverage likelihood, triage priority (FAST_TRACK / STANDARD / INVESTIGATE / REFER_SIU), indicative settlement range, specific risk flags, and a three-paragraph adjuster narrative with recommended next action. Runs in under 10 seconds. No API calls — all inference is in-browser via a rule-based scoring engine calibrated against standard insurance underwriting heuristics.',
        frontend: 'React · TypeScript · single-page triage UI (FNOL inputs → adjuster brief)',
        backend: 'None — fraud scoring and triage logic run entirely in-browser; no API calls',
        why: 'Like the credit agent, triage scoring is deterministic and must be instant and private — so it runs client-side. FNOL claim data never leaves the browser, the adjuster brief returns in under 10 seconds, and there is no server to secure or pay for. The "product" is the calibrated scoring logic, not infrastructure.' },
    ],
    metrics: [{ v: '250M+', l: 'Claims filed in India / yr' }, { v: '₹45,000 Cr', l: 'Annual fraud losses (est.)' }, { v: '<10s', l: 'FNOL to triage brief' }, { v: '4', l: 'Triage priority levels' }],
  },
];

// ── Platform stack ──────────────────────────────────────────────────────────

const platformStack = [
  { layer: 'Framework', detail: 'Next.js 16.2 · App Router · React 19 · TypeScript 5', note: 'Static export where possible, dynamic API routes for LLM + market data' },
  { layer: 'Animation', detail: 'Framer Motion 12 · GSAP 3.15 + @gsap/react', note: 'Page transitions, scroll animations, marquee ticker, scramble text, section dividers' },
  { layer: 'Visualisation', detail: 'D3 7.9', note: 'Macro network force-directed graph — 13 nodes, 31 edges, BFS cascade overlay' },
  { layer: 'Styling', detail: 'CSS Custom Properties · Inline styles · Zero CSS frameworks', note: 'Design tokens in globals.css — all spacing, color, and typography via CSS vars' },
  { layer: 'LLM', detail: 'Google Gemini 2.5 Flash · Google Search Grounding', note: 'Persona briefs grounded in current real-world events via Google Search at inference time — 11 roles, 4 sections, <450 words' },
  { layer: 'Market Data', detail: 'Yahoo Finance API · open.exchangerate-api.com', note: '5-min cache on /api/market — VIX, WTI, S&P 500, USD/EUR, GOLD, 10Y UST. VIX drives cascade multiplier in real time.' },
  { layer: 'News Feed', detail: 'BBC World · BBC Business · NYT World · NYT Business RSS', note: '15-min cache on /api/triggers — keyword-matched to 6 shock categories, signal strength + live headline per trigger' },
  { layer: 'Custom Systems', detail: 'BFS Cascade Engine · Scramble text hook · Custom cursor · Fare analysis engine · SME credit scoring · Insurance claims triage scoring', note: 'All built from scratch — no third-party AI wrappers for domain logic' },
  { layer: 'Hosting', detail: 'Fly.io · GitHub', note: 'Three always-on services: s-ashwath.com (Next.js) · airwave.s-ashwath.com (Flask + Vue) · irops.s-ashwath.com (FastAPI + React). Singapore region. Env vars managed as Fly.io secrets.' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)', background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* ── HEADER ── */}
      <header style={{ padding: 'clamp(64px,8vw,100px) clamp(16px,4vw,48px) 48px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--txt-faint)', marginBottom: 20 }}>
          S-ASHWATH · <span style={{ color: 'var(--acc)' }}>TECHNICAL DOCUMENTATION</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 20, maxWidth: '18ch' }}>
          Use cases, agents,<br />and the stack behind them<span style={{ color: 'var(--acc)' }}>.</span>
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'var(--txt-dim)', maxWidth: '58ch', lineHeight: 1.6 }}>
          5 domains. Each one starts with a real problem in an industry where I have hands-on context. Each one ends with a working agent or system — built, validated, and live.
        </motion.p>
      </header>

      {/* ── DOMAIN SECTIONS ── */}
      {domains.map((d, di) => (
        <section key={d.id} style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 60px' }}>

          {/* Section header */}
          <motion.div custom={di * 0.1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 18, borderBottom: `1px solid ${d.color}22` }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: d.color, letterSpacing: '0.14em' }}>{d.id}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{d.label}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              padding: '3px 9px', borderRadius: 2,
              color: d.statusColor, border: `1px solid ${d.statusColor}44`,
              background: `${d.statusColor}0d`,
            }}>{d.status}</span>
            {d.href && (
              <Link href={d.href} style={{
                marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: d.color,
                border: `1px solid ${d.color}33`, padding: '4px 12px', borderRadius: 2,
                letterSpacing: '0.08em', transition: 'background 0.2s',
              }}>
                VIEW LIVE →
              </Link>
            )}
          </motion.div>

          {/* Problem statement */}
          <motion.p custom={di * 0.1 + 0.05} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
            style={{ fontSize: 'clamp(15px,1.7vw,18px)', fontWeight: 500, lineHeight: 1.65, color: 'var(--txt)', maxWidth: '62ch', marginBottom: 28, letterSpacing: '-0.01em' }}>
            {d.problem}
          </motion.p>

          {/* Pipeline architecture — DOMAIN_05 only */}
          {'pipeline' in d && Array.isArray((d as {pipeline?: unknown[]}).pipeline) && (
            <motion.div custom={di * 0.1 + 0.07} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', color: `${d.color}88`, marginBottom: 12 }}>
                // REPORT GENERATION PIPELINE — 4-LAYER ARCHITECTURE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: `1px solid ${d.color}20`, borderRadius: 6, overflow: 'hidden' }}>
                {((d as {pipeline: {step:string;label:string;src:string;detail:string}[]}).pipeline).map((step, si) => (
                  <div key={si} style={{
                    padding: '16px 14px',
                    borderRight: si < 3 ? `1px solid ${d.color}15` : 'none',
                    background: si % 2 ? `${d.color}03` : 'transparent',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: `${d.color}55`, letterSpacing: '0.1em' }}>{step.step}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: d.color, boxShadow: `0 0 5px ${d.color}`, display: 'inline-block' }} />
                      {si < 3 && (
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: `${d.color}40` }}>→</span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, color: d.color, letterSpacing: '0.07em', lineHeight: 1.35 }}>
                      {step.label}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em', lineHeight: 1.5 }}>
                      {step.src}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', lineHeight: 1.6 }}>
                      {step.detail}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Metrics strip */}
          <motion.div custom={di * 0.1 + 0.1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 28, border: '1px solid var(--border)' }}>
            {d.metrics.map((m, mi) => (
              <div key={mi} style={{ background: 'var(--surface)', padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 700, color: d.color, lineHeight: 1, marginBottom: 7 }}>{m.v}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--txt-faint)', lineHeight: 1.4 }}>{m.l}</div>
              </div>
            ))}
          </motion.div>

          {/* Agent cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.agents.map((agent, ai) => (
              <motion.div key={ai} custom={di * 0.1 + ai * 0.06 + 0.15} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
                style={{ background: 'var(--bg2)', border: `1px solid ${d.color}18`, borderRadius: 6, overflow: 'hidden' }}>
                {/* Agent header bar */}
                <div style={{ padding: '10px 18px', borderBottom: `1px solid ${d.color}14`, display: 'flex', alignItems: 'center', gap: 10, background: `${d.color}06` }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}`, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: d.color }}>{agent.name.toUpperCase()}</span>
                  {(agent as { repo?: string }).repo && (
                    <a href={(agent as { repo?: string }).repo} target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: d.color, border: `1px solid ${d.color}40`, padding: '3px 10px', borderRadius: 3, textDecoration: 'none', flexShrink: 0 }}>
                      GITHUB ↗
                    </a>
                  )}
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.65, marginBottom: 14 }}>{agent.desc}</p>

                  {/* Frontend / Backend split */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'min(120px,30%) 1fr', gap: '6px 10px', marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: d.color, paddingTop: 1 }}>FRONTEND</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', lineHeight: 1.55 }}>{agent.frontend}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: d.color, paddingTop: 1 }}>BACKEND</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', lineHeight: 1.55 }}>{agent.backend}</div>
                  </div>

                  {/* Why this architecture */}
                  <div style={{ paddingTop: 12, borderTop: `1px solid ${d.color}14` }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.12em', color: `${d.color}aa`, marginBottom: 6 }}>// WHY THIS ARCHITECTURE</div>
                    <p style={{ fontSize: 12.5, color: 'var(--txt-dim)', lineHeight: 1.65 }}>{agent.why}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {/* ── PLATFORM STACK ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 80px' }}>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
          style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--acc)', letterSpacing: '0.1em' }}>06</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>Portfolio Platform Stack</span>
          <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={viewport}
            transition={{ duration: 0.9, ease: [0.16,1,0.3,1] as [number,number,number,number], delay: 0.2 }}
            style={{ flex: 1, height: 1, background: 'var(--border)', transformOrigin: 'left', position: 'relative', top: -3 }} />
        </motion.div>

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
          style={{ fontSize: 15, color: 'var(--txt-dim)', maxWidth: '60ch', marginBottom: 24, lineHeight: 1.6 }}>
          The site itself is a demonstration of the same approach — built end-to-end, no design system, no component library, no shortcuts.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
          style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
          {platformStack.map((row, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewport}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16,1,0.3,1] as [number,number,number,number] }}
              whileHover={{ background: 'rgba(255,59,48,0.04)' }}
              style={{ display: 'grid', gridTemplateColumns: 'clamp(100px,18vw,180px) 1fr', borderBottom: i < platformStack.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}>
              <div style={{ padding: '18px 20px', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--acc)', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', paddingTop: 20 }}>
                {row.layer}
              </div>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--txt)', marginBottom: 5 }}>{row.detail}</div>
                <div style={{ fontSize: 13, color: 'var(--txt-faint)', lineHeight: 1.55 }}>{row.note}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── PHILOSOPHY NOTE ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 80px' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
          style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 'clamp(28px,4vw,44px)', background: 'rgba(255,255,255,0.015)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--acc)', letterSpacing: '0.16em', marginBottom: 16 }}>// BUILD PHILOSOPHY</div>
          <p style={{ fontSize: 'clamp(16px,1.9vw,20px)', fontWeight: 500, lineHeight: 1.6, color: 'var(--txt)', maxWidth: '52ch', marginBottom: 16 }}>
            Every system here was built to answer a real question — not to demonstrate a stack or pad a portfolio.
          </p>
          <p style={{ fontSize: 15, color: 'var(--txt-dim)', lineHeight: 1.7, maxWidth: '62ch', marginBottom: 24 }}>
            The constraint I imposed: no scaffolding, no off-the-shelf agents, no pre-built workflows. The value of building this way isn&apos;t the output — it&apos;s what you learn when the system breaks at 2am and there&apos;s nobody to call. That&apos;s when you find out what you actually know.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/"
              style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 22px', background: 'var(--acc)', color: '#fff', borderRadius: 3, transition: 'opacity 0.2s', display: 'inline-block' }}>
              ← All Domains
            </Link>
            <a href="mailto:rambotechnologies@gmail.com"
              style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 22px', background: 'transparent', color: 'var(--txt-dim)', border: '1px solid var(--border)', borderRadius: 3, transition: 'color 0.2s', display: 'inline-block' }}>
              Get in touch →
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 13 }}>S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH</div>
          <div style={{ display: 'flex', gap: 22, fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.06em', color: 'var(--txt-dim)' }}>
            <a href="mailto:rambotechnologies@gmail.com">EMAIL</a>
            <a href="https://www.linkedin.com/in/s-ashwathv" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
            <a href="https://github.com/Ashwath-VS" target="_blank" rel="noopener noreferrer">GITHUB</a>
            <Link href="/">ALL DOMAINS</Link>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', width: '100%', marginTop: 6 }}>
            // Technical Documentation · S. Ashwath · Operator-Builder · 5 Domains · 14 Agents
          </div>
        </div>
      </footer>
    </div>
  );
}
