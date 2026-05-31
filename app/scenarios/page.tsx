'use client';

import { useState, useEffect, useCallback, useMemo, useId } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  SECTORS, TRIGGERS, CONTEXTS, INTENSITIES, PERSONAS,
  runSimulation, autoSuggestTriggers, type ImpactResult, type LiveMarket,
} from '@/lib/macroData';

const MacroNetwork = dynamic(() => import('@/components/MacroNetwork'), { ssr: false });

interface MarketData {
  vix?: string; oil?: string; oilChange?: string;
  sp500?: string; sp500Change?: string;
  usdEur?: string; gold?: string; tenYear?: string;
  autoContext?: string; source?: string;
}

interface TriggerSignal {
  headlines: string[];
  signal: number; // 0–1
}

interface TriggerLiveData {
  triggers: Record<string, TriggerSignal>;
  live: boolean;
  total: number;
}

const REGIONS = ['GLOBAL', 'APAC', 'EU', 'MENA', 'NA'];

// ── Plain-English helpers for the impact tooltip ─────────────────────────────
function lagLabel(lag: number): string {
  if (lag === 0) return 'Immediate — reprices on the day of the shock';
  if (lag <= 3)  return `~${lag} day${lag > 1 ? 's' : ''} — within the same trading week`;
  if (lag <= 14) return `~${lag} days — expect this within 2 weeks as contracts reprice`;
  if (lag <= 30) return `~${lag} days — transmits over the following month`;
  return `~${lag} days — slow-moving effect, takes ~${Math.round(lag / 30)} month${lag > 45 ? 's' : ''} to fully show`;
}

function impactSentence(sector: string, impact: number): string {
  const mag = (Math.abs(impact) * 100).toFixed(1);
  const up = impact > 0;
  if (Math.abs(impact) < 0.05) return `${sector} sees a marginal move — below noise threshold in most models.`;
  if (up) {
    if (impact > 1.0) return `${sector} costs / prices are projected to more than double (+${mag}%) — a once-in-a-decade stress level.`;
    if (impact > 0.5) return `${sector} faces severe upward pressure of +${mag}% vs. today's baseline. Budgets and contracts written at current prices will be materially wrong.`;
    return `${sector} is projected to rise ${mag}% above today's baseline. Factor this into forward pricing and cost assumptions.`;
  } else {
    if (impact < -0.5) return `${sector} faces severe contraction of ${mag}% — equivalent to losing roughly half of current activity or revenue base.`;
    return `${sector} is projected to fall ${mag}% below today's baseline. Demand, volumes, or asset values decline by that magnitude.`;
  }
}

