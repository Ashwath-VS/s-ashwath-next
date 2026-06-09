'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const TRV = '#00acc1';
const SQ = '#ff7043';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 34 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: TRV, letterSpacing: '0.1em' }}>{idx}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>{title}</span>
      <motion.span
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        style={{ flex: 1, height: 1, background: 'var(--border)', transformOrigin: 'left' }}
      />
    </motion.div>
  );
}

export default function TravelTechPage() {
  const isMobile = useIsMobile();

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>

      {/* ── HEADER ── */}
      <header style={{ padding: 'clamp(72px,10vw,120px) clamp(16px,4vw,48px) 64px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--txt-faint)', marginBottom: 24 }}>
          S-ASHWATH / DOMAIN_04 / <span style={{ color: TRV }}>TRAVEL-TECH</span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontWeight: 700, fontSize: 'clamp(32px, 5.2vw, 64px)', lineHeight: 0.97, letterSpacing: '-0.03em', marginBottom: 26, maxWidth: '18ch' }}>
          AirWave<br />Fare Scenario<br />Intelligence<span style={{ color: TRV, textShadow: '0 0 26px rgba(0,172,193,0.45)' }}>.</span>
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'var(--txt-dim)', maxWidth: '62ch', lineHeight: 1.6 }}>
          Pick a route, pick a macro shock. AirWave pulls live fares, runs a deterministic P&L cascade, then dispatches 8 independent AI market agents — each with a fixed behavioral profile, fuel hedge position, and market share weight. Their votes are share-weighted into a consensus fare prediction with a confidence band.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: isMobile ? 24 : 44, marginTop: 42, flexWrap: 'wrap' }}>
          {[
            ['8',   'Market agents · LCC · Legacy · ULCC · Premium · OTA · …'],
            ['7',   'Shock triggers · Fuel · Rate · Demand · Weather · News · …'],
            ['26',  'Tests passing · API validation · cascade · rate limiter'],
          ].map(([v, l]) => (
            <div key={l}>
              <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, lineHeight: 1, color: TRV }}>{v}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', display: 'block', marginTop: 7 }}>{l}</span>
            </div>
          ))}
        </motion.div>
      </header>

      {/* ── AIRWAVE CASE STUDY ── */}
      <section style={{ padding: '20px clamp(16px,4vw,48px) 100px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="01" title="Fare Scenario Intelligence" />

        {/* Positioning */}
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 14, maxWidth: '68ch', lineHeight: 1.7 }}>
          A standalone product that wires domain knowledge to live data and real AI reasoning. The static demos on most portfolio pages show a form and a response. AirWave shows a pipeline: live fares, a deterministic cascade model, 8 agents with distinct positions, and a weighted consensus.
        </motion.p>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 14, color: 'var(--txt-faint)', marginBottom: 40, maxWidth: '64ch', lineHeight: 1.65 }}>
          Stack multiple shock triggers for compounded scenarios. Compare two routes side-by-side with a winner verdict. Rate-limited API, simulation history, methodology panel, PDF export. Open-sourced on GitHub under AGPL-3.0.
        </motion.p>

        {/* Stats row */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, background: 'var(--border)', overflow: 'hidden', marginBottom: 32 }}>
          {[
            { val: '8',    label: 'Market Agents',  sub: 'LCC · Legacy · ULCC · OTA · Premium · demand-side' },
            { val: '7',    label: 'Shock Triggers',  sub: 'Fuel · Rate · Demand · Capacity · Weather · Route · News' },
            { val: '26',   label: 'Tests',           sub: 'API validation · cascade model · rate limiter' },
            { val: '5',    label: 'Live Sources',    sub: 'Duffel NDC · OpenSky · Yahoo Finance · SerpApi · News RSS' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', padding: '20px 22px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, color: TRV, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600, color: 'var(--txt)', marginTop: 7, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', letterSpacing: '0.03em', lineHeight: 1.5 }}>{s.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Pipeline */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--txt-faint)', marginBottom: 16 }}>// PREDICTION PIPELINE · 4 STAGES</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? 0 : 1, background: 'var(--border)', overflow: 'hidden' }}>
            {[
              { step: '01', title: 'Live Data Ingestion',  desc: 'Duffel NDC fares · OpenSky demand · Open-Meteo weather · Yahoo Finance WTI + FX · Google News RSS. Unavailable sources fall back to synthetic, clearly labeled.' },
              { step: '02', title: 'Shock Cascade',         desc: 'Deterministic BFS across 6 P&L nodes — fuel cost, crew, maintenance, slot fees, hedging, yield. No LLM. Auditable in the cascade panel below results.' },
              { step: '03', title: 'Agent Reasoning',       desc: '8 participants receive the same live seed and cascade output. Each produces a fare vote and confidence score based on their profile and hedge position.' },
              { step: '04', title: 'Consensus Forecast',    desc: 'Votes weighted by market share — Legacy 42%, LCC 28%, ULCC 12%, Premium 7% — averaged into a predicted fare with a ±prediction band.' },
            ].map(s => (
              <div key={s.step} style={{ background: 'var(--surface)', padding: '20px 22px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'rgba(0,172,193,0.22)', lineHeight: 1, marginBottom: 10 }}>{s.step}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--txt)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.title}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-dim)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 8 Agents */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--txt-faint)', marginBottom: 16 }}>// 8 MARKET AGENTS · EACH REASONS INDEPENDENTLY</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { tag: 'LCC Revenue Manager',      who: 'Ryanair · easyJet · Spirit · IndiGo',                    hedge: '5%',  share: '28%', signal: 'Sets the market price floor. Raises fares within 48h of any cost shock, unhedged.' },
              { tag: 'Legacy Network Carrier',    who: 'British Airways · Delta · Lufthansa',                    hedge: '75%', share: '42%', signal: 'Follows LCC pricing 7–14 days later. Protects business class yield above leisure.' },
              { tag: 'ULCC Revenue Manager',      who: 'Wizz Air · Frontier · Allegiant',                        hedge: '0%',  share: '12%', signal: 'Fastest reactor — moves within 24h. Slashes base fare, recovers via ancillaries.' },
              { tag: 'Premium Boutique Airline',  who: 'Emirates Business · Singapore Suites · Finnair Premium', hedge: '90%', share: '7%',  signal: 'Never matches LCC discounting. Adds product value instead of cutting fares.' },
              { tag: 'Enterprise Travel Manager', who: 'Fortune 500 procurement · $40M+ annual budgets',         hedge: null,  share: null,  signal: 'Switches carrier when price delta exceeds 12%. Books 45–60 days in advance.' },
              { tag: 'Price-Elastic Consumer',    who: 'Vacation traveler · Google Flights · flexible dates',    hedge: null,  share: null,  signal: 'A 20% fare hike cuts booking probability 35%. Books last-minute when prices drop.' },
              { tag: 'Online Travel Agency',      who: 'Expedia · Booking.com · Google Flights aggregators',     hedge: null,  share: null,  signal: 'Re-ranks cheaper alternatives immediately. Fires price alerts to 50M+ users.' },
              { tag: 'Miles Optimizer',           who: 'Loyalty power user · 200K-follower award-travel blog',   hedge: null,  share: null,  signal: 'Triggers award search above +10% cash fare. Broadcasts to a large audience.' },
            ].map(a => (
              <div key={a.tag} style={{ border: '1px solid var(--border)', padding: '14px 16px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--txt)', letterSpacing: '0.03em', lineHeight: 1.3 }}>{a.tag}</span>
                  {a.hedge !== null && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', background: 'rgba(0,172,193,0.08)', border: '1px solid rgba(0,172,193,0.22)', color: TRV }}>⛽ {a.hedge}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--txt-faint)' }}>◈ {a.share}</span>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--txt-faint)', marginBottom: 7 }}>{a.who}</div>
                <div style={{ fontSize: 12, color: 'var(--txt-dim)', lineHeight: 1.6 }}>{a.signal}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sample terminal output */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--txt-dim)', lineHeight: 1.95, marginBottom: 28, overflowX: 'auto' }}>
          <div style={{ color: 'var(--txt-faint)', fontSize: 9.5, letterSpacing: '0.14em', marginBottom: 12 }}>// SAMPLE OUTPUT · LHR → JFK · FUEL_SPIKE + DISRUPTION_EVENT · STANDARD DEPTH</div>
          <div><span style={{ color: TRV }}>Route:</span> LHR → JFK &nbsp;·&nbsp; <span style={{ color: TRV }}>Trip:</span> Round-trip &nbsp;·&nbsp; <span style={{ color: TRV }}>Seed fare:</span> $2,140 &nbsp;·&nbsp; <span style={{ color: TRV }}>Predicted:</span> $2,448 <span style={{ color: '#ef5350' }}>(+14.4%)</span></div>
          <div><span style={{ color: TRV }}>Consensus:</span> <span style={{ color: '#ef5350' }}>strong_raise</span> &nbsp;·&nbsp; <span style={{ color: TRV }}>Confidence:</span> 87% &nbsp;·&nbsp; <span style={{ color: TRV }}>T+</span>5 days &nbsp;·&nbsp; <span style={{ color: TRV }}>Band:</span> $2,290–$2,590</div>
          <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
            <div><span style={{ color: 'rgba(0,172,193,0.7)' }}>LCC RM (28% share):</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; raise_fares +17% — Fuel +22% on CASK, unhedged. Disruption shrinks slot availability.</div>
            <div><span style={{ color: 'rgba(0,172,193,0.7)' }}>Legacy RM (42% share):</span>&nbsp;&nbsp;&nbsp; raise_fares +13% — 75% hedged short-term. Corporate contracts hold floor at +11%.</div>
            <div><span style={{ color: 'rgba(0,172,193,0.7)' }}>ULCC RM (12% share):</span>&nbsp;&nbsp;&nbsp;&nbsp; raise_fares +19% — Zero hedge. Slot loss compounds. Ancillary recovery in 48h.</div>
            <div><span style={{ color: 'rgba(0,172,193,0.7)' }}>Premium Boutique (7%):</span>&nbsp; hold_price  +0%  — 90% hedged. Adding lounge upgrade offer instead.</div>
            <div><span style={{ color: 'rgba(0,172,193,0.7)' }}>Corp Buyer (demand):</span>&nbsp;&nbsp;&nbsp;&nbsp; delay_booking   — +14.4% exceeds 12% policy threshold. Carrier switch likely.</div>
          </div>
        </motion.div>

        {/* Feature chips */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
          {[
            'Rate-limited API · 5 req/60s',
            'Comparison mode · Scenario A vs B',
            'Simulation history · localStorage ring buffer',
            'Methodology panel · 3-tab drawer',
            'Stacked shocks · multi-trigger',
            'PDF export',
            'AGPL-3.0 · open source',
          ].map(f => (
            <span key={f} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '4px 11px', border: '1px solid var(--border)', color: 'var(--txt-faint)', letterSpacing: '0.03em' }}>{f}</span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {process.env.NEXT_PUBLIC_AIRWAVE_URL && (
            <a
              href={process.env.NEXT_PUBLIC_AIRWAVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '12px 24px', background: TRV, color: '#07090c',
                fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                borderRadius: 3, textDecoration: 'none',
              }}
            >
              ◈ Launch AirWave ↗
            </a>
          )}
          <a
            href="https://github.com/Ashwath-VS/airwave"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 24px',
              background: process.env.NEXT_PUBLIC_AIRWAVE_URL ? 'transparent' : TRV,
              color: process.env.NEXT_PUBLIC_AIRWAVE_URL ? TRV : '#07090c',
              border: process.env.NEXT_PUBLIC_AIRWAVE_URL ? `1px solid rgba(0,172,193,0.35)` : 'none',
              fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              borderRadius: 3, textDecoration: 'none',
            }}
          >
            View on GitHub ↗
          </a>
          <a
            href="https://github.com/Ashwath-VS/airwave#quick-start"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 22px', background: 'transparent',
              border: `1px solid rgba(0,172,193,0.35)`,
              color: TRV, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRadius: 3, textDecoration: 'none',
            }}
          >
            Run locally →
          </a>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', lineHeight: 1.7 }}>
            Flask + Vue 3 · Gemini 2.5 Flash · AGPL-3.0<br />
            <span style={{ opacity: 0.55 }}>git clone · pip install · npm install · python run.py</span>
          </div>
        </motion.div>
      </section>

      {/* ── SQUALL CASE STUDY ── */}
      <section style={{ padding: '20px clamp(16px,4vw,48px) 100px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 34 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: SQ, letterSpacing: '0.1em' }}>02</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>SQUALL.IROPS · Disruption Intelligence</span>
          <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
            style={{ flex: 1, height: 1, background: 'var(--border)', transformOrigin: 'left' }} />
        </motion.div>

        {/* Title + positioning */}
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontWeight: 700, fontSize: 'clamp(26px, 4vw, 44px)', lineHeight: 1.02, letterSpacing: '-0.02em', marginBottom: 18 }}>
          SQUALL.IROPS — predict the disruption<br /><span style={{ color: SQ, textShadow: '0 0 26px rgba(255,112,67,0.4)' }}>before</span> the airline does.
        </motion.h2>

        {/* Money headline */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 22, padding: '16px 20px', border: `1px solid rgba(255,112,67,0.3)`, borderLeft: `3px solid ${SQ}`, background: 'rgba(255,112,67,0.05)', borderRadius: 4 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700, color: SQ, lineHeight: 1 }}>~$13K</span>
          <span style={{ fontSize: 13.5, color: 'var(--txt-dim)', lineHeight: 1.6, maxWidth: '54ch' }}>
            estimated value per at-risk flight — disruption cost avoided by acting early, plus a new
            ancillary revenue stream from a purchasable protection fee (modelled on Air Canada&rsquo;s &ldquo;On My Way&rdquo;).
            Across a network, that compounds across every departure.
          </span>
        </motion.div>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 14, maxWidth: '68ch', lineHeight: 1.7 }}>
          Where AirWave models revenue under pressure, Squall models <strong style={{ color: 'var(--txt)' }}>operations</strong> under pressure.
          When a storm, ATC slowdown, or congestion event hits, airlines lose $150K–$500K per disrupted wide-body rotation — not from the
          cancellation itself, but from the slow, siloed recovery. Squall compresses that lag with three coordinated agents.
        </motion.p>
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 14, color: 'var(--txt-faint)', marginBottom: 40, maxWidth: '64ch', lineHeight: 1.65 }}>
          Enter an origin–destination pair. Squall fans out to live weather, disruption-news, and air-traffic feeds at both endpoints
          concurrently, runs a deterministic risk cascade, scores every real flight on the route, then drafts proactive passenger outreach —
          a forward-looking signal, not a FlightAware-style after-the-fact status.
        </motion.p>

        {/* Stats row */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, background: 'var(--border)', overflow: 'hidden', marginBottom: 32 }}>
          {[
            { val: '3',     label: 'Agents',        sub: 'Predictor · Communicator · Optimizer (preview)' },
            { val: '5',     label: 'Live Sources',  sub: 'Open-Meteo · OpenSky · SerpAPI Flights + News · Gemini' },
            { val: '28k+',  label: 'Airports',      sub: 'Global coverage — busiest hub to Tier-3 regional' },
            { val: '0',     label: 'Static Values', sub: 'Every number recomputed live, per request' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', padding: '20px 22px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 30, fontWeight: 700, color: SQ, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600, color: 'var(--txt)', marginTop: 7, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', letterSpacing: '0.03em', lineHeight: 1.5 }}>{s.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* 3 Agents */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--txt-faint)', marginBottom: 16 }}>// THREE COORDINATED AGENTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', overflow: 'hidden' }}>
            {[
              { step: 'PREDICTOR', live: 'LIVE', desc: 'Deterministic cascade — no LLM in the math. Normalises live weather, disruption-news, and traffic-density signals into declared 0–100 sub-scores, weight-blends them (renormalising over whatever is available), then compounds across both endpoints.' },
              { step: 'COMMUNICATOR', live: 'LIVE', desc: 'Synthetic passenger personas grounded in the real flight profile; Gemini drafts a tailored, proactive rebooking message per persona. Passenger identities are never real — in production this binds to the carrier PNR/DCS feed.' },
              { step: 'OPTIMIZER', live: 'PREVIEW', desc: 'Architecture preview. Production recovery requires an OR solver balancing aircraft availability, crew-legality, and passenger recovery — the layer where most IROPS projects actually fail. Honestly scoped, not faked.' },
            ].map(s => (
              <div key={s.step} style={{ background: 'var(--surface)', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--txt)', letterSpacing: '0.04em' }}>{s.step}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, padding: '2px 7px', border: `1px solid ${s.live === 'LIVE' ? 'rgba(76,175,80,0.4)' : 'var(--border)'}`, color: s.live === 'LIVE' ? '#4caf50' : 'var(--txt-faint)', letterSpacing: '0.08em' }}>{s.live}</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-dim)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Honest scoping */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ borderLeft: `2px solid ${SQ}`, background: 'rgba(255,112,67,0.06)', padding: '16px 20px', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: SQ, marginBottom: 8 }}>// HONESTY IS THE FEATURE</div>
          <div style={{ fontSize: 13.5, color: 'var(--txt-dim)', lineHeight: 1.7, maxWidth: '70ch' }}>
            Everything operationally measurable is live and recomputed per request — weather and traffic work for any airport on earth;
            news and flight density are richer at major hubs, and the score renormalises over whatever signals are available at regional fields.
            Only passenger identities are synthetic, declared openly. That boundary — live where it can be, simulated only where it must be —
            is what separates a credible advisory tool from an AI black box.
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <a href={process.env.NEXT_PUBLIC_SQUALL_URL || 'https://irops.s-ashwath.com'} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: SQ, color: '#0a0b0d', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none' }}>
            ◈ Launch SQUALL.IROPS ↗
          </a>
          <a href="https://github.com/Ashwath-VS/squall" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', background: 'transparent', color: SQ, border: `1px solid rgba(255,112,67,0.35)`, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none' }}>
            View on GitHub ↗
          </a>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', lineHeight: 1.7 }}>
            FastAPI (async) · React + Vite + TypeScript<br />
            <span style={{ opacity: 0.55 }}>concurrent live fan-out · deterministic cascade · auto OpenAPI docs</span>
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
            <Link href="/docs">DOCS</Link>
            <Link href="/experience">EXPERIENCE</Link>
            <Link href="/">ALL DOMAINS</Link>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', width: '100%', marginTop: 6, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>// Travel-Tech · DOMAIN_04 · AirWave (revenue) + Squall (operations) · live data · open source</span>
            <Link href="/scenarios" style={{ color: 'inherit', textDecoration: 'none' }}>Next: Macro Engine →</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
