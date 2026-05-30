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
    problem: 'TMCs are paid per transaction — rebooking costs them money. 94% of corporate bookings are never reviewed post-confirmation. The savings window opens and closes in silence.',
    agents: [
      { name: 'Fare Monitor · Alert Agent', desc: 'Scans GDS and NDC channels every 6 hours post-booking. Calculates gross savings, change fee, and net savings. Fires a rebook signal when the economics clear. Subscribe for $1 per booking.', stack: 'TypeScript · IATA route intelligence · fare analysis engine · NDC simulation' },
      { name: 'IRROP Rebooking Agent', desc: 'On flight cancellation or severe delay, surfaces rebooking alternatives proactively — before the passenger joins the manual queue. Scores options by urgency profile, fare protection, and loyalty tier priority queue access.', stack: 'TypeScript · carrier alliance inventory model · tier-based scoring engine' },
    ],
    metrics: [{ v: '34%', l: 'Bookings with cheaper fare at 30d' }, { v: '$1.2K', l: 'Avg recoverable savings long-haul' }, { v: '47m', l: 'Avg hold time vs <10s agent' }, { v: '18yr', l: 'Airline & GDS domain depth' }],
  },
  {
    id: 'DOMAIN_05',
    label: 'Macro Engine',
    color: '#ff9100',
    status: 'LIVE',
    statusColor: '#00e676',
    href: '/scenarios',
    problem: 'A rate hike hits equity markets, propagates to credit, flows into employment — but that chain is invisible to most decision-makers. Most briefings tell you what happened, not what to do about it.',
    agents: [
      { name: 'BFS Cascade Propagation Engine', desc: 'Breadth-first search across 13 sectors and 31 weighted directional edges. Each trigger propagates with sector-specific lag, confidence, and circuit-breaker thresholds. Seeded with live Yahoo Finance market data.', stack: 'TypeScript · custom BFS engine · 13 sectors · 31 edges · historical calibration' },
      { name: 'Strategic Intelligence Brief · Gemini', desc: 'Reads the full cascade output plus live market conditions, then generates a plain-English brief for one of 12 personas across 4 structured sections. Under 400 words. Actionable.', stack: 'Gemini 2.5 Flash · 12 personas · Yahoo Finance live data · persona-tailored prompts' },
    ],
    metrics: [{ v: '13', l: 'Sectors modelled' }, { v: '31', l: 'Directional edges' }, { v: '12', l: 'Briefing personas' }, { v: 'Live', l: 'Market data seeding' }],
  },
  {
    id: 'DOMAIN_03',
    label: 'Insurance',
    color: '#7c4dff',
    status: 'PLANNED',
    statusColor: '#ffb020',
    href: null,
    problem: 'Claims, underwriting, and risk workflows are document-heavy, rules-dense, and delay-prone. The same triangulation pattern from fin-tech applies — AI can compress the decision cycle.',
    agents: [
      { name: 'Claims Intelligence Agent', desc: 'In design. Will triage incoming claims against policy terms, flag anomalies, and generate a structured assessor brief with coverage determination and next-action recommendation.', stack: 'Planned · TypeScript · document parsing · policy rules engine' },
    ],
    metrics: [{ v: 'Next', l: 'Domain in the lab' }, { v: 'TBD', l: 'Agent count' }, { v: '—', l: '' }, { v: '—', l: '' }],
  },
];

// ── Platform stack ──────────────────────────────────────────────────────────

const platformStack = [
  { layer: 'Framework', detail: 'Next.js 16.2 · App Router · React 19 · TypeScript 5', note: 'Static export where possible, dynamic API routes for LLM + market data' },
  { layer: 'Animation', detail: 'Framer Motion 12 · GSAP 3.15 + @gsap/react', note: 'Page transitions, scroll animations, marquee ticker, scramble text, section dividers' },
  { layer: 'Visualisation', detail: 'D3 7.9', note: 'Macro network force-directed graph — 13 nodes, 31 edges, BFS cascade overlay' },
  { layer: 'Styling', detail: 'CSS Custom Properties · Inline styles · Zero CSS frameworks', note: 'Design tokens in globals.css — all spacing, color, and typography via CSS vars' },
  { layer: 'LLM', detail: 'Google Gemini 2.5 Flash · @google/generative-ai', note: 'Persona-tailored macro cascade briefs — 12 roles, 4 structured sections, <400 words' },
  { layer: 'Market Data', detail: 'Yahoo Finance API · FX rate feeds', note: '5-minute server-side cache on /api/market — VIX, WTI, S&P 500, USD/EUR, GOLD, 10Y UST' },
  { layer: 'Custom Systems', detail: 'BFS Cascade Engine · Scramble text hook · Custom cursor · Fare analysis engine · SME credit scoring', note: 'All built from scratch — no third-party AI wrappers for domain logic' },
  { layer: 'Hosting', detail: 'Netlify · GitHub', note: 'CI/CD via GitHub → Netlify. Env vars managed in Netlify dashboard.' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div style={{ paddingTop: 52, background: 'var(--bg)', minHeight: '100vh' }}>

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
            style={{ fontSize: 'clamp(16px,1.8vw,19px)', fontWeight: 500, lineHeight: 1.55, color: 'var(--txt)', maxWidth: '58ch', marginBottom: 32, letterSpacing: '-0.01em' }}>
            {d.problem}
          </motion.p>

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
            // Technical Documentation · S. Ashwath · Operator-Builder · 5 Domains · 11 Agents
          </div>
        </div>
      </footer>
    </div>
  );
}
