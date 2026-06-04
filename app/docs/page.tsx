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
      { name: 'Autonomous Content Engine', desc: 'Batch LLM processing across 9,300 SKUs — staged apply/rollback with per-batch locks. Runs nightly, unattended.', stack: 'Python · Gemini Flash · MySQL · cron' },
      { name: 'Conversational Storefront Assistant', desc: 'Buyer Q&A in plain language. Worked around the commerce engine stripping JS via a server-level injection layer.', stack: 'Claude · JavaScript · PHP endpoints' },
      { name: 'Buyer Intelligence Tool', desc: 'Location-aware recommendation engine — surfaces parts relevant to a regional market from a sprawling catalog.', stack: 'Claude · location lookup · rule layer' },
      { name: 'Vendor Intelligence Dashboard', desc: 'Financial-terminal-style demand dashboard with live heatmaps across 15 regional markets + LLM demand reports on request.', stack: 'JavaScript · Claude · rule engine · real-time UI' },
      { name: 'Product Imagery Studio', desc: 'Bulk image-generation pipeline with dual-model A/B (Gemini vs GPT Image) and live cost tracking per batch.', stack: 'Python · Gemini Flash Image · GPT Image · batch pipeline' },
      { name: 'Commerce Integration Layer', desc: 'Payments, logistics, transactional email, order messaging, and government-API vendor verification wired as one.', stack: 'Payments · logistics · SMTP · messaging API · gov APIs' },
      { name: 'Infrastructure & Safety Layer', desc: 'Linux admin, CDN/WAF, automated nightly backups, and a written ops runbook. The rules are the real product.', stack: 'Linux · CDN/WAF · automated backups · ops runbook' },
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
      { name: 'SME Credit Analyst Agent', desc: 'Triangulates GST annual turnover, 12-month bank credits, and ITR declared income. Applies underwriting scoring logic and generates a structured credit narrative with risk flags and recommended limit range. Runs in under 10 seconds.', stack: 'TypeScript · React · rule-based triangulation engine · inline scoring logic' },
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
    problem: 'Revenue management software on the airline side costs millions. A passenger booking LHR→JFK has no tools to model what a fuel spike, route disruption, or geopolitical event will do to fares over the following week. AirWave inverts this: pull live fares, run a deterministic P&L cascade model, deploy 8 independent market agents each with a fixed behavioral profile and fuel hedge position, then weight their votes by market share into a consensus fare prediction with a confidence band. Open-source under AGPL-3.0.',
    agents: [
      {
        name: 'AirWave · Fare Scenario Intelligence Engine',
        desc: '8 market agents (LCC Revenue Manager, Legacy Network Carrier, ULCC Revenue Manager, Premium Boutique, Enterprise Travel Manager, Price-Elastic Consumer, Online Travel Agency, Miles Optimizer) each receive live fare data, a cascaded P&L shock output, and their own behavioral profile. Each produces an independent fare vote and confidence score. Votes are market-share-weighted (Legacy 42%, LCC 28%, ULCC 12%, Premium 7%) into a consensus predicted fare with a ±band. Stack multiple shock triggers for compounded scenarios. A/B comparison mode for two concurrent runs. Rate-limited Flask API (5 req/60s). Simulation history in localStorage. PDF export. Open-source on GitHub.',
        stack: 'Vue 3 Composition API · Flask · Python · Gemini 2.5 Flash · Duffel NDC · OpenSky · Yahoo Finance · SerpAPI · News RSS · AGPL-3.0',
      },
    ],
    metrics: [{ v: '8', l: 'Independent market agents' }, { v: '7', l: 'Shock triggers modelled' }, { v: '5', l: 'Live data sources' }, { v: '26', l: 'Tests passing' }],
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
      { name: 'BFS Cascade Propagation Engine', desc: 'Breadth-first search across 13 sectors and 31 directional edges. Each trigger fires first-order shocks; the BFS engine propagates them sector-by-sector with sector-specific lag, confidence, and circuit-breaker thresholds. Edge weights are data-calibrated — not authored — via event-conditional correlation analysis across 23 historical shock events using Yahoo Finance ETF return data. VIX is applied as a real-time cascade multiplier: same WAR_CONFLICT trigger produces different sector numbers at VIX 14 vs VIX 38. Already-priced-in dampening prevents double-counting sectors the market is already moving on today.', stack: 'TypeScript · custom BFS engine · 13 sectors · 31 edges · yfinance-calibrated weights · VIX multiplier · priced-in dampening' },
      { name: 'Live Trigger Intelligence · RSS Engine', desc: 'Pulls BBC World, BBC Business, NYT World, and NYT Business RSS feeds every 15 minutes. Keyword-matches each headline to 6 shock categories (WAR_CONFLICT, OIL_SHOCK, RATE_HIKE, PANDEMIC, SUPPLY_CHAIN, MARKET_CRASH). Returns signal strength 0–1 and a real headline per trigger category — so every trigger card shows real news relevance, not a static label. ACTIVE badge fires when signal strength crosses threshold.', stack: 'TypeScript · BBC RSS · NYT RSS · regex keyword engine · 15-min server cache · 6 shock categories' },
      { name: 'Macro Intelligence Brief · Gemini Search Grounding', desc: 'Receives the full 13-sector cascade output (all sectors, with impact %, lag, confidence, and propagation mechanism) plus live market data. Google Search Grounding fires at inference time — Gemini searches the current web before writing, not its training data. The system instruction requires the model to cite at least two specific cascade sectors by percentage AND anchor each claim to a specific current real-world event. Output: 4-section plain-English brief, under 500 words, specific to one of 11 decision-maker personas. Not a generic macro summary — a personalised analytical report.', stack: 'Gemini 2.5 Flash · Google Search Grounding · temperature 0.4 · 11 personas · full cascade context · live market data' },
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
      { name: 'Claims Triage Agent', desc: 'Takes six FNOL parameters — policy type, incident category, claim quantum, filing delay, prior claims history, and policy age — and runs them through a multi-signal fraud scoring engine. Outputs fraud risk (LOW to CRITICAL), coverage likelihood, triage priority (FAST_TRACK / STANDARD / INVESTIGATE / REFER_SIU), indicative settlement range, specific risk flags, and a three-paragraph adjuster narrative with recommended next action. Runs in under 10 seconds. No API calls — all inference is in-browser via a rule-based scoring engine calibrated against standard insurance underwriting heuristics.', stack: 'TypeScript · React · rule-based fraud scoring · FNOL triage engine · inline adjuster narrative' },
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
  { layer: 'Hosting', detail: 'Netlify · GitHub', note: 'CI/CD via GitHub → Netlify. Env vars managed in Netlify dashboard.' },
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
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.65, marginBottom: 10 }}>{agent.desc}</p>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)' }}>
                    <span style={{ color: d.color, marginRight: 6 }}>STACK:</span>{agent.stack}
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
            <Link href="/">ALL DOMAINS</Link>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', width: '100%', marginTop: 6 }}>
            // Technical Documentation · S. Ashwath · Operator-Builder · 5 Domains · 13 Agents
          </div>
        </div>
      </footer>
    </div>
  );
}
