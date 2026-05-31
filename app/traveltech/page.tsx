'use client';

import Link from 'next/link';
import { useState, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  AIRLINE_NODES, AIRLINE_TRIGGERS, LAYER_ORDER, LAYER_LABELS, nodesInLayer,
  runAirlineCascade,
  type AirlineNodeId, type TriggerId, type AirlineImpact,
} from '@/lib/airlineData';
import {
  IATA, analyseFare, buildFareFlags, buildFareNarrative, findOptions, irropDelayStr,
  type FareResult, type IrropResult,
} from '@/lib/travelAgent';

const TRV = '#00acc1';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3,
  color: 'var(--txt)', fontFamily: 'var(--mono)', fontSize: 13, padding: '10px 12px',
  outline: 'none', WebkitAppearance: 'none', appearance: 'none',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function impactDisplay(impact: number, isRevenueSide: boolean) {
  const pct = Math.round(Math.abs(impact * 100));
  const sign = impact >= 0 ? '+' : '−';
  const adverse = isRevenueSide ? impact < 0 : impact > 0;
  const color = pct < 3 ? 'var(--txt-faint)' : adverse ? 'var(--acc)' : 'var(--live)';
  return { label: `${sign}${pct}%`, color, adverse };
}

function parseBrief(text: string) {
  return text
    .split('\n')
    .filter(l => l.trim().length > 0)
    .map(line => ({
      type: line.startsWith('## ') ? 'header' as const : 'para' as const,
      content: line.replace(/^##\s+/, '').replace(/\*\*/g, '').trim(),
    }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function AgentShell({ title, badge, id, children }: { title: string; badge: string; id: string; children: React.ReactNode }) {
  const isMobileShell = useIsMobile();
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      style={{ border: `1px solid rgba(0,172,193,0.22)`, borderRadius: 6, overflow: 'hidden', background: 'var(--bg2)' }}>
      <div style={{ padding: '15px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--txt-dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRV, boxShadow: `0 0 8px ${TRV}`, display: 'inline-block', animation: 'pulse 2s infinite' }} />
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, background: 'rgba(0,172,193,0.12)', border: '1px solid rgba(0,172,193,0.28)', color: TRV, padding: '3px 10px', borderRadius: 2, letterSpacing: '0.08em' }}>{badge}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>// {id}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobileShell ? '1fr' : '360px 1fr' }}>
        {children}
      </div>
    </motion.div>
  );
}

// ── Cascade Node Card ─────────────────────────────────────────────────────────

function CascadeNodeCard({
  nodeId,
  impact,
  selected,
  hovered,
  onSelect,
  onHover,
  onBlur,
  prefersReduced,
}: {
  nodeId: AirlineNodeId;
  impact: AirlineImpact | null;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: AirlineNodeId) => void;
  onHover: (id: AirlineNodeId | null) => void;
  onBlur: () => void;
  prefersReduced: boolean | null;
}) {
  const node = AIRLINE_NODES[nodeId];
  const hasImpact = impact !== null && Math.abs(impact.impact) >= 0.03;
  const disp = hasImpact ? impactDisplay(impact!.impact, node.isRevenueSide) : null;

  return (
    <motion.div
      role={hasImpact ? 'button' : undefined}
      tabIndex={hasImpact ? 0 : undefined}
      aria-label={
        hasImpact
          ? `${node.label}: ${disp!.label} impact, T+${impact!.daysToEffect} days, ${Math.round(impact!.conf * 100)}% confidence. ${disp!.adverse ? 'Adverse' : 'Favourable'}.`
          : `${node.label}: not impacted`
      }
      aria-pressed={hasImpact ? selected : undefined}
      onClick={() => hasImpact && onSelect(nodeId)}
      onKeyDown={e => { if (hasImpact && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(nodeId); } }}
      onMouseEnter={() => hasImpact && onHover(nodeId)}
      onMouseLeave={() => onBlur()}
      onFocus={() => hasImpact && onHover(nodeId)}
      onBlur={() => onBlur()}
      initial={prefersReduced ? undefined : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hasImpact && !prefersReduced ? { y: -3, scale: 1.02 } : {}}
      style={{
        padding: '12px 14px',
        border: `1px solid ${selected ? node.color : hasImpact ? node.color + '55' : 'var(--border)'}`,
        borderRadius: 4,
        background: selected
          ? node.color + '18'
          : hasImpact
          ? node.color + '0c'
          : 'var(--bg)',
        cursor: hasImpact ? 'pointer' : 'default',
        minHeight: 88,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        position: 'relative',
        boxShadow: selected ? `0 0 18px ${node.color}25` : 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Layer badge */}
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: hasImpact ? node.color : 'var(--txt-faint)', opacity: 0.75,
      }}>
        {LAYER_LABELS[node.layer]}
      </span>

      {/* Label */}
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: hasImpact ? 'var(--txt)' : 'var(--txt-faint)', lineHeight: 1.2 }}>
        {node.label}
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', letterSpacing: '0.05em' }}>
        {node.sublabel}
      </span>

      {/* Impact display */}
      {hasImpact && disp && (
        <>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 700, color: disp.color,
            letterSpacing: '-0.01em', lineHeight: 1, marginTop: 2,
          }}>
            {disp.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
            {/* Confidence bar */}
            <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: impact!.conf }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', width: '100%', background: node.color, borderRadius: 1, transformOrigin: 'left' }}
              />
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', whiteSpace: 'nowrap' }}>
              T+{impact!.daysToEffect}d
            </span>
          </div>
        </>
      )}

      {/* Active glow ring */}
      {selected && (
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            position: 'absolute', inset: -1, borderRadius: 4,
            border: `1.5px solid ${node.color}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
}

// ── Brief Renderer ────────────────────────────────────────────────────────────

function BriefDisplay({ text, color }: { text: string; color: string }) {
  const blocks = parseBrief(text);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      {blocks.map((b, i) =>
        b.type === 'header' ? (
          <div key={i} style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            color, marginTop: i === 0 ? 0 : 22, marginBottom: 8,
          }}>
            // {b.content}
          </div>
        ) : (
          <p key={i} style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.7, marginBottom: 10 }}>
            {b.content}
          </p>
        )
      )}
    </motion.div>
  );
}

// ── IrropOutput (upgraded with AI brief) ─────────────────────────────────────

function IrropOutput({
  result,
  prefersReduced,
}: {
  result: IrropResult;
  prefersReduced: boolean | null;
}) {
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefText, setBriefText] = useState('');
  const [briefErr, setBriefErr] = useState('');

  const rankLabels = ['BEST OPTION', 'ALT 1', 'ALT 2'];
  const protColor = (p: string) =>
    p === 'CONFIRMED' ? 'var(--live)' : p === 'WAITLIST' ? 'var(--poc)' : 'var(--txt-dim)';

  async function generateBrief() {
    setBriefLoading(true); setBriefText(''); setBriefErr('');
    // Build rough impact data for the brief API
    const impacts: Record<string, { impact: number; conf: number; daysToEffect: number; mechanism: string }> = {
      LABOR_COST:     { impact: 0.22, conf: 0.88, daysToEffect: 7,  mechanism: 'Crew IRROP overtime and ground reaccommodation' },
      DISTRIBUTION:   { impact: 0.14, conf: 0.82, daysToEffect: 3,  mechanism: 'Rebooking volume spikes GDS segment fees' },
      LOAD_FACTOR:    { impact: -0.12, conf: 0.90, daysToEffect: 14, mechanism: 'Disrupted pax shift to competitor; load factor dips' },
      OPERATING_MARGIN: { impact: -0.08, conf: 0.75, daysToEffect: 30, mechanism: 'IRROP cost + revenue loss compresses unit margin' },
    };
    try {
      const res = await fetch('/api/airline-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerId: 'DISRUPTION_EVENT',
          triggerLabel: `${result.disruptType} — ${result.origin}–${result.destination}`,
          triggerDescription: `${result.disruptType} disruption on ${result.origin}–${result.destination} route`,
          realWorldRef: 'IRROP operational disruption — GDS IROPS Manager recovery flow',
          impacts,
          mode: 'irrop',
          irropContext: {
            origin: result.origin, destination: result.destination,
            disruptType: result.disruptType, tier: result.tier, urgency: result.urgency,
          },
        }),
      });
      const data = await res.json();
      if (data.text) setBriefText(data.text);
      else setBriefErr(data.error ?? 'Brief generation failed');
    } catch {
      setBriefErr('Network error — brief unavailable');
    } finally {
      setBriefLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: TRV }}>
          // {result.disruptType} · {result.origin}–{result.destination}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)' }}>
          {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </div>

      {/* Rebooking options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {result.opts.map((o, i) => {
          const isBest = i === 0;
          const routeStr = o.direct || !o.via ? 'Direct' : `Via ${o.via} · ${o.layover}m layover`;
          const scoreBar = Math.round(((o.score - 1) / 9) * 100);
          return (
            <div key={i} style={{
              padding: '14px 16px',
              border: `1px solid ${isBest ? 'rgba(0,172,193,0.35)' : 'var(--border)'}`,
              borderRadius: 3, background: isBest ? 'rgba(0,172,193,0.03)' : 'var(--bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 2,
                  background: isBest ? 'rgba(0,172,193,0.12)' : 'rgba(82,91,107,0.18)',
                  color: isBest ? TRV : 'var(--txt-dim)',
                }}>{rankLabels[i]}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginLeft: 'auto' }}>{o.carrier}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)' }}>{o.score}/10</span>
              </div>
              <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginBottom: 10, overflow: 'hidden' }}>
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: scoreBar / 100 }}
                  transition={{ duration: prefersReduced ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  style={{ height: '100%', width: '100%', background: isBest ? TRV : 'var(--txt-faint)', borderRadius: 1, transformOrigin: 'left' }}
                />
              </div>
              {[
                ['Departure delay', `+${irropDelayStr(o.delayH)} vs scheduled`],
                ['Routing', routeStr],
                ['Fare protection', o.protection],
                ['Priority queue', o.priorityQ ? '✓ Yes — seat held' : '— Standard queue'],
                ['Upgrade eligible', o.upgradeElig ? '✓ On request' : '— Not eligible'],
                ['Lounge access', o.lounge ? '✓ Included' : '— Not applicable'],
              ].map(([k, v], j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: j < 5 ? '1px solid rgba(35,42,54,0.5)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', letterSpacing: '0.06em' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: k === 'Fare protection' ? protColor(v) : v.startsWith('✓') ? 'var(--live)' : 'var(--txt)', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Tier + urgency note */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', padding: '12px 14px', background: 'rgba(0,172,193,0.04)', border: '1px solid rgba(0,172,193,0.12)', borderRadius: 3, lineHeight: 1.75, marginBottom: 18 }}>
        <strong style={{ color: 'var(--txt)' }}>What GDS IROPS Manager can't do:</strong> These options surface proactively via NDC in &lt;10 seconds. Manual GDS recovery averages 47 minutes per passenger. Tier {result.tier} status applies priority queue access across own-carrier options.
      </div>

      {/* AI Brief section */}
      {!briefText && !briefLoading && (
        <motion.button
          onClick={generateBrief}
          aria-label="Generate AI-powered IRROP recovery brief for this disruption"
          whileHover={!prefersReduced ? { scale: 1.02 } : {}}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: 12, background: 'transparent',
            border: `1px solid rgba(0,172,193,0.35)`, borderRadius: 3,
            color: TRV, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          ▸ Generate IRROP Intelligence Brief
        </motion.button>
      )}

      {briefLoading && (
        <div style={{ padding: '24px 0' }}>
          <LoadBar color={TRV} messages={['Analysing disruption cascade...', 'Grounding in current airline events...', 'Building recovery playbook...']} />
        </div>
      )}

      {briefText && (
        <div style={{ marginTop: 6, padding: '20px 0 0' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: TRV, marginBottom: 14 }}>// IRROP INTELLIGENCE BRIEF · GEMINI + SEARCH GROUNDING</div>
          <BriefDisplay text={briefText} color={TRV} />
        </div>
      )}

      {briefErr && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--acc)', marginTop: 10 }}>{briefErr}</div>
      )}
    </motion.div>
  );
}

// ── FareOutput ────────────────────────────────────────────────────────────────

function FareOutput({ result, email, phone }: { result: FareResult; email: string; phone: string }) {
  const [activated, setActivated] = useState(false);
  const flags = buildFareFlags(result);
  const narrative = buildFareNarrative(result);
  const rec = result.recommendation;
  const recColor = rec === 'REBOOK' ? TRV : rec === 'WATCH' ? 'var(--poc)' : 'var(--txt-dim)';
  const recBg   = rec === 'REBOOK' ? 'rgba(0,172,193,0.08)' : rec === 'WATCH' ? 'rgba(255,176,32,0.08)' : 'rgba(82,91,107,0.12)';
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
        {([['Best Available', fmt(result.bestFare), 'var(--txt)'], ['Gross Savings', fmt(result.grossSavings), result.grossSavings > 0 ? TRV : 'var(--txt-faint)'], ['Change Fee Est.', fmt(result.changeFee), 'var(--txt-dim)'], ['Net Savings', fmt(result.netSavings), result.netSavings > 0 ? 'var(--live)' : 'var(--txt-faint)']] as [string, string, string][]).map(([l, v, c]) => (
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
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setActivated(true)}
          disabled={activated}
          aria-label={activated ? 'Fare monitoring is now active' : 'Activate fare monitoring for $1'}
          style={{ width: '100%', padding: 12, background: activated ? 'var(--live)' : TRV, color: '#07090c', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: activated ? 'default' : 'pointer', transition: 'background 0.3s' }}>
          {activated ? '✓  Monitoring Active' : 'Activate Monitoring · $1'}
        </motion.button>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', marginTop: 8, textAlign: 'center', lineHeight: 1.7 }}>
          One-time $1 per booking · Active until travel date · Cancel anytime
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TravelTechPage() {
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();
  const liveRegionId = useId();

  // ── Cascade state ──
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerId | null>(null);
  const [cascadeResults, setCascadeResults] = useState<Record<AirlineNodeId, AirlineImpact> | null>(null);
  const [hoveredNode, setHoveredNode] = useState<AirlineNodeId | null>(null);
  const [selectedNode, setSelectedNode] = useState<AirlineNodeId | null>(null);
  const [cascadeBriefLoading, setCascadeBriefLoading] = useState(false);
  const [cascadeBriefText, setCascadeBriefText] = useState('');
  const [cascadeBriefErr, setCascadeBriefErr] = useState('');
  const [cascadeStatus, setCascadeStatus] = useState('');

  // ── IRROP state ──
  const [irrop, setIrrop] = useState({ origin: '', destination: '', disruptType: '', travelDate: '', tier: 'Non-member', pax: '1', urgency: '' });
  const [irropErrs, setIrropErrs] = useState<Record<string, string>>({});
  const [irropLoading, setIrropLoading] = useState(false);
  const [irropResult, setIrropResult] = useState<IrropResult | null>(null);

  // ── Fare state ──
  const [fare, setFare] = useState({ origin: '', destination: '', travelClass: '', bookedFare: '', travelDate: '', email: '', phone: '' });
  const [fareErrs, setFareErrs] = useState<Record<string, string>>({});
  const [fareLoading, setFareLoading] = useState(false);
  const [fareResult, setFareResult] = useState<FareResult | null>(null);

  const ifd = (id: keyof typeof irrop, val: string) => setIrrop(f => ({ ...f, [id]: val }));
  const fld = (id: keyof typeof fare, val: string) => setFare(f => ({ ...f, [id]: val }));
  const todayStr = new Date().toISOString().slice(0, 10);
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 400);
  const maxStr = maxDate.toISOString().slice(0, 10);

  // ── Cascade handlers ──
  function handleTriggerSelect(id: TriggerId) {
    setSelectedTrigger(id);
    setCascadeResults(null);
    setSelectedNode(null);
    setCascadeBriefText('');
    setCascadeBriefErr('');
    setCascadeStatus(`Running ${AIRLINE_TRIGGERS[id].label} cascade…`);
    setTimeout(() => {
      setCascadeResults(runAirlineCascade(id));
      setCascadeStatus(`${AIRLINE_TRIGGERS[id].label} cascade complete — ${Object.keys(AIRLINE_NODES).length} nodes evaluated`);
    }, 600 + Math.random() * 400);
  }

  async function generateCascadeBrief() {
    if (!selectedTrigger || !cascadeResults) return;
    const trigger = AIRLINE_TRIGGERS[selectedTrigger];
    setCascadeBriefLoading(true); setCascadeBriefText(''); setCascadeBriefErr('');
    setCascadeStatus('Generating AI recovery brief…');
    try {
      const res = await fetch('/api/airline-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerId: selectedTrigger,
          triggerLabel: trigger.label,
          triggerDescription: trigger.description,
          realWorldRef: trigger.realWorldRef,
          impacts: cascadeResults,
          mode: 'cascade',
        }),
      });
      const data = await res.json();
      if (data.text) {
        setCascadeBriefText(data.text);
        setCascadeStatus('AI brief ready');
      } else {
        setCascadeBriefErr(data.error ?? 'Brief generation failed');
        setCascadeStatus('Brief generation failed');
      }
    } catch {
      setCascadeBriefErr('Network error — brief unavailable');
      setCascadeStatus('');
    } finally {
      setCascadeBriefLoading(false);
    }
  }

  // ── IRROP handler ──
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
    }, 1800 + Math.random() * 700);
  };

  // ── Fare handler ──
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

  // ── Detail node ──
  const detailNode = selectedNode ? AIRLINE_NODES[selectedNode] : (hoveredNode ? AIRLINE_NODES[hoveredNode] : null);
  const detailImpact = selectedNode && cascadeResults ? cascadeResults[selectedNode] : (hoveredNode && cascadeResults ? cascadeResults[hoveredNode] : null);

  return (
    <div style={{ paddingTop: 52 }}>

      {/* Visually hidden aria-live region */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {cascadeStatus}
      </div>

      {/* ── HEADER ── */}
      <header style={{ padding: 'clamp(72px,10vw,120px) clamp(16px,4vw,48px) 64px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--txt-faint)', marginBottom: 24 }}>
          S-ASHWATH / DOMAIN_04 / <span style={{ color: TRV }}>TRAVEL-TECH</span>
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontWeight: 700, fontSize: 'clamp(32px, 5.2vw, 64px)', lineHeight: 0.97, letterSpacing: '-0.03em', marginBottom: 26, maxWidth: '18ch' }}>
          Airline Revenue<br />Intelligence<br />Engine<span style={{ color: TRV, textShadow: '0 0 26px rgba(0,172,193,0.45)' }}>.</span>
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'var(--txt-dim)', maxWidth: '62ch', lineHeight: 1.6 }}>
          PROS RM optimises the core revenue engine. Sabre Mosaic adds continuous pricing. Fetcherr GPE adds generative simulation.{' '}
          <strong style={{ color: 'var(--txt)' }}>None of them own the intelligence layer around it</strong> — IRROP recovery, fare arbitrage detection, GDS-to-NDC migration strategy. That gap is 18 years of delivery experience inside the stack.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: isMobile ? 24 : 44, marginTop: 42, flexWrap: 'wrap' }}>
          {[
            ['18 yrs', 'GDS · NDC · IRROP delivery'],
            ['12 nodes', 'Airline P&L cascade modelled'],
            ['<10s', 'NDC proactive rebooking vs 47min GDS queue'],
          ].map(([v, l]) => (
            <div key={l}>
              <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, lineHeight: 1, color: TRV }}>
                {v}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', display: 'block', marginTop: 7 }}>{l}</span>
            </div>
          ))}
        </motion.div>
      </header>

      {/* ── SECTION 01: REVENUE CASCADE SIMULATOR ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px)', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="01" title="Revenue Cascade Simulator" />

        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 32, maxWidth: '68ch' }}>
          Pick a macro shock. BFS propagation traces it through all 12 airline P&L nodes — from demand inputs to RASK, CASK, and operating margin. Same BFS engine that powers the Macro Cascade Intelligence Engine, applied to airline economics.
        </motion.p>

        {/* Trigger selector */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {(Object.values(AIRLINE_TRIGGERS)).map(trigger => {
            const active = selectedTrigger === trigger.id;
            return (
              <motion.button
                key={trigger.id}
                onClick={() => handleTriggerSelect(trigger.id)}
                aria-pressed={active}
                aria-label={`${trigger.label}: ${trigger.sublabel}. ${active ? 'Active.' : 'Click to simulate.'}`}
                whileHover={!prefersReduced ? { scale: 1.02, y: -2 } : {}}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '14px 16px', textAlign: 'left',
                  background: active ? trigger.color + '18' : 'var(--bg2)',
                  border: `1px solid ${active ? trigger.color : 'var(--border)'}`,
                  borderRadius: 4, cursor: 'pointer',
                  boxShadow: active ? `0 0 20px ${trigger.color}22` : 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? trigger.color : 'var(--border)', flexShrink: 0, boxShadow: active ? `0 0 10px ${trigger.color}` : 'none', transition: 'background 0.2s' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 700, color: active ? trigger.color : 'var(--txt)', letterSpacing: '0.02em' }}>{trigger.label}</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--txt-faint)', letterSpacing: '0.06em', marginBottom: 4 }}>{trigger.sublabel}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: active ? trigger.color + 'bb' : 'var(--txt-faint)', letterSpacing: '0.04em', opacity: 0.75 }}>{trigger.realWorldRef}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Cascade matrix */}
        <AnimatePresence mode="wait">
          {!cascadeResults && !selectedTrigger && (
            <motion.div key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 32, color: 'var(--txt-faint)', opacity: 0.2 }}>◈</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>
                Select a macro shock to run the P&L cascade.<br />All 12 airline economic nodes evaluated via BFS propagation.
              </div>
            </motion.div>
          )}

          {selectedTrigger && !cascadeResults && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '48px 0' }}>
              <LoadBar color={AIRLINE_TRIGGERS[selectedTrigger].color} messages={['Propagating through demand nodes...', 'Calculating RASK/CASK impact...', 'Evaluating network effects...']} />
            </motion.div>
          )}

          {cascadeResults && selectedTrigger && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Layer-by-layer cascade */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {LAYER_ORDER.map(layer => {
                  const layerNodes = nodesInLayer(layer);
                  const isRevenueOrCost = layer === 'revenue' || layer === 'cost';

                  // Revenue + Cost rendered side-by-side in one combined row
                  if (layer === 'cost') return null; // rendered inside 'revenue'

                  if (layer === 'revenue') {
                    const revNodes = nodesInLayer('revenue');
                    const costNodes = nodesInLayer('cost');
                    return (
                      <div key="rev-cost-combined">
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1px 1fr', gap: isMobile ? 12 : 0, alignItems: 'start' }}>
                          {/* Revenue side */}
                          <div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: TRV, marginBottom: 8, opacity: 0.7 }}>REVENUE STREAMS → RASK</div>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${revNodes.length}, 1fr)`, gap: 8 }}>
                              {revNodes.map(n => (
                                <CascadeNodeCard key={n.id} nodeId={n.id}
                                  impact={Math.abs(cascadeResults[n.id].impact) >= 0.03 ? cascadeResults[n.id] : null}
                                  selected={selectedNode === n.id} hovered={hoveredNode === n.id}
                                  onSelect={setSelectedNode} onHover={setHoveredNode} onBlur={() => setHoveredNode(null)}
                                  prefersReduced={prefersReduced} />
                              ))}
                            </div>
                          </div>

                          {/* Divider */}
                          {!isMobile && <div style={{ background: 'var(--border)', width: 1, margin: '0 8px' }} />}

                          {/* Cost side */}
                          <div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: '#ef5350', marginBottom: 8, opacity: 0.7 }}>COST DRIVERS → CASK</div>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${costNodes.length}, 1fr)`, gap: 8 }}>
                              {costNodes.map(n => (
                                <CascadeNodeCard key={n.id} nodeId={n.id}
                                  impact={Math.abs(cascadeResults[n.id].impact) >= 0.03 ? cascadeResults[n.id] : null}
                                  selected={selectedNode === n.id} hovered={hoveredNode === n.id}
                                  onSelect={setSelectedNode} onHover={setHoveredNode} onBlur={() => setHoveredNode(null)}
                                  prefersReduced={prefersReduced} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={layer}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--txt-faint)', marginBottom: 8, opacity: 0.7 }}>{LAYER_LABELS[layer]}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${layerNodes.length}, 1fr)`, gap: 8 }}>
                        {layerNodes.map(n => (
                          <CascadeNodeCard key={n.id} nodeId={n.id}
                            impact={Math.abs(cascadeResults[n.id].impact) >= 0.03 ? cascadeResults[n.id] : null}
                            selected={selectedNode === n.id} hovered={hoveredNode === n.id}
                            onSelect={setSelectedNode} onHover={setHoveredNode} onBlur={() => setHoveredNode(null)}
                            prefersReduced={prefersReduced} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Node detail panel */}
              <AnimatePresence>
                {(selectedNode || hoveredNode) && detailNode && (
                  <motion.div
                    key={selectedNode ?? hoveredNode}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      marginTop: 16, padding: '18px 22px',
                      background: detailNode.color + '0a',
                      border: `1px solid ${detailNode.color}33`,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: detailNode.color }}>{detailNode.label}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)' }}>{detailNode.sublabel}</span>
                      {detailImpact && Math.abs(detailImpact.impact) >= 0.03 && (() => {
                        const d = impactDisplay(detailImpact.impact, detailNode.isRevenueSide);
                        return (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: d.color, marginLeft: 'auto' }}>
                            {d.label} · T+{detailImpact.daysToEffect}d · {Math.round(detailImpact.conf * 100)}% conf
                          </span>
                        );
                      })()}
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--txt-dim)', lineHeight: 1.65, marginBottom: 8 }}>{detailNode.description}</p>
                    {detailImpact && Math.abs(detailImpact.impact) >= 0.03 && detailImpact.mechanism && (
                      <>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.14em', color: detailNode.color, marginBottom: 4, opacity: 0.75 }}>// MECHANISM</div>
                        <p style={{ fontSize: 13, color: 'var(--txt-dim)', lineHeight: 1.6, marginBottom: 8 }}>{detailImpact.mechanism}</p>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.14em', color: detailNode.color, marginBottom: 4, opacity: 0.75 }}>// RECOVERY HORIZON</div>
                        <p style={{ fontSize: 13, color: 'var(--txt-dim)', lineHeight: 1.6 }}>{detailImpact.recovery}</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Brief */}
              <div style={{ marginTop: 28 }}>
                {!cascadeBriefText && !cascadeBriefLoading && (
                  <motion.button
                    onClick={generateCascadeBrief}
                    aria-label={`Generate AI recovery brief for ${AIRLINE_TRIGGERS[selectedTrigger].label} scenario`}
                    aria-busy={cascadeBriefLoading}
                    whileHover={!prefersReduced ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '13px 28px',
                      background: 'transparent',
                      border: `1px solid ${AIRLINE_TRIGGERS[selectedTrigger].color}55`,
                      borderRadius: 3, cursor: 'pointer',
                      color: AIRLINE_TRIGGERS[selectedTrigger].color,
                      fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}
                  >
                    ▸ Generate AI Recovery Brief
                  </motion.button>
                )}

                {cascadeBriefLoading && (
                  <div style={{ padding: '32px 0' }}>
                    <LoadBar color={AIRLINE_TRIGGERS[selectedTrigger].color} messages={['Grounding in current airline events...', 'Mapping yield management response...', 'Building recovery playbook...']} />
                  </div>
                )}

                {cascadeBriefText && (
                  <div style={{ padding: '24px 28px', background: AIRLINE_TRIGGERS[selectedTrigger].color + '08', border: `1px solid ${AIRLINE_TRIGGERS[selectedTrigger].color}22`, borderRadius: 4 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', color: AIRLINE_TRIGGERS[selectedTrigger].color, marginBottom: 18 }}>
                      // AI RECOVERY BRIEF · {AIRLINE_TRIGGERS[selectedTrigger].label.toUpperCase()} · GEMINI + SEARCH GROUNDING
                    </div>
                    <BriefDisplay text={cascadeBriefText} color={AIRLINE_TRIGGERS[selectedTrigger].color} />
                  </div>
                )}

                {cascadeBriefErr && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--acc)', marginTop: 10 }}>{cascadeBriefErr}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── SECTION 02: IRROP INTELLIGENCE ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px)', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="02" title="IRROP Disruption Intelligence" />
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 28, maxWidth: '66ch' }}>
          Flight cancelled or delayed. GDS IROPS Manager averages 47 minutes per passenger for manual recovery. An NDC-connected agent surfaces ranked rebooking options proactively — before the passenger joins the queue. An AI brief then models the network and revenue cost.
        </motion.p>

        <AgentShell title="IRROP REBOOKING AGENT" badge="NDC · PROACTIVE" id="TRAVEL_A2 · DOMAIN_04">
          <div style={{ padding: '26px 28px', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 20 }}>// Disruption Details</div>
            <form onSubmit={handleIrropSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <FieldGroup label="Origin IATA" error={irropErrs.origin}>
                  <input value={irrop.origin} onChange={e => ifd('origin', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. JFK" maxLength={3}
                    style={{ ...inputStyle, borderColor: irropErrs.origin ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
                <FieldGroup label="Destination IATA" error={irropErrs.destination}>
                  <input value={irrop.destination} onChange={e => ifd('destination', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. LHR" maxLength={3}
                    style={{ ...inputStyle, borderColor: irropErrs.destination ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
              </div>
              <FieldGroup label="Disruption type" error={irropErrs.disruptType}>
                <select value={irrop.disruptType} onChange={e => ifd('disruptType', e.target.value)}
                  style={{ ...inputStyle, borderColor: irropErrs.disruptType ? 'var(--acc)' : 'var(--border)' }}>
                  <option value="">Select disruption</option>
                  {['Flight Cancelled', 'Delayed 2–4h', 'Delayed 4h+'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Scheduled departure date" error={irropErrs.travelDate}>
                <input type="date" value={irrop.travelDate} onChange={e => ifd('travelDate', e.target.value)} min={todayStr} max={maxStr}
                  style={{ ...inputStyle, borderColor: irropErrs.travelDate ? 'var(--acc)' : 'var(--border)' }} />
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
                <select value={irrop.urgency} onChange={e => ifd('urgency', e.target.value)}
                  style={{ ...inputStyle, borderColor: irropErrs.urgency ? 'var(--acc)' : 'var(--border)' }}>
                  <option value="">Select urgency</option>
                  {['Must arrive today', 'Same day preferred', 'Flexible'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <motion.button
                type="submit" disabled={irropLoading}
                aria-label="Find IRROP rebooking options"
                aria-busy={irropLoading}
                whileHover={!irropLoading && !prefersReduced ? { opacity: 0.85 } : {}}
                whileTap={{ scale: 0.97 }}
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
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>Enter disruption details.<br />Ranked rebooking options surface in seconds.</div>
                </motion.div>
              )}
              {irropLoading && (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <LoadBar color={TRV} messages={['Checking alliance rebooking inventory...', 'Scanning partner carrier availability...', 'Verifying fare protection eligibility...', 'Ranking by urgency profile...']} />
                </motion.div>
              )}
              {irropResult && !irropLoading && (
                <IrropOutput key="result" result={irropResult} prefersReduced={prefersReduced} />
              )}
            </AnimatePresence>
          </div>
        </AgentShell>
      </section>

      {/* ── SECTION 03: FARE ARBITRAGE MONITOR ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px) 90px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="03" title="Fare Arbitrage Monitor" />
        <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ fontSize: 15, color: 'var(--txt-dim)', marginBottom: 28, maxWidth: '66ch' }}>
          Corporate TMCs are paid per transaction. Rebooking costs them money. When a booked fare drops 20–30% post-booking, they stay silent. GDS surfaces published fares only — NDC direct and consolidator inventory are invisible to them. This monitors both channels.
        </motion.p>

        <AgentShell title="FARE ARBITRAGE AGENT" badge="GDS + NDC" id="TRAVEL_A3 · DOMAIN_04">
          <div style={{ padding: '26px 28px', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 20 }}>// Booking + Alert Details</div>
            <form onSubmit={handleFareSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <FieldGroup label="Origin IATA" error={fareErrs.origin}>
                  <input value={fare.origin} onChange={e => fld('origin', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. JFK" maxLength={3}
                    style={{ ...inputStyle, borderColor: fareErrs.origin ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
                <FieldGroup label="Destination IATA" error={fareErrs.destination}>
                  <input value={fare.destination} onChange={e => fld('destination', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="e.g. LHR" maxLength={3}
                    style={{ ...inputStyle, borderColor: fareErrs.destination ? 'var(--acc)' : 'var(--border)' }} />
                </FieldGroup>
              </div>
              <FieldGroup label="Travel class" error={fareErrs.travelClass}>
                <select value={fare.travelClass} onChange={e => fld('travelClass', e.target.value)}
                  style={{ ...inputStyle, borderColor: fareErrs.travelClass ? 'var(--acc)' : 'var(--border)' }}>
                  <option value="">Select class</option>
                  {['Economy', 'Premium Economy', 'Business', 'First'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Booked fare (per person)" hint="USD · $30–$25,000" error={fareErrs.bookedFare}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--txt-faint)', pointerEvents: 'none' }}>$</span>
                  <input type="number" value={fare.bookedFare} onChange={e => fld('bookedFare', e.target.value)} placeholder="e.g. 3800" min={30} max={25000}
                    style={{ ...inputStyle, paddingLeft: 24, borderColor: fareErrs.bookedFare ? 'var(--acc)' : 'var(--border)' }} />
                </div>
              </FieldGroup>
              <FieldGroup label="Travel date" error={fareErrs.travelDate}>
                <input type="date" value={fare.travelDate} onChange={e => fld('travelDate', e.target.value)} min={todayStr} max={maxStr}
                  style={{ ...inputStyle, borderColor: fareErrs.travelDate ? 'var(--acc)' : 'var(--border)' }} />
              </FieldGroup>
              <FieldGroup label="Email for alerts" error={fareErrs.email}>
                <input type="email" value={fare.email} onChange={e => fld('email', e.target.value)} placeholder="you@company.com"
                  style={{ ...inputStyle, borderColor: fareErrs.email ? 'var(--acc)' : 'var(--border)' }} />
              </FieldGroup>
              <FieldGroup label="Mobile for SMS (optional)">
                <input type="tel" value={fare.phone} onChange={e => fld('phone', e.target.value)} placeholder="+1 212 555 0100" style={inputStyle} />
              </FieldGroup>
              <motion.button
                type="submit" disabled={fareLoading}
                aria-label="Check fare and subscribe to monitoring alerts"
                aria-busy={fareLoading}
                whileHover={!fareLoading && !prefersReduced ? { opacity: 0.85 } : {}}
                whileTap={{ scale: 0.97 }}
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
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>Enter booking details and email.<br />GDS + NDC channels checked simultaneously.</div>
                </motion.div>
              )}
              {fareLoading && (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <LoadBar color={TRV} messages={['Checking GDS inventory on route...', 'Scanning NDC direct-fare channels...', 'Modelling reissue economics...', 'Generating rebook signal...']} />
                </motion.div>
              )}
              {fareResult && !fareLoading && (
                <FareOutput key="result" result={fareResult} email={fare.email} phone={fare.phone} />
              )}
            </AnimatePresence>
          </div>
        </AgentShell>
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
            // Travel-Tech · DOMAIN_04 · Airline Revenue Intelligence — cascade modelling, IRROP recovery, fare arbitrage · 18 years GDS + NDC
          </div>
        </div>
      </footer>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