export default function ScenariosPage() {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [intensity,   setIntensity]   = useState('SEVERE');
  const [context,     setContext]     = useState('BASELINE');
  const [region,      setRegion]      = useState('GLOBAL');
  const [persona,     setPersona]     = useState('investment');
  const [impacts,     setImpacts]     = useState<Record<string, ImpactResult> | null>(null);
  const [selectedNode,setSelectedNode] = useState<string | null>(null);
  const [running,     setRunning]     = useState(false);
  const [hoveredImpact,  setHoveredImpact]  = useState<string | null>(null);
  const [tooltipPos,     setTooltipPos]     = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mobileTooltip,  setMobileTooltip]  = useState<string | null>(null);
  const [hoveredMarket,  setHoveredMarket]  = useState<string | null>(null);
  const [marketTipPos,   setMarketTipPos]   = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [marketData,  setMarketData]  = useState<MarketData | null>(null);
  const [triggerLiveData, setTriggerLiveData] = useState<TriggerLiveData | null>(null);
  const [llmText,     setLlmText]     = useState('');
  const [llmLoading,  setLlmLoading]  = useState(false);
  const [llmError,    setLlmError]    = useState('');
  const [lockedRun,   setLockedRun]   = useState<{
    impacts: Record<string, ImpactResult>;
    triggers: string[];
    intensity: string;
    context: string;
    region: string;
    persona: string;
    llmText: string;
  } | null>(null);
  const [activeBrief, setActiveBrief] = useState<'current' | 'locked'>('current');
  const [llmStatusMsg, setLlmStatusMsg] = useState('');
  const isMobile = useIsMobile();
  const prefersReduced = useReducedMotion();
  const liveRegionId = useId();

  useEffect(() => {
    fetch('/api/market')
      .then(r => r.json())
      .then((d: MarketData) => {
        setMarketData(d);
        if (d.autoContext) setContext(d.autoContext);
      })
      .catch(() => {
        // Market API unavailable — UI shows LOADING; no data state is handled visually
        setMarketData({ source: 'unavailable' });
      });

    fetch('/api/triggers')
      .then(r => r.json())
      .then((d: TriggerLiveData) => {
        setTriggerLiveData(d);
      })
      .catch(() => {
        // RSS unavailable — show fallback state with zero signals
        setTriggerLiveData({ triggers: {}, live: false, total: 0 });
      });
  }, []);

  const liveMarket = useMemo<LiveMarket>(() => ({
    vix:         parseFloat(marketData?.vix ?? '18'),
    oilChange:   parseFloat(marketData?.oilChange ?? '0'),
    sp500Change: parseFloat(marketData?.sp500Change ?? '0'),
  }), [marketData]);

  const autoSuggested = useMemo(() =>
    marketData ? autoSuggestTriggers(liveMarket) : []
  , [marketData, liveMarket]);

  const toggleTrigger = (id: string) =>
    setSelectedTriggers(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);

  const handleRun = useCallback(async () => {
    if (!selectedTriggers.length) return;
    setRunning(true); setLlmText(''); setLlmError('');
    setLlmStatusMsg('Running cascade propagation…');
    await new Promise(r => setTimeout(r, 700));

    const results = runSimulation(selectedTriggers, intensity, context, region, liveMarket);
    setImpacts(results);
    setActiveBrief('current');
    setRunning(false);

    const personaLabel = PERSONAS.find(p => p.id === persona)?.label ?? persona;
    setLlmLoading(true);
    setLlmStatusMsg(`Generating intelligence brief for ${personaLabel}, please wait…`);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, triggers: selectedTriggers, impacts: results, liveData: marketData, intensity, context }),
      });
      const data = await res.json();
      if (data.error) {
        setLlmError(data.error);
        setLlmStatusMsg('Brief generation failed. See error below.');
      } else {
        setLlmText(data.text ?? '');
        setLlmStatusMsg(`Brief ready for ${personaLabel}.`);
      }
    } catch {
      setLlmError('Could not reach LLM. Check GEMINI_API_KEY in Netlify environment variables.');
      setLlmStatusMsg('Brief generation failed. Network error.');
    }
    setLlmLoading(false);
  }, [selectedTriggers, intensity, context, region, persona, marketData, liveMarket]);

  const handleLock = useCallback(() => {
    if (!impacts) return;
    setLockedRun({ impacts, triggers: selectedTriggers, intensity, context, region, persona, llmText });
    setActiveBrief('current');
  }, [impacts, selectedTriggers, intensity, context, region, persona, llmText]);

  const contextColor = context === 'CRISIS' ? '#ff3b30' : context === 'STRESSED' ? '#ffb020' : '#00e676';

  return (
    <div style={{ paddingTop: 52 }}>

      {/* ── LIVE MARKET STRIP ─────────────────────── */}
      <motion.div initial={{ opacity: prefersReduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px clamp(16px,4vw,48px)', display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', backdropFilter: 'blur(8px)' }}>

        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', display: 'flex', alignItems: 'center', gap: 6, color: marketData?.source === 'live' ? '#00e676' : '#ffb020' }}>
          <motion.span
            animate={prefersReduced ? {} : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {marketData?.source?.toUpperCase() ?? 'LOADING'}
        </span>

        {[
          { key: 'VIX',     label: 'VIX',     val: marketData?.vix },
          { key: 'WTI',     label: 'WTI',     val: marketData?.oil    ? `$${marketData.oil}`      : null },
          { key: 'SP500',   label: 'S&P 500', val: marketData?.sp500 },
          { key: 'USDEUR',  label: 'USD/EUR', val: marketData?.usdEur },
          { key: 'GOLD',    label: 'GOLD',    val: marketData?.gold   ? `$${marketData.gold}`     : null },
          { key: 'UST10Y',  label: '10Y UST', val: marketData?.tenYear ? `${marketData.tenYear}%` : null },
        ].map(item => item.val ? (
          <button key={item.key}
            aria-label={`${item.label}: ${item.val}. Press for explanation.`}
            aria-expanded={hoveredMarket === item.key}
            onMouseEnter={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setMarketTipPos({ x: r.left, y: r.bottom + 8 });
              setHoveredMarket(item.key);
            }}
            onMouseLeave={() => setHoveredMarket(null)}
            onFocus={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setMarketTipPos({ x: r.left, y: r.bottom + 8 });
              setHoveredMarket(item.key);
            }}
            onBlur={() => setHoveredMarket(null)}
            style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.42)', cursor: 'default', position: 'relative', background: 'transparent', border: 'none', padding: '4px 2px' }}>
            {item.label}{' '}<strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{item.val}</strong>
            <span aria-hidden="true" style={{ marginLeft: 4, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>ⓘ</span>
          </button>
        ) : null)}

        {marketData?.autoContext && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: contextColor, border: `1px solid ${contextColor}44`, padding: '3px 10px', borderRadius: '2px', letterSpacing: '0.1em' }}>
            MARKET: {marketData.autoContext}
          </span>
        )}
      </motion.div>

      {/* ── HEADER ────────────────────────────────── */}
      <div style={{ padding: '52px clamp(16px,4vw,48px) 40px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] as [number, number, number, number] }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#ff9100', letterSpacing: '0.18em', marginBottom: 14 }}>
            MACRO_ENGINE · DOMAIN_05 · INSTITUTIONAL-GRADE · LIVE
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 20 }}>
            Macro Cascade <span style={{ color: '#ff9100' }}>Intelligence</span> Engine
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 600, lineHeight: 1.75, marginBottom: 14 }}>
            A Bloomberg institutional brief requires a $25,000/year terminal and an analyst to interpret it.
            This platform runs the same four-layer analytical pipeline — and delivers the output as a plain-English report
            specific to your role, grounded in what is happening in the market <em>right now</em>.
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--txt-dim)', maxWidth: 580, lineHeight: 1.72, marginBottom: 28 }}>
            Every report is generated fresh. Live RSS news signals feed trigger detection. Live market data seeds the cascade model.
            A BFS propagation engine — calibrated against 23 historical shocks from the Gulf War to Ukraine — computes sector-by-sector impact.
            Gemini then searches the current web at inference time and writes a brief that cites the model numbers alongside real events happening today.
            Not training data. Not templates. Institutional rigour, for any decision-maker.
          </p>

          {/* ── 4-STEP PIPELINE ARCHITECTURE ── */}
          <div style={{ marginBottom: 32, maxWidth: 900 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,145,0,0.55)', marginBottom: 12 }}>
              // HOW EACH REPORT IS GENERATED — 4-LAYER PIPELINE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: isMobile ? 8 : 0, position: 'relative' }}>
              {([
                { n:'01', label:'RSS NEWS\nSIGNALS',    src:'BBC · NYT',                  detail:'15-min cache · keyword-matched to 6 shock categories · live signal strength 0–3' },
                { n:'02', label:'LIVE MARKET\nSEEDING', src:'Yahoo Finance · FX feeds',   detail:'VIX → cascade multiplier · WTI + S&P500 → priced-in dampening · 5-min cache' },
                { n:'03', label:'BFS CASCADE\nMODEL',   src:'13 sectors · 31 edges',      detail:'Calibrated: 23 historical shocks · Gulf War 1990 to Ukraine 2022 · ETF regression data' },
                { n:'04', label:'AI SEARCH\nGROUNDING', src:'Gemini 2.5 Flash · Google',  detail:'Searches current web at inference time · cites cascade numbers + real events · 11 personas' },
              ] as { n:string; label:string; src:string; detail:string }[]).map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', position: 'relative' }}>
                  {/* Connector arrow between steps */}
                  {!isMobile && i < 3 && (
                    <div style={{
                      position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, display: 'flex', alignItems: 'center',
                    }}>
                      <div style={{ width: 1, height: 24, background: 'rgba(255,145,0,0.3)' }} />
                    </div>
                  )}
                  <div style={{
                    flex: 1,
                    background: 'rgba(255,145,0,0.04)',
                    border: '1px solid rgba(255,145,0,0.14)',
                    borderRight: !isMobile && i < 3 ? '1px solid rgba(255,145,0,0.08)' : '1px solid rgba(255,145,0,0.14)',
                    borderRadius: isMobile ? 6 : i === 0 ? '6px 0 0 6px' : i === 3 ? '0 6px 6px 0' : 0,
                    padding: isMobile ? '12px 14px' : '16px 14px',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,145,0,0.45)', letterSpacing: '0.1em' }}>{step.n}</span>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ff9100', boxShadow: '0 0 6px #ff9100' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, color: '#ff9100', letterSpacing: '0.08em', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                      {step.label}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                      {step.src}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DIFFERENTIATION TABLE ── */}
          <div style={{ marginTop: 28, maxWidth: 700 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,145,0,0.55)', marginBottom: 10 }}>
              // HOW THIS DIFFERS FROM EXISTING TOOLS
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden', minWidth: 580 }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1.2fr', background: 'rgba(0,0,0,0.4)' }}>
                  {['CAPABILITY', 'BLOOMBERG', 'OXFORD ECON', 'CHATGPT', 'THIS PLATFORM'].map((h, i) => (
                    <div key={i} style={{
                      padding: '7px 10px', fontFamily: 'var(--mono)', fontSize: 8.5, letterSpacing: '0.1em',
                      color: i === 4 ? '#ff9100' : 'rgba(255,255,255,0.22)',
                      fontWeight: i === 4 ? 700 : 400,
                      borderRight: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      background: i === 4 ? 'rgba(255,145,0,0.05)' : 'transparent',
                    }}>{h}</div>
                  ))}
                </div>
                {/* Data rows */}
                {([
                  ['Live news trigger detection',          '—',             '—',             '—',        '✓'],
                  ['BFS sector cascade / propagation',     'partial',       '✓',             '—',        '✓'],
                  ['VIX-calibrated live market seeding',   '✓',             '—',             '—',        '✓'],
                  ['Role-specific plain-English brief',    '—',             '—',             'manual',   '✓'],
                  ['Grounded in today\'s real events',     '—',             '—',             'sometimes','✓'],
                  ['Access cost',                          '$25K / yr',     'institutional', 'free',     'free'],
                ] as [string, string, string, string, string][]).map((row, ri) => (
                  <div key={ri} style={{
                    display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1.2fr',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: ri % 2 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <div style={{ padding: '8px 10px', fontSize: 11.5, color: 'rgba(255,255,255,0.5)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                      {row[0]}
                    </div>
                    {row.slice(1).map((v, ci) => {
                      const isHere = ci === 3;
                      const color = v === '✓' ? (isHere ? '#00e676' : 'rgba(255,255,255,0.25)')
                                  : v === '—' ? 'rgba(255,255,255,0.1)'
                                  : (v === 'partial' || v === 'manual' || v === 'sometimes') ? '#ffb020'
                                  : isHere ? '#ff9100' : 'rgba(255,255,255,0.3)';
                      return (
                        <div key={ci} style={{
                          padding: '8px 10px', fontFamily: 'var(--mono)', fontSize: 9.5,
                          textAlign: 'center', color, fontWeight: isHere ? 600 : 400,
                          borderRight: ci < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          background: isHere ? 'rgba(255,145,0,0.04)' : 'transparent',
                        }}>{v}</div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      {/* ── CONTROLS ──────────────────────────────── */}
      <motion.div initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 36px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Locked scenario banner */}
        {lockedRun && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(255,145,0,0.05)', border: '1px solid rgba(255,145,0,0.28)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 900, color: '#fff', background: '#ff9100', padding: '2px 7px', borderRadius: 3, letterSpacing: '0.1em' }}>A</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,145,0,0.8)', letterSpacing: '0.04em' }}>
              SCENARIO A LOCKED — {lockedRun.triggers.map(t => TRIGGERS[t]?.label ?? t).join(' + ')} · {lockedRun.intensity} · {lockedRun.context} · {PERSONAS.find(p => p.id === lockedRun.persona)?.label ?? lockedRun.persona}
            </span>
            <button onClick={() => { setLockedRun(null); setActiveBrief('current'); }}
              style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.08em' }}>
              UNLOCK
            </button>
          </div>
        )}

        {/* Trigger cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.16em' }}>
            SELECT SHOCK TRIGGER(S)
          </div>
          {triggerLiveData && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: triggerLiveData.live ? 'rgba(0,230,118,0.7)' : 'rgba(255,176,32,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.span
                animate={prefersReduced ? {} : { opacity: [1, 0.25, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}
              />
              {triggerLiveData.live
                ? `LIVE · ${triggerLiveData.total} headlines scanned`
                : 'FALLBACK · RSS unavailable'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {Object.entries(TRIGGERS).map(([key, t]) => {
            const active = selectedTriggers.includes(key);
            const live = triggerLiveData?.triggers?.[key];
            const signalDots = live ? Math.round(live.signal * 3) : 0;
            const isHot = signalDots >= 2;
            const isSuggested = autoSuggested.includes(key);
            const headline = live?.headlines?.[0];
            return (
              <motion.button key={key} onClick={() => toggleTrigger(key)}
                aria-pressed={active}
                aria-label={`${t.label}${active ? ', selected' : ''}. Live signal: ${signalDots} of 3.${headline ? ` Latest: ${headline}` : ''}`}
                whileHover={prefersReduced ? {} : { scale: 1.03, y: -2 }}
                whileTap={prefersReduced ? {} : { scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px',
                  background: active ? `${t.color}18` : 'rgba(255,255,255,0.02)',
                  border: `1.5px solid ${active ? t.color : isSuggested ? `${t.color}80` : isHot ? `${t.color}50` : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  boxShadow: active ? `0 0 20px ${t.color}22` : isHot ? `0 0 10px ${t.color}14` : 'none',
                  transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
                  width: isMobile ? '100%' : 210,
                  minWidth: 0, overflow: 'hidden',
                }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>

                  {/* Label + ACTIVE badge */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)' }}>
                      {t.label}
                    </span>
                    {isSuggested && !active && (
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
                        color: '#ffb020', border: '1px solid rgba(255,176,32,0.5)',
                        padding: '1px 5px', borderRadius: 2, flexShrink: 0,
                      }}>
                        TODAY
                      </span>
                    )}
                  {isHot && !isSuggested && (
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
                        color: t.color, border: `1px solid ${t.color}66`,
                        padding: '1px 5px', borderRadius: 2, flexShrink: 0,
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </span>

                  {/* Signal dots + label */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: i < signalDots ? t.color : 'rgba(255,255,255,0.12)',
                        transition: 'background 0.4s',
                      }} />
                    ))}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'rgba(255,255,255,0.28)', marginLeft: 4 }}>
                      {triggerLiveData
                        ? (signalDots === 0 ? 'no signal' : `${signalDots} signal${signalDots > 1 ? 's' : ''}`)
                        : t.sub}
                    </span>
                  </span>

                  {/* Live headline */}
                  {headline && (
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9.5,
                      color: active ? `${t.color}cc` : 'rgba(255,255,255,0.35)',
                      marginTop: 6, display: 'block',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      width: '100%',
                    }}>
                      {headline.length > 52 ? headline.slice(0, 49) + '…' : headline}
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Options row */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {([
            { label: 'INTENSITY',       opts: Object.keys(INTENSITIES), val: intensity, set: setIntensity },
            { label: 'MARKET CONTEXT',  opts: Object.keys(CONTEXTS),    val: context,   set: setContext },
            { label: 'REGION',          opts: REGIONS,                  val: region,    set: setRegion },
          ] as const).map(({ label, opts, val, set }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.12em', marginBottom: 7 }}>{label}</div>
              <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                {opts.map((o: string) => (
                  <button key={o} onClick={() => (set as (v: string) => void)(o)}
                    style={{
                      fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600,
                      padding: '8px 14px',
                      border: 'none', borderRight: '1px solid rgba(255,255,255,0.05)',
                      background: val === o ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: val === o ? '#fff' : 'rgba(255,255,255,0.38)',
                      cursor: 'pointer', letterSpacing: '0.06em', transition: 'all 0.15s',
                    }}>{o}</button>
                ))}
              </div>
            </div>
          ))}

          {/* Persona */}
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 7, color: lockedRun ? 'rgba(255,145,0,0.7)' : 'var(--txt-faint)' }}>
              BRIEF FOR
              {lockedRun && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: '#ff9100', background: 'rgba(255,145,0,0.12)', border: '1px solid rgba(255,145,0,0.35)', padding: '1px 5px', borderRadius: 2, letterSpacing: '0.1em' }}>
                  LOCKED
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <select value={persona} onChange={e => !lockedRun && setPersona(e.target.value)}
                disabled={!!lockedRun}
                style={{
                  fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600,
                  background: lockedRun ? 'rgba(255,145,0,0.06)' : 'rgba(255,255,255,0.05)',
                  color: lockedRun ? 'rgba(255,145,0,0.8)' : '#fff',
                  border: lockedRun ? '1px solid rgba(255,145,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  padding: '8px 14px',
                  cursor: lockedRun ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  height: '100%',
                  opacity: lockedRun ? 0.85 : 1,
                }}>
                <optgroup label="Business Roles" style={{ background: '#0c0f14' }}>
                  {PERSONAS.filter(p => !p.jobSeeker).map(p => (
                    <option key={p.id} value={p.id} style={{ background: '#0c0f14' }}>{p.icon} {p.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Job Seekers" style={{ background: '#0c0f14' }}>
                  {PERSONAS.filter(p => p.jobSeeker).map(p => (
                    <option key={p.id} value={p.id} style={{ background: '#0c0f14' }}>{p.icon} {p.label}</option>
                  ))}
                </optgroup>
              </select>
              {lockedRun && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 6,
                  pointerEvents: 'none',
                  border: '1px solid rgba(255,145,0,0.25)',
                }} />
              )}
            </div>
          </div>

          <motion.button onClick={handleRun} disabled={running || !selectedTriggers.length}
            aria-label={running ? 'Running cascade propagation…' : !selectedTriggers.length ? 'Select at least one trigger to run cascade' : 'Run cascade propagation'}
            aria-busy={running}
            whileHover={!prefersReduced && !running && selectedTriggers.length ? { scale: 1.03, y: -2 } : {}}
            whileTap={!prefersReduced && !running && selectedTriggers.length ? { scale: 0.97 } : {}}
            style={{
              fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.1em', color: '#07090c',
              background: running ? 'rgba(255,176,32,0.45)' : !selectedTriggers.length ? 'rgba(255,176,32,0.2)' : '#ffb020',
              border: 'none', borderRadius: 6,
              padding: '10px 28px', cursor: running || !selectedTriggers.length ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              alignSelf: 'flex-end',
            }}>
            {running ? '◌  PROPAGATING...' : '▶  RUN CASCADE'}
          </motion.button>
        </div>
      </motion.div>

      {/* ── NETWORK + DETAIL ──────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,48px)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)', borderBottom: isMobile ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingRight: isMobile ? 0 : 28, paddingTop: 28, paddingBottom: 28, position: 'relative' }}>
          <AnimatePresence>
            {running && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(7,9,12,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                <div style={{ textAlign: 'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 32, height: 32, border: '2px solid rgba(255,176,32,0.2)', borderTopColor: '#ffb020', borderRadius: '50%', margin: '0 auto 16px' }} />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#ffb020', letterSpacing: '0.08em' }}>Propagating cascade...</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <MacroNetwork impacts={impacts} onNodeClick={setSelectedNode} selectedNode={selectedNode} />
        </div>
        <div style={{ padding: 28 }}>
          <NodeDetail impacts={impacts} selectedNode={selectedNode} />
        </div>
      </div>

      {/* ── IMPACT GRID ───────────────────────────── */}
      <AnimatePresence>
        {impacts && (
          <motion.div initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
            style={{ maxWidth: 1200, margin: '0 auto', padding: '32px clamp(16px,4vw,48px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.16em', marginBottom: 18 }}>
              // SECTOR IMPACT MATRIX
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(172px,1fr))', gap: 10 }}>
              {Object.entries(SECTORS).map(([key, sec], i) => {
                const imp = impacts[key];
                const showMobileTooltip = mobileTooltip === key;

                // ── Delta pre-computation ──────────────────────────────────
                const lockedImp = lockedRun?.impacts[key];
                const rawDelta  = (imp && lockedImp) ? (imp.impact - lockedImp.impact) * 100 : null;
                const hasDelta  = rawDelta !== null && Math.abs(rawDelta) >= 0.15;
                const isFlipped = hasDelta && imp && lockedImp
                  ? (imp.impact > 0) !== (lockedImp.impact > 0) : false;
                const isAmplified = hasDelta && !isFlipped && imp && lockedImp
                  ? Math.abs(imp.impact) > Math.abs(lockedImp.impact) : false;
                const deltaColor  = isFlipped ? '#b388ff' : isAmplified ? '#ff9100' : '#00e676';
                const deltaBg     = isFlipped ? 'rgba(124,77,255,0.11)' : isAmplified ? 'rgba(255,145,0,0.11)' : 'rgba(0,230,118,0.08)';
                const deltaBorder = isFlipped ? 'rgba(124,77,255,0.40)' : isAmplified ? 'rgba(255,145,0,0.45)' : 'rgba(0,230,118,0.30)';
                const deltaTag    = isFlipped ? 'FLIP ↕' : isAmplified ? 'AMP ▲' : 'MIT ▼';

                const handleCardActivate = () => {
                  if (!imp) return;
                  if (isMobile) { setMobileTooltip(showMobileTooltip ? null : key); }
                  else { setSelectedNode(key); }
                };
                return (
                  <motion.div key={key}
                    role={imp ? 'button' : undefined}
                    tabIndex={imp ? 0 : undefined}
                    aria-label={imp
                      ? `${sec.label}: ${imp.impact > 0 ? '+' : ''}${(imp.impact * 100).toFixed(1)}% impact, T+${imp.lag} days, ${(imp.conf * 100).toFixed(0)}% confidence${hasDelta && rawDelta !== null ? `. Scenario delta: ${rawDelta > 0 ? '+' : ''}${rawDelta.toFixed(1)}%` : ''}`
                      : `${sec.label}: not reached by current cascade`}
                    aria-expanded={isMobile && imp ? showMobileTooltip : undefined}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardActivate(); } }}
                    initial={{ opacity: prefersReduced ? (imp ? 1 : 0.3) : 0, scale: prefersReduced ? 1 : 0.95 }}
                    animate={{ opacity: imp ? 1 : 0.3, scale: 1 }}
                    transition={{ duration: 0.4, delay: prefersReduced ? 0 : i * 0.03, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
                    whileHover={imp && !prefersReduced ? { y: -3, boxShadow: hasDelta ? `0 12px 36px ${deltaColor}28` : `0 10px 30px ${sec.color}18` } : {}}
                    onClick={handleCardActivate}
                    onMouseEnter={(e) => {
                      if (isMobile || !imp) return;
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const tipW = 288;
                      const tx = rect.right + 12 + tipW > window.innerWidth ? rect.left - tipW - 12 : rect.right + 12;
                      const ty = Math.max(8, Math.min(rect.top, window.innerHeight - 380));
                      setTooltipPos({ x: tx, y: ty });
                      setHoveredImpact(key);
                    }}
                    onFocus={(e) => {
                      if (isMobile || !imp) return;
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const tipW = 288;
                      const tx = rect.right + 12 + tipW > window.innerWidth ? rect.left - tipW - 12 : rect.right + 12;
                      const ty = Math.max(8, Math.min(rect.top, window.innerHeight - 380));
                      setTooltipPos({ x: tx, y: ty });
                      setHoveredImpact(key);
                    }}
                    onMouseLeave={() => setHoveredImpact(null)}
                    onBlur={() => setHoveredImpact(null)}
                    style={{
                      background: hasDelta ? deltaBg : 'rgba(255,255,255,0.025)',
                      border: `1.5px solid ${hasDelta ? deltaColor + '55' : imp ? sec.color + '30' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: hasDelta ? `0 0 0 1px ${deltaBorder}, 0 4px 20px ${deltaColor}14` : 'none',
                      borderRadius: 8, padding: '14px', cursor: imp ? 'pointer' : 'default',
                      transition: 'border-color 0.2s, background 0.3s, box-shadow 0.3s', position: 'relative',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color, boxShadow: imp ? `0 0 8px ${sec.color}` : 'none', marginTop: 2 }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {hasDelta && (
                          <span style={{
                            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.07em',
                            color: deltaColor, background: deltaBg,
                            border: `1px solid ${deltaBorder}`,
                            padding: '2px 6px', borderRadius: 3, lineHeight: 1.5,
                          }}>
                            {deltaTag}
                          </span>
                        )}
                        {imp && isMobile && (
                          <button
                            aria-label={`${showMobileTooltip ? 'Hide' : 'Show'} details for ${sec.label}`}
                            onClick={(e) => { e.stopPropagation(); setMobileTooltip(showMobileTooltip ? null : key); }}
                            style={{ fontFamily: 'var(--mono)', fontSize: 10, color: showMobileTooltip ? sec.color : 'rgba(255,255,255,0.25)', cursor: 'pointer', lineHeight: 1, background: 'transparent', border: 'none', padding: '6px', margin: '-6px', borderRadius: 4 }}>ⓘ</button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 7, color: 'rgba(255,255,255,0.85)' }}>{sec.label}</div>
                    {imp ? (
                      <>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 800, color: imp.impact > 0 ? '#ff5252' : '#00e676', lineHeight: 1 }}>
                          {imp.impact > 0 ? '+' : ''}{(imp.impact * 100).toFixed(1)}%
                        </div>
                        {/* Delta vs Scenario A — prominent pill */}
                        {hasDelta && rawDelta !== null && (
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 6, marginTop: 5,
                            padding: '5px 8px',
                            background: deltaBg, border: `1px solid ${deltaBorder}`, borderRadius: 5,
                          }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 800, color: deltaColor, letterSpacing: '-0.01em' }}>
                              Δ {rawDelta > 0 ? '+' : ''}{rawDelta.toFixed(1)}%
                            </span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: deltaColor, opacity: 0.65 }}>
                              vs A
                            </span>
                          </div>
                        )}
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', marginTop: 5 }}>
                          T+{imp.lag}d · {(imp.conf * 100).toFixed(0)}% conf
                          {imp.circuitBreaker && <span style={{ color: '#ff3b30', marginLeft: 6 }}>⚠</span>}
                        </div>
                        <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 10, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: prefersReduced ? Math.min(1, Math.abs(imp.impact)) : Math.min(1, Math.abs(imp.impact)) }}
                            transition={{ duration: prefersReduced ? 0 : 0.8, delay: prefersReduced ? 0 : i * 0.03, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
                            style={{ height: '100%', width: '100%', background: sec.color, borderRadius: 2, transformOrigin: 'left' }} />
                        </div>
                        {/* Mobile inline tooltip */}
                        <AnimatePresence>
                          {showMobileTooltip && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              style={{ overflow: 'hidden', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${sec.color}30` }}>
                              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 8 }}>
                                {impactSentence(sec.label, imp.impact)}
                              </div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>⏱ {lagLabel(imp.lag)}</div>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>🎯 {(imp.conf * 100).toFixed(0)}% historical confidence</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', lineHeight: 1.55 }}>{imp.mechanism}</div>
                              {/* Mobile delta comparison */}
                              {hasDelta && rawDelta !== null && lockedImp && (
                                <div style={{ marginTop: 10, padding: '8px 10px', background: deltaBg, border: `1px solid ${deltaBorder}`, borderRadius: 6 }}>
                                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, fontWeight: 700, color: deltaColor, letterSpacing: '0.1em', marginBottom: 6 }}>⇄ SCENARIO DELTA</div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.4)' }}>A (locked)</span>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
                                      {lockedImp.impact > 0 ? '+' : ''}{(lockedImp.impact * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.4)' }}>B (current)</span>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: imp.impact > 0 ? '#ff5252' : '#00e676' }}>
                                      {imp.impact > 0 ? '+' : ''}{(imp.impact * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, color: deltaColor, textAlign: 'center', paddingTop: 5, borderTop: `1px solid ${deltaBorder}` }}>
                                    Δ {rawDelta > 0 ? '+' : ''}{rawDelta.toFixed(1)}% · {isFlipped ? 'Direction reversed' : isAmplified ? 'Amplified in B' : 'Mitigated in B'}
                                  </div>
                                </div>
                              )}
                              {imp.circuitBreaker && (
                                <div style={{ marginTop: 8, fontSize: 11, color: '#ff5252' }}>⚠ Extreme — may trigger emergency policy intervention</div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'rgba(255,255,255,0.15)' }}>—</div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Lock & Compare */}
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <motion.button onClick={handleLock}
                aria-label={lockedRun ? 'Replace Scenario A with current results' : 'Lock current results as Scenario A for comparison'}
                whileHover={prefersReduced ? {} : { scale: 1.02, y: -1 }}
                whileTap={prefersReduced ? {} : { scale: 0.97 }}
                style={{
                  fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                  color: lockedRun ? '#ff9100' : 'rgba(255,255,255,0.55)',
                  background: lockedRun ? 'rgba(255,145,0,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${lockedRun ? 'rgba(255,145,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6, padding: '9px 22px', cursor: 'pointer', transition: 'all 0.18s',
                }}>
                {lockedRun ? '⟳  REPLACE SCENARIO A' : '⊠  LOCK AS SCENARIO A'}
              </motion.button>
              {lockedRun && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
                  Change parameters above and run again — delta appears in each cell
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LLM BRIEF ─────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px clamp(16px,4vw,48px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Screen reader live region — announces cascade + brief status changes */}
        <div
          id={liveRegionId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          {llmStatusMsg}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.16em', marginBottom: 20 }}>
          // STRATEGIC INTELLIGENCE BRIEF · AI-GENERATED · PLAIN ENGLISH
        </div>

        <AnimatePresence mode="wait">
          {llmLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 0' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 20, height: 20, border: '2px solid rgba(255,176,32,0.2)', borderTopColor: '#ffb020', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#ffb020', letterSpacing: '0.06em' }}>
                Generating brief for {PERSONAS.find(p => p.id === persona)?.label}...
              </span>
            </motion.div>
          )}

          {llmError && !llmLoading && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'rgba(255,80,70,0.8)', padding: '14px 16px', background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 6 }}>
              {llmError}
            </motion.div>
          )}

          {llmText && !llmLoading && (
            <motion.div key="brief" initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16,1,0.3,1] as [number, number, number, number] }}>

              {/* A / B tab toggle — only when locked run has a brief */}
              {lockedRun?.llmText && (
                <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 6, overflow: 'hidden', width: 'fit-content' }}>
                  {([
                    { val: 'locked'  as const, label: 'A — LOCKED',  color: '#ff9100' },
                    { val: 'current' as const, label: 'B — CURRENT', color: '#ffb020' },
                  ]).map(({ val, label, color }) => (
                    <button key={val} onClick={() => setActiveBrief(val)}
                      style={{
                        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                        padding: '9px 20px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                        background: activeBrief === val ? `${color}20` : 'transparent',
                        color: activeBrief === val ? color : 'rgba(255,255,255,0.28)',
                        borderRight: val === 'locked' ? '1px solid rgba(255,255,255,0.07)' : 'none',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <LlmBrief
                text={lockedRun?.llmText && activeBrief === 'locked' ? lockedRun.llmText : llmText}
                persona={PERSONAS.find(p => p.id === persona)}
              />
            </motion.div>
          )}

          {!llmText && !llmLoading && !llmError && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', lineHeight: 1.8, padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 8 }}>
              // Select a trigger and run the cascade to generate your personalised brief<br />
              // The AI reads the full cascade output + live market conditions<br />
              // and translates the impact into plain English for your specific role
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── HISTORICAL ANCHORS ────────────────────── */}
      {selectedTriggers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto', padding: '28px clamp(16px,4vw,48px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.16em', marginBottom: 16 }}>
            // HISTORICAL CALIBRATION
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {selectedTriggers.flatMap(tid =>
              (TRIGGERS[tid]?.anchors ?? []).map((a, i) => ({ ...a, color: TRIGGERS[tid].color, key: tid + i }))
            ).map(a => (
              <motion.div key={a.key} whileHover={{ y: -2 }}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{a.event}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, display: 'flex', gap: 16, color: 'var(--txt-dim)' }}>
                  <span>Oil <span style={{ color: parseFloat(a.oil) >= 0 ? '#ff5252' : '#00e676' }}>{a.oil}</span></span>
                  <span>Equity <span style={{ color: parseFloat(a.equity) >= 0 ? '#ff5252' : '#00e676' }}>{a.equity}</span></span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--txt-faint)', marginTop: 5 }}>{a.note}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── MARKET STRIP TOOLTIP ──────────────────── */}
      {(() => {
        const MARKET_TIPS: Record<string, { title: string; body: string; range?: string }> = {
          VIX: {
            title: "VIX — The Market's Fear Gauge",
            body: "Measures how much volatility investors expect in the S&P 500 over the next 30 days. Think of it as a collective anxiety score. When it spikes, institutions are buying protection — usually because something bad is expected.",
            range: "Under 15 = calm · 15–25 = normal · 25–35 = stressed · Above 35 = panic",
          },
          WTI: {
            title: "WTI Crude — US Oil Benchmark",
            body: "West Texas Intermediate is the benchmark price for US crude oil per barrel in USD. Every $10 move in WTI adds or removes ~$1.50–2.00 from the cost of filling a car tank and directly affects jet fuel, diesel, and plastics costs globally.",
            range: "Below $60 = deflationary · $60–90 = normal · Above $90 = inflationary pressure",
          },
          SP500: {
            title: "S&P 500 — US Equity Barometer",
            body: "Daily change in the 500 largest US companies by market cap. Used as a proxy for overall corporate earnings expectations and investor risk appetite. A -2% day is notable; -5% in a day triggers circuit breakers on US exchanges.",
            range: "Daily moves: ±1% = normal · ±2% = elevated · ±3%+ = significant event",
          },
          USDEUR: {
            title: "USD/EUR — Dollar Strength Signal",
            body: "How many euros one US dollar buys. A stronger dollar (number rising) makes US exports more expensive, pressures emerging market dollar-denominated debt, and compresses earnings for US multinationals reporting overseas revenue.",
            range: "Above 1.10 = strong USD · 1.05–1.10 = neutral · Below 1.00 = very strong USD (rare)",
          },
          GOLD: {
            title: "Gold — Safe Haven Asset",
            body: "Price per troy ounce in USD. Gold rises when investors distrust paper assets — in geopolitical crises, high inflation, or banking stress. It's the oldest insurance policy against systemic failure.",
            range: "Below $1,800 = low fear · $1,800–2,200 = elevated · Above $2,500 = significant flight to safety",
          },
          UST10Y: {
            title: "10-Year US Treasury Yield",
            body: "The interest rate the US government pays to borrow for 10 years. This is the global risk-free rate — it directly sets mortgage rates, corporate bond pricing, and the discount rate used to value equities. When this rises sharply, growth stocks fall hardest.",
            range: "Below 2% = easy money · 2–4% = normal · Above 5% = tight — significant headwind for equities and real estate",
          },
        };
        const tip = hoveredMarket ? MARKET_TIPS[hoveredMarket] : null;
        if (!tip) return null;
        const leftPos = Math.min(marketTipPos.x, window.innerWidth - 312);
        return (
          <motion.div
            key={hoveredMarket}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'fixed', left: leftPos, top: marketTipPos.y,
              zIndex: 1001, width: 300, pointerEvents: 'none',
              background: 'rgba(10,13,18,0.98)',
              border: '1px solid rgba(255,176,32,0.3)',
              borderRadius: 10, padding: '14px 16px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(24px)',
            }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: '#ffb020', letterSpacing: '0.12em', marginBottom: 8 }}>
              {tip.title.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: tip.range ? 10 : 0 }}>
              {tip.body}
            </div>
            {tip.range && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {tip.range}
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* ── DESKTOP HOVER TOOLTIP ─────────────────── */}
      <AnimatePresence>
        {hoveredImpact && !isMobile && impacts?.[hoveredImpact] && (() => {
          const imp  = impacts[hoveredImpact]!;
          const sec  = SECTORS[hoveredImpact];
          const mag  = (Math.abs(imp.impact) * 100).toFixed(1);
          // Delta computation for tooltip
          const tipLockedImp  = lockedRun?.impacts[hoveredImpact];
          const tipRawDelta   = tipLockedImp ? (imp.impact - tipLockedImp.impact) * 100 : null;
          const tipHasDelta   = tipRawDelta !== null && Math.abs(tipRawDelta) >= 0.15;
          const tipIsFlipped  = tipHasDelta && tipLockedImp ? (imp.impact > 0) !== (tipLockedImp.impact > 0) : false;
          const tipIsAmp      = tipHasDelta && !tipIsFlipped && tipLockedImp ? Math.abs(imp.impact) > Math.abs(tipLockedImp.impact) : false;
          const tipDeltaColor  = tipIsFlipped ? '#b388ff' : tipIsAmp ? '#ff9100' : '#00e676';
          const tipDeltaBg     = tipIsFlipped ? 'rgba(124,77,255,0.10)' : tipIsAmp ? 'rgba(255,145,0,0.10)' : 'rgba(0,230,118,0.07)';
          const tipDeltaBorder = tipIsFlipped ? 'rgba(124,77,255,0.38)' : tipIsAmp ? 'rgba(255,145,0,0.42)' : 'rgba(0,230,118,0.28)';
          return (
            <motion.div
              key={hoveredImpact}
              initial={{ opacity: 0, scale: 0.97, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed', left: tooltipPos.x, top: tooltipPos.y,
                zIndex: 1000, width: 280, pointerEvents: 'none',
                background: 'rgba(10,13,18,0.98)',
                border: `1px solid ${sec.color}44`,
                borderRadius: 10, padding: '16px 18px',
                boxShadow: `0 20px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)`,
                backdropFilter: 'blur(24px)',
              }}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color, boxShadow: `0 0 8px ${sec.color}`, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: sec.color, letterSpacing: '0.14em' }}>{sec.label.toUpperCase()}</span>
              </div>

              {/* Impact number + plain-English sentence */}
              <div style={{ fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 800, color: imp.impact > 0 ? '#ff5252' : '#00e676', lineHeight: 1, marginBottom: 8 }}>
                {imp.impact > 0 ? '+' : ''}{mag}%
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, marginBottom: 14 }}>
                {impactSentence(sec.label, imp.impact)}
              </div>

              {/* Time lag */}
              <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 5 }}>⏱ TIME TO IMPACT · T+{imp.lag} DAYS</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>{lagLabel(imp.lag)}</div>
              </div>

              {/* Confidence */}
              <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 5 }}>🎯 CONFIDENCE · {(imp.conf * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>
                  In {(imp.conf * 100).toFixed(0)}% of historically comparable shocks, this sector responded within this magnitude range. The remaining {(100 - imp.conf * 100).toFixed(0)}% accounts for policy intervention or unexpected offsets.
                </div>
              </div>

              {/* Mechanism */}
              <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 5 }}>💬 HOW IT TRANSMITS</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{imp.mechanism}</div>
              </div>

              {/* Circuit breaker */}
              {imp.circuitBreaker && (
                <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: '#ff5252', lineHeight: 1.55 }}>⚠ Circuit Breaker — impact is extreme enough to likely trigger emergency intervention (central bank, government). Actual outcome may deviate significantly from the model.</div>
                </div>
              )}

              {/* Scenario delta comparison */}
              {tipHasDelta && tipRawDelta !== null && tipLockedImp && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: tipDeltaBg, border: `1px solid ${tipDeltaBorder}`, borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: tipDeltaColor, letterSpacing: '0.12em', marginBottom: 8 }}>
                    ⇄ SCENARIO DELTA
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.35)' }}>A — locked</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
                      {tipLockedImp.impact > 0 ? '+' : ''}{(tipLockedImp.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.35)' }}>B — current</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: imp.impact > 0 ? '#ff5252' : '#00e676' }}>
                      {imp.impact > 0 ? '+' : ''}{(imp.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 900, color: tipDeltaColor,
                    textAlign: 'center', padding: '6px 0 2px',
                    borderTop: `1px solid ${tipDeltaBorder}`,
                  }}>
                    Δ {tipRawDelta > 0 ? '+' : ''}{tipRawDelta.toFixed(1)}%
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: tipDeltaColor, opacity: 0.7, textAlign: 'center', marginTop: 3 }}>
                    {tipIsFlipped ? 'Direction reversed A → B' : tipIsAmp ? 'Amplified in Scenario B' : 'Mitigated in Scenario B'}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <footer style={{ maxWidth: 1200, margin: '0 auto', padding: '24px clamp(16px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)' }}>MACRO_ENGINE · BFS propagation, historically calibrated · Not financial advice</span>
        <button onClick={() => window.print()}
          style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>
          ⊞ Export Brief
        </button>
      </footer>
    </div>
  );
}

