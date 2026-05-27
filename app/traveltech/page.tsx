'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IATA, analyseFare, buildFareFlags, buildFareNarrative, findOptions, irropDelayStr,
  type FareResult, type IrropResult,
} from '@/lib/travelAgent';

const TRV = '#00acc1';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }),
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3,
  color: 'var(--txt)', fontFamily: 'var(--mono)', fontSize: 13, padding: '10px 12px',
  outline: 'none', WebkitAppearance: 'none', appearance: 'none',
};

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 34 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: TRV, letterSpacing: '0.1em' }}>{idx}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>{title}</span>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative', top: -3, transformOrigin: 'left' }}
      />
    </motion.div>
  );
}

function FieldGroup({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--txt-dim)', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--acc)', marginTop: 4 }}>{error}</div>}
      {hint && !error && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function LoadBar({ color, messages }: { color: string; messages: string[] }) {
  const [msgIdx] = useState(0);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <div style={{ width: 200, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div animate={{ x: ['-100%', '0%', '100%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ height: '100%', width: '100%', background: color, borderRadius: 2 }} />
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>{messages[msgIdx]}</div>
    </div>
  );
}

// ── Fare Monitor Output ──────────────────────────────────────────────────────

function FareOutput({ result, email, phone, onReset }: { result: FareResult; email: string; phone: string; onReset: () => void }) {
  const [activated, setActivated] = useState(false);
  const flags = buildFareFlags(result);
  const narrative = buildFareNarrative(result);
  const rec = result.recommendation;
  const recColor = rec === 'REBOOK' ? TRV : rec === 'WATCH' ? 'var(--poc)' : 'var(--txt-dim)';
  const recBg = rec === 'REBOOK' ? 'rgba(0,172,193,0.08)' : rec === 'WATCH' ? 'rgba(255,176,32,0.08)' : 'rgba(82,91,107,0.12)';
  const recBorder = rec === 'REBOOK' ? 'rgba(0,172,193,0.3)' : rec === 'WATCH' ? 'rgba(255,176,32,0.3)' : 'var(--border)';
  const recIcon = rec === 'REBOOK' ? '▶' : rec === 'WATCH' ? '◉' : '◼';
  const fmt = (n: number) => '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
  const next = new Date(Date.now() + 6 * 3600000).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: TRV }}>// Fare Analysis · {result.origin}–{result.destination}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)' }}>{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[['Best Available', fmt(result.bestFare), 'var(--txt)'], ['Gross Savings', fmt(result.grossSavings), result.grossSavings > 0 ? TRV : 'var(--txt-faint)'], ['Change Fee Est.', fmt(result.changeFee), 'var(--txt-dim)'], ['Net Savings', fmt(result.netSavings), result.netSavings > 0 ? 'var(--live)' : 'var(--txt-faint)']].map(([l, v, c]) => (
          <div key={l} style={{ padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3 }}>
            <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 5 }}>{l}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, color: c }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.1em', padding: '12px 16px', borderRadius: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, background: recBg, border: `1px solid ${recBorder}`, color: recColor }}>
        {recIcon}&nbsp;&nbsp;{rec} · {result.signal.replace(/_/g, ' ')}
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 8 }}>// Intelligence Flags</div>
        {flags.map((f, i) => (
          <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-dim)', padding: '6px 0', borderBottom: i < flags.length - 1 ? '1px solid rgba(35,42,54,0.5)' : 'none', display: 'flex', gap: 8, lineHeight: 1.5 }}>
            <span style={{ color: TRV, flexShrink: 0 }}>▸</span><span>{f}</span>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 8 }}>// Analysis</div>
        {narrative.map((p, i) => <p key={i} style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.65, marginBottom: 11 }}>{p}</p>)}
      </div>
      <div style={{ marginTop: 18, padding: '16px 18px 18px', background: 'rgba(0,172,193,0.04)', border: '1px solid rgba(0,172,193,0.22)', borderRadius: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRV, boxShadow: `0 0 8px ${TRV}`, flexShrink: 0, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: TRV, fontWeight: 700 }}>MONITORING READY · {result.origin}–{result.destination} · {result.travelClass.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-dim)' }}>{phone ? `${email} · ${phone}` : email}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-dim)' }}>Scan every 6 hours · {result.days} days to departure</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-dim)' }}>Next scan: {next}</span>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActivated(true)} disabled={activated}
          style={{ width: '100%', padding: 12, background: activated ? 'var(--live)' : TRV, color: '#07090c', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: activated ? 'default' : 'pointer', transition: 'background 0.3s' }}>
          {activated ? '✓  Monitoring Active' : 'Activate Monitoring · $1'}
        </motion.button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', marginTop: 8, textAlign: 'center', lineHeight: 1.7 }}>One-time $1 per booking · Active until travel date · Cancel anytime</div>
      </div>
    </motion.div>
  );
}