function NodeDetail({ impacts, selectedNode }: { impacts: Record<string, ImpactResult> | null; selectedNode: string | null }) {
  if (!selectedNode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 320, textAlign: 'center', gap: 12 }}>
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: 32, color: 'rgba(255,255,255,0.2)' }}>◈</motion.div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', lineHeight: 1.8 }}>Click any node<br />to inspect its<br />cascade impact</div>
      </div>
    );
  }
  const sec = SECTORS[selectedNode];
  const imp = impacts?.[selectedNode];
  if (!sec) return null;

  return (
    <motion.div key={selectedNode} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] as [number, number, number, number] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: sec.color, boxShadow: `0 0 10px ${sec.color}` }} />
        <div style={{ fontSize: 14, fontWeight: 700 }}>{sec.label}</div>
      </div>
      {imp ? (
        <>
          {[
            ['Impact',         `${imp.impact > 0 ? '+' : ''}${(imp.impact * 100).toFixed(1)}%`],
            ['Direction',       imp.impact > 0 ? '▲ Pressure Up' : '▼ Pressure Down'],
            ['Lag from shock', `T+${imp.lag} days`],
            ['Confidence',     `${(imp.conf * 100).toFixed(0)}%`],
            ['Via',             imp.via ? SECTORS[imp.via]?.label ?? imp.via : 'Direct shock'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--txt-faint)' }}>{k}</span>
              <span style={{ fontWeight: 600, color: k === 'Impact' ? (imp.impact > 0 ? '#ff5252' : '#00e676') : 'var(--txt)' }}>{v}</span>
            </div>
          ))}
          <motion.div initial={{ width: 0 }} animate={{ width: `${imp.conf * 100}%` }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
            style={{ height: 2, background: sec.color, borderRadius: 2, marginTop: 14 }} />
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--txt-dim)', lineHeight: 1.7, padding: '12px 14px', background: `${sec.color}09`, border: `1px solid ${sec.color}22`, borderRadius: 6 }}>
            {imp.mechanism}
          </div>
          {imp.circuitBreaker && (
            <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, color: '#ff3b30', border: '1px solid rgba(255,59,48,0.25)', padding: '7px 12px', borderRadius: 5 }}>
              ⚠ SYSTEMIC — Circuit breaker threshold exceeded
            </div>
          )}
        </>
      ) : (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', lineHeight: 1.8, marginTop: 8 }}>
          No cascade path reached<br />this sector under the<br />current parameters.
        </div>
      )}
    </motion.div>
  );
}