// ── IRROP Output ─────────────────────────────────────────────────────────────

function IrropOutput({ result }: { result: IrropResult }) {
  const rankLabels = ['BEST OPTION', 'ALT 1', 'ALT 2'];
  const protColor = (p: string) => p === 'CONFIRMED' ? 'var(--live)' : p === 'WAITLIST' ? 'var(--poc)' : 'var(--txt-dim)';
  const tierImpact: Record<string, string> = {
    'Platinum': 'Platinum tier — priority queue active across own-carrier options (40% faster seat allocation), upgrade eligibility applied.',
    'Gold': 'Gold tier — priority queue active on own-carrier options (22% faster seat allocation), lounge access applied.',
    'Silver': 'Silver tier — standard queue, fare protection at mid-band.',
    'Non-member': 'No loyalty status — open-fare queue, lowest protection band.',
  };
  const urgencyNote: Record<string, string> = {
    'Must arrive today': 'High urgency — departure delay weighted heavily in scoring.',
    'Same day preferred': 'Moderate urgency — balance of delay and protection weighted.',
    'Flexible': 'Flexible arrival — protection quality weighted above departure speed.',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: TRV }}>// {result.disruptType} · {result.origin}–{result.destination}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)' }}>{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {result.opts.map((o, i) => {
          const isBest = i === 0;
          const routeStr = o.direct || !o.via ? 'Direct' : `Via ${o.via} · ${o.layover}m layover`;
          const scoreBar = Math.round(((o.score - 1) / 9) * 100);
          const drivers = [];
          if (o.direct) drivers.push('direct routing');
          if (o.priorityQ) drivers.push('priority queue access');
          if (o.protection === 'CONFIRMED') drivers.push('full fare protection');
          else if (o.protection === 'WAITLIST') drivers.push('waitlist protection');
          drivers.push(`+${irropDelayStr(o.delayH)} departure delay`);
          return (
            <div key={i} style={{ padding: '14px 16px', border: `1px solid ${isBest ? 'rgba(0,172,193,0.35)' : 'var(--border)'}`, borderRadius: 3, background: isBest ? 'rgba(0,172,193,0.03)' : 'var(--bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', fontWeight: 700, padding: '2px 8px', borderRadius: 2, background: isBest ? 'rgba(0,172,193,0.12)' : 'rgba(82,91,107,0.18)', color: isBest ? TRV : 'var(--txt-dim)' }}>{rankLabels[i]}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginLeft: 'auto' }}>{o.carrier}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)' }}>{o.score}/10</span>
              </div>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginBottom: 10, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${scoreBar}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  style={{ height: '100%', background: isBest ? TRV : 'var(--txt-faint)', borderRadius: 1 }} />
              </div>
              {[['Departure delay', `+${irropDelayStr(o.delayH)} vs scheduled`], ['Routing', routeStr], ['Fare protection', o.protection], ['Priority queue', o.priorityQ ? '✓ Yes — seat held' : '— Standard queue'], ['Upgrade eligible', o.upgradeElig ? '✓ On request' : '— Not eligible'], ['Lounge access', o.lounge ? '✓ Included' : '— Not applicable']].map(([k, v], j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: j < 5 ? '1px solid rgba(35,42,54,0.5)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', letterSpacing: '0.06em' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: k === 'Fare protection' ? protColor(v) : v.startsWith('✓') ? 'var(--live)' : 'var(--txt)', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', padding: '6px 0 2px', letterSpacing: '0.04em' }}>// {drivers.join(' · ')}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', padding: '12px 14px', background: 'rgba(0,172,193,0.04)', border: '1px solid rgba(0,172,193,0.12)', borderRadius: 3, lineHeight: 1.75 }}>
        <strong style={{ color: 'var(--txt)' }}>Ranking logic:</strong> Options scored by departure delay (penalised by urgency), routing directness, fare protection, and tier-based priority queue access. {urgencyNote[result.urgency]}<br /><br />
        <strong style={{ color: 'var(--txt)' }}>Tier impact:</strong> {tierImpact[result.tier]}<br /><br />
        NDC proactive push — options surfaced before you joined the manual rebooking queue. Average hold time on a disrupted route: 47 minutes. Agent resolution: under 10 seconds.
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TravelTechPage() {
  // Fare Monitor state
  const [fare, setFare] = useState({ origin: '', destination: '', travelClass: '', bookedFare: '', travelDate: '', email: '', phone: '' });
  const [fareErrs, setFareErrs] = useState<Record<string, string>>({});
  const [fareLoading, setFareLoading] = useState(false);
  const [fareResult, setFareResult] = useState<FareResult | null>(null);

  // IRROP state
  const [irrop, setIrrop] = useState({ origin: '', destination: '', disruptType: '', travelDate: '', tier: 'Non-member', pax: '1', urgency: '' });
  const [irropErrs, setIrropErrs] = useState<Record<string, string>>({});
  const [irropLoading, setIrropLoading] = useState(false);
  const [irropResult, setIrropResult] = useState<IrropResult | null>(null);

  const fld = (id: keyof typeof fare, val: string) => setFare(f => ({ ...f, [id]: val }));
  const ifd = (id: keyof typeof irrop, val: string) => setIrrop(f => ({ ...f, [id]: val }));

  const todayStr = new Date().toISOString().slice(0, 10);
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 400);
  const maxStr = maxDate.toISOString().slice(0, 10);

  const handleFareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const orig = fare.origin.toUpperCase(), dest = fare.destination.toUpperCase();
    if (!IATA.has(orig)) errs.origin = 'Unrecognised airport code';
    if (!IATA.has(dest)) errs.destination = 'Unrecognised airport code';
    if (!fare.travelClass) errs.travelClass = 'Required';
    if (!fare.bookedFare) errs.bookedFare = 'Required';
    else { const n = parseFloat(fare.bookedFare); if (isNaN(n) || n < 30 || n > 25000) errs.bookedFare = 'Must be $30–$25,000'; }
    if (!fare.travelDate) errs.travelDate = 'Required';
    else if (fare.travelDate < todayStr) errs.travelDate = 'Date cannot be in the past';
    if (!fare.email) errs.email = 'Required';
    setFareErrs(errs);
    if (Object.keys(errs).length) return;
    setFareLoading(true); setFareResult(null);
    setTimeout(() => {
      setFareResult(analyseFare(orig, dest, fare.travelClass, fare.bookedFare, fare.travelDate));
      setFareLoading(false);
    }, 1700 + Math.random() * 800);
  };

  const handleIrropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const orig = irrop.origin.toUpperCase(), dest = irrop.destination.toUpperCase();
    if (!IATA.has(orig)) errs.origin = 'Unrecognised airport code';
    if (!IATA.has(dest)) errs.destination = 'Unrecognised airport code';
    if (!irrop.disruptType) errs.disruptType = 'Required';
    if (!irrop.travelDate) errs.travelDate = 'Required';
    else if (irrop.travelDate < todayStr) errs.travelDate = 'Date cannot be in the past';
    if (!irrop.urgency) errs.urgency = 'Required';
    setIrropErrs(errs);
    if (Object.keys(errs).length) return;
    setIrropLoading(true); setIrropResult(null);
    setTimeout(() => {
      setIrropResult(findOptions(orig, dest, irrop.disruptType, irrop.tier, irrop.urgency));
      setIrropLoading(false);
    }, 1900 + Math.random() * 700);
  };

  return (
    <div style={{ paddingTop: 52 }}>

      {/* ── HEADER ── */}
      <header style={{ padding: '120px 48px 64px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--txt-faint)', marginBottom: 24 }}>
          S-ASHWATH / DOMAIN_04 / <span style={{ color: TRV }}>TRAVEL-TECH</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontWeight: 700, fontSize: 'clamp(34px, 5.5vw, 68px)', lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 26, maxWidth: '16ch' }}>
          The fare drop your<br />TMC will never<br />tell you about<span style={{ color: TRV, textShadow: '0 0 26px rgba(0,172,193,0.45)' }}>.</span>
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(16px, 1.9vw, 19px)', color: 'var(--txt-dim)', maxWidth: '60ch', lineHeight: 1.55 }}>
          Corporate travel management companies earn per transaction. <strong style={{ color: 'var(--txt)' }}>Rebooking costs them money.</strong> So when your fare drops 24% three weeks after booking, they stay silent — and the savings window closes.
        </motion.p>
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: 36, marginTop: 40, flexWrap: 'wrap' }}>
          {[['34%', 'Bookings with a cheaper fare at 30 days'], ['$1.2K', 'Avg recoverable savings · long-haul rebook'], ['2%', 'TMC spontaneous rebooking rate']].map(([v, l]) => (
            <div key={l}>
              <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                <span style={{ color: TRV }}>{v}</span>
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', display: 'block', marginTop: 7 }}>{l}</span>
            </div>
          ))}
        </motion.div>
      </header>

      {/* ── PROBLEM ── */}
      <section style={{ padding: '60px 48px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="01" title="The Problem" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[
            { tag: '// Incentive Misalignment', h: 'TMCs are paid to book, not to save', body: 'Every transaction generates a fee. Every rebook is overhead with no incremental revenue. A TMC that proactively monitors fares and reissues tickets is working against its own economics — and they know it.' },
            { tag: '// GDS Blind Spots', h: '~40% of fares are invisible to your TMC', body: 'Sabre, Amadeus, and Travelport surface published GDS fares only. NDC inventory from airlines, LCC direct fares, and consolidator rates exist entirely outside this pipeline. Your TMC cannot see them.' },
            { tag: '// Post-Booking Abandonment', h: 'After confirmation, the file closes', body: '94% of corporate itineraries are never reviewed after booking. Fares move — often 20–35% within the first two weeks. That window opens, the savings compound, and closes without a single notification.', highlight: true },
            { tag: '// The Compounding Cost', h: 'Small percentages, large numbers', body: '500 bookings/year at a $2,400 average long-haul fare. A 12% average overpayment is $144,000 annually — recoverable, unclaimed, and invisible in the quarterly MIS report your TMC sends you.' },
          ].map((c, i) => (
            <motion.div key={i} custom={i * 0.5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ padding: '28px 26px', background: 'var(--bg2)', border: `1px solid ${c.highlight ? 'rgba(0,172,193,0.28)' : 'var(--border)'}`, borderRadius: 4 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 12 }}>{c.tag}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, lineHeight: 1.3, color: c.highlight ? TRV : 'var(--txt)' }}>{c.h}</h3>
              <p style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.6 }}>{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MONITORING WINDOW TIMELINE ── */}
      <section style={{ padding: '60px 48px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="02" title="The Monitoring Window" />
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 36, maxWidth: '62ch' }}>
          A NYC→LHR business class booking at $4,200. What happened over 60 days while the TMC stayed silent.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ position: 'relative', minWidth: 580, padding: '0 24px' }}>
            <div style={{ position: 'absolute', top: 44, left: 44, right: 44, height: 1, background: `linear-gradient(to right, ${TRV} 0% 50%, var(--border) 50% 100%)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              {[
                { label: 'T−60', event: 'Booked', fare: '$4,200', delta: 'TMC confirms', state: '' },
                { label: 'T−45', event: 'Monitoring', fare: '$3,780', delta: '−10.0%', state: 'watch' },
                { label: 'T−32', event: 'Agent fires', fare: '$3,020', delta: '−28.1%', badge: 'REBOOK · $980 net', state: 'action' },
                { label: 'T−10', event: 'Too late', fare: '$4,890', delta: '+16.4%', state: 'late' },
                { label: 'T−0', event: 'Travelled', fare: '$3,020', delta: '$980 saved', state: 'done' },
              ].map((n, i) => {
                const dotColor = n.state === 'action' ? TRV : n.state === 'late' ? 'var(--acc)' : n.state === 'done' ? 'var(--live)' : n.state === 'watch' ? 'var(--poc)' : 'var(--border)';
                const labelColor = n.state === 'action' ? TRV : n.state === 'late' ? 'var(--acc)' : n.state === 'done' ? 'var(--live)' : n.state === 'watch' ? 'var(--poc)' : 'var(--txt-faint)';
                const deltaColor = n.delta.startsWith('−') || n.delta.includes('saved') ? (n.state === 'done' ? TRV : TRV) : n.delta.startsWith('+') ? 'var(--acc)' : 'var(--txt-faint)';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                    <div style={{ minHeight: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingBottom: 12, textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: labelColor }}>{n.label}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: labelColor }}>{n.event}</span>
                    </div>
                    <div style={{ width: n.state === 'action' ? 16 : 10, height: n.state === 'action' ? 16 : 10, borderRadius: '50%', background: n.state === 'action' ? TRV : n.state === 'done' ? 'var(--live)' : 'var(--bg)', border: `2px solid ${dotColor}`, boxShadow: n.state === 'action' ? `0 0 16px rgba(0,172,193,0.5)` : 'none', flexShrink: 0, position: 'relative', zIndex: 2 }} />
                    <div style={{ paddingTop: 14, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: n.state === 'done' ? 'var(--live)' : 'var(--txt)' }}>{n.fare}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: deltaColor }}>{n.delta}</span>
                      {n.badge && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, background: 'rgba(0,172,193,0.1)', border: '1px solid rgba(0,172,193,0.35)', color: TRV }}>{n.badge}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FARE MONITOR AGENT ── */}
      <section style={{ padding: '60px 48px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="03" title="Fare Monitor · Subscribe for Alerts" />
        <AgentShell title="FARE MONITOR · ALERT AGENT" badge="$1 / BOOKING" id="TRAVEL_A3 · DOMAIN_04">
          <div style={{ padding: '26px 28px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 20 }}>// Booking + Alert Details</div>
            <form onSubmit={handleFareSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <FieldGroup label="Origin IATA" error={fareErrs.origin}>
                  <input value={fare.origin} onChange={e => fld('origin', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. JFK" maxLength={3} style={{ ...inputStyle, borderColor: fareErrs.origin ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
                <FieldGroup label="Destination IATA" error={fareErrs.destination}>
                  <input value={fare.destination} onChange={e => fld('destination', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. LHR" maxLength={3} style={{ ...inputStyle, borderColor: fareErrs.destination ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
              </div>
              <FieldGroup label="Travel class" error={fareErrs.travelClass}>
                <select value={fare.travelClass} onChange={e => fld('travelClass', e.target.value)} style={{ ...inputStyle, borderColor: fareErrs.travelClass ? 'var(--acc)' : 'var(--border)' }}>
                  <option value="">Select class</option>
                  {['Economy', 'Premium Economy', 'Business', 'First'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Booked fare (per person)" hint="USD · $30–$25,000 per person" error={fareErrs.bookedFare}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--txt-faint)', pointerEvents: 'none' }}>$</span>
                  <input type="number" value={fare.bookedFare} onChange={e => fld('bookedFare', e.target.value)} placeholder="e.g. 3800" min={30} max={25000} style={{ ...inputStyle, paddingLeft: 24, borderColor: fareErrs.bookedFare ? 'var(--acc)' : 'var(--border)' }} />
                </div>
              </FieldGroup>
              <FieldGroup label="Travel date" error={fareErrs.travelDate}>
                <input type="date" value={fare.travelDate} onChange={e => fld('travelDate', e.target.value)} min={todayStr} max={maxStr} style={{ ...inputStyle, borderColor: fareErrs.travelDate ? 'var(--acc)' : 'var(--border)' }} />
              </FieldGroup>
              <FieldGroup label="Email for alerts" error={fareErrs.email}>
                <input type="email" value={fare.email} onChange={e => fld('email', e.target.value)} placeholder="you@company.com" style={{ ...inputStyle, borderColor: fareErrs.email ? 'var(--acc)' : 'var(--border)' }} />
              </FieldGroup>
              <FieldGroup label="Mobile for SMS (optional)">
                <input type="tel" value={fare.phone} onChange={e => fld('phone', e.target.value)} placeholder="+1 212 555 0100" style={inputStyle} />
              </FieldGroup>
              <motion.button type="submit" disabled={fareLoading} whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: 13, background: TRV, color: '#07090c', fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: fareLoading ? 'not-allowed' : 'pointer', opacity: fareLoading ? 0.4 : 1, marginTop: 4 }}>
                Check Fare + Subscribe · $1
              </motion.button>
            </form>
          </div>
          <div style={{ padding: '26px 28px', minHeight: 440, display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              {!fareLoading && !fareResult && (
                <motion.div key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 32, color: 'var(--txt-faint)', opacity: 0.3 }}>◈</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>Enter booking details and your email.<br />Free instant check · Subscribe for ongoing alerts.</div>
                </motion.div>
              )}
              {fareLoading && (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <LoadBar color={TRV} messages={['Checking GDS inventory on route...', 'Scanning NDC direct-fare channels...', 'Modelling reissue economics...', 'Generating rebook signal...']} />
                </motion.div>
              )}
              {fareResult && !fareLoading && (
                <FareOutput key="result" result={fareResult} email={fare.email} phone={fare.phone} onReset={() => setFareResult(null)} />
              )}
            </AnimatePresence>
          </div>
        </AgentShell>
      </section>

      {/* ── IRROP AGENT ── */}
      <section style={{ padding: '60px 48px 90px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="04" title="Disruption Rebooking Agent · IRROP" />
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 28, maxWidth: '62ch' }}>
          Flight cancelled or severely delayed. The average passenger waits 47 minutes on hold for a rebooking. An NDC-connected agent surfaces alternatives proactively — before you reach the queue.
        </motion.p>
        <AgentShell title="IRROP REBOOKING AGENT" badge="NDC · PROACTIVE" id="TRAVEL_A4 · DOMAIN_04">
          <div style={{ padding: '26px 28px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 20 }}>// Disruption Details</div>
            <form onSubmit={handleIrropSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <FieldGroup label="Origin IATA" error={irropErrs.origin}>
                  <input value={irrop.origin} onChange={e => ifd('origin', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. JFK" maxLength={3} style={{ ...inputStyle, borderColor: irropErrs.origin ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
                <FieldGroup label="Destination IATA" error={irropErrs.destination}>
                  <input value={irrop.destination} onChange={e => ifd('destination', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. LHR" maxLength={3} style={{ ...inputStyle, borderColor: irropErrs.destination ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
              </div>
              <FieldGroup label="Disruption type" error={irropErrs.disruptType}>
                <select value={irrop.disruptType} onChange={e => ifd('disruptType', e.target.value)} style={{ ...inputStyle, borderColor: irropErrs.disruptType ? 'var(--acc)' : 'var(--border)' }}>
                  <option value="">Select disruption</option>
                  {['Flight Cancelled', 'Delayed 2–4h', 'Delayed 4h+'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Scheduled departure date" error={irropErrs.travelDate}>
                <input type="date" value={irrop.travelDate} onChange={e => ifd('travelDate', e.target.value)} min={todayStr} max={maxStr} style={{ ...inputStyle, borderColor: irropErrs.travelDate ? 'var(--acc)' : 'var(--border)' }} />
              </FieldGroup>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <FieldGroup label="Loyalty tier">
                  <select value={irrop.tier} onChange={e => ifd('tier', e.target.value)} style={inputStyle}>
                    {['Non-member', 'Silver', 'Gold', 'Platinum'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Passengers">
                  <select value={irrop.pax} onChange={e => ifd('pax', e.target.value)} style={inputStyle}>
                    {['1','2','3','4','5','6'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>
              </div>
              <FieldGroup label="Arrival urgency" error={irropErrs.urgency}>
                <select value={irrop.urgency} onChange={e => ifd('urgency', e.target.value)} style={{ ...inputStyle, borderColor: irropErrs.urgency ? 'var(--acc)' : 'var(--border)' }}>
                  <option value="">Select urgency</option>
                  {['Must arrive today', 'Same day preferred', 'Flexible'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <motion.button type="submit" disabled={irropLoading} whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: 13, background: TRV, color: '#07090c', fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: irropLoading ? 'not-allowed' : 'pointer', opacity: irropLoading ? 0.4 : 1, marginTop: 4 }}>
                Find Rebooking Options
              </motion.button>
            </form>
          </div>
          <div style={{ padding: '26px 28px', minHeight: 440, display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              {!irropLoading && !irropResult && (
                <motion.div key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 32, color: 'var(--txt-faint)', opacity: 0.3 }}>◈</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>Enter disruption details.<br />Rebooking options surface in seconds.</div>
                </motion.div>
              )}
              {irropLoading && (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <LoadBar color={TRV} messages={['Checking alliance rebooking inventory...', 'Scanning partner carrier availability...', 'Verifying fare protection eligibility...', 'Ranking options by urgency profile...']} />
                </motion.div>
              )}
              {irropResult && !irropLoading && (
                <IrropOutput key="result" result={irropResult} />
              )}
            </AnimatePresence>
          </div>
        </AgentShell>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px 48px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 13 }}>S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH</div>
          <div style={{ display: 'flex', gap: 22, fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.06em', color: 'var(--txt-dim)' }}>
            <a href="mailto:rambotechnologies@gmail.com">EMAIL</a>
            <a href="https://www.linkedin.com/in/s-ashwathv" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
            <Link href="/">ALL DOMAINS</Link>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', width: '100%', marginTop: 6 }}>// Travel-Tech · DOMAIN_04 · AI for corporate fare optimization · 18 years airline &amp; GDS</div>
        </div>
      </footer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

function AgentShell({ title, badge, id, children }: { title: string; badge: string; id: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      style={{ border: `1px solid rgba(0,172,193,0.22)`, borderRadius: 6, overflow: 'hidden', background: 'var(--bg2)' }}>
      <div style={{ padding: '15px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--txt-dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRV, boxShadow: `0 0 8px ${TRV}`, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, background: 'rgba(0,172,193,0.12)', border: '1px solid rgba(0,172,193,0.28)', color: TRV, padding: '3px 10px', borderRadius: 2, letterSpacing: '0.08em' }}>{badge}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>// {id}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr' }}>
        {children}
      </div>
    </motion.div>
  );
}