function LlmBrief({ text, persona }: { text: string; persona?: { label: string; icon: string; jobSeeker?: boolean } }) {
  // Strip any preamble before the first markdown heading (search grounding may add one)
  const headerIdx = text.search(/(?:^|\n)(#{1,2} )/);
  const cleanText = headerIdx > 0 ? text.slice(headerIdx).trim() : text.trim();
  // Prepend newline so the lookahead split catches the very first section
  const sections = ('\n' + cleanText).split(/(?=\n#{1,2} )/).filter(s => s.trim());

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(255,176,32,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,176,32,0.18)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Brief header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,176,32,0.1)', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,176,32,0.05)' }}>
        <span style={{ fontSize: 24 }}>{persona?.icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#ffb020', letterSpacing: '0.14em', marginBottom: 2 }}>
            {persona?.jobSeeker ? 'JOB SEEKER BRIEF' : 'STRATEGIC BRIEF FOR'}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{persona?.label}</div>
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(0,230,118,0.7)', border: '1px solid rgba(0,230,118,0.2)', padding: '3px 10px', borderRadius: 2, letterSpacing: '0.08em' }}>
          Macro Intelligence Report
        </span>
      </div>

      {/* Sections */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map((section, i) => {
          const lines   = section.replace(/^[\n]+/, '').split('\n');
          const heading = lines[0].replace(/^#+\s*/, '').trim();
          // Split body into paragraphs so newlines render correctly
          const bodyParas = lines.slice(1).join('\n').trim()
            .split(/\n\n+/)
            .map(p => p.replace(/\n/g, ' ').trim())
            .filter(Boolean);
          if (!heading && !bodyParas.length) return null;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              {heading && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: '#ffb020', letterSpacing: '0.14em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12 }}>{'●'.repeat(Math.min(i + 1, 4)).split('').join('')}</span>
                  {heading.toUpperCase()}
                </div>
              )}
              {bodyParas.map((para, pi) => (
                <p key={pi} style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.78, marginBottom: pi < bodyParas.length - 1 ? 10 : 0 }}>{para}</p>
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
