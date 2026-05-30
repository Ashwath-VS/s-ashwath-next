'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  SECTORS, TRIGGERS, CONTEXTS, INTENSITIES, PERSONAS,
  runSimulation, type ImpactResult,
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

export default function ScenariosPage() {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [intensity,   setIntensity]   = useState('SEVERE');
  const [context,     setContext]     = useState('BASELINE');
  const [region,      setRegion]      = useState('GLOBAL');
  const [persona,     setPersona]     = useState('investment');
  const [impacts,     setImpacts]     = useState<Record<string, ImpactResult> | null>(null);
  const [selectedNode,setSelectedNode] = useState<string | null>(null);
  const [running,     setRunning]     = useState(false);
  const [marketData,  setMarketData]  = useState<MarketData | null>(null);
  const [triggerLiveData, setTriggerLiveData] = useState<TriggerLiveData | null>(null);
  const [llmText,     setLlmText]     = useState('');
  const [llmLoading,  setLlmLoading]  = useState(false);
  const [llmError,    setLlmError]    = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch('/api/market').then(r => r.json()).then((d: MarketData) => {
      setMarketData(d);
      if (d.autoContext) setContext(d.autoContext);
    }).catch(() => {});

    fetch('/api/triggers').then(r => r.json()).then((d: TriggerLiveData) => {
      setTriggerLiveData(d);
    }).catch(() => {});
  }, []);

  const toggleTrigger = (id: string) =>
    setSelectedTriggers(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);

  const handleRun = useCallback(async () => {
    if (!selectedTriggers.length) return;
    setRunning(true); setLlmText(''); setLlmError('');
    await new Promise(r => setTimeout(r, 700));

    const liveSeeds: Record<string, number> = {};
    if (marketData) {
      const oc = parseFloat(marketData.oilChange ?? '0');
      const sc = parseFloat(marketData.sp500Change ?? '0');
      if (Math.abs(oc) > 0.01) liveSeeds['OIL_ENERGY']    = oc;
      if (Math.abs(sc) > 0.01) liveSeeds['EQUITY_MARKETS'] = sc;
    }

    const results = runSimulation(selectedTriggers, intensity, context, region, liveSeeds);
    setImpacts(results);
    setRunning(false);

    setLlmLoading(true);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, triggers: selectedTriggers, impacts: results, liveData: marketData, intensity, context }),
      });
      const data = await res.json();
      if (data.error) setLlmError(data.error);
      else setLlmText(data.text ?? '');
    } catch {
      setLlmError('Could not reach LLM. Check GEMINI_API_KEY in Netlify environment variables.');
    }
    setLlmLoading(false);
  }, [selectedTriggers, intensity, context, region, persona, marketData]);

  const contextColor = context === 'CRISIS' ? '#ff3b30' : context === 'STRESSED' ? '#ffb020' : '#00e676';

  return (
    <div style={{ paddingTop: 52 }}>

      {/* ── LIVE MARKET STRIP ─────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px clamp(16px,4vw,48px)', display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', backdropFilter: 'blur(8px)' }}>

        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', display: 'flex', alignItems: 'center', gap: 6, color: marketData?.source === 'live' ? '#00e676' : '#ffb020' }}>
          <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {marketData?.source?.toUpperCase() ?? 'LOADING'}
        </span>

        {[
          { label: 'VIX',     val: marketData?.vix },
          { label: 'WTI',     val: marketData?.oil    ? `$${marketData.oil}`   : null },
          { label: 'S&P 500', val: marketData?.sp500 },
          { label: 'USD/EUR', val: marketData?.usdEur },
          { label: 'GOLD',    val: marketData?.gold   ? `$${marketData.gold}`  : null },
          { label: '10Y UST', val: marketData?.tenYear ? `${marketData.tenYear}%` : null },
        ].map(item => item.val ? (
          <span key={item.label} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>
            {item.label}{' '}<strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{item.val}</strong>
          </span>
        ) : null)}

        {marketData?.autoContext && (
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: contextColor, border: `1px solid ${contextColor}44`, padding: '3px 10px', borderRadius: '2px', letterSpacing: '0.1em' }}>
            MARKET: {marketData.autoContext}
          </span>
        )}
      </motion.div>

      {/* ── HEADER ────────────────────────────────── */}
      <div style={{ padding: '52px clamp(16px,4vw,48px) 40px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] as [number, number, number, number] }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#ff9100', letterSpacing: '0.18em', marginBottom: 14 }}>
            MACRO_ENGINE · DOMAIN_05 · LIVE SIMULATION
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 14 }}>
            Macro Cascade <span style={{ color: '#ff9100' }}>Intelligence</span> Engine
          </h1>
          <p style={{ fontSize: 15, color: 'var(--txt-dim)', maxWidth: 560, lineHeight: 1.65 }}>
            Select a macro shock. The propagation engine traces impact through 13 sectors using today&apos;s market conditions — then an AI brief tells you exactly what it means for your role.
          </p>
        </motion.div>
      </div>

      {/* ── CONTROLS ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 36px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Trigger cards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.16em' }}>
            SELECT SHOCK TRIGGER(S)
          </div>
          {triggerLiveData && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: triggerLiveData.live ? 'rgba(0,230,118,0.7)' : 'rgba(255,176,32,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.span
                animate={{ opacity: [1, 0.25, 1] }}
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
            const headline = live?.headlines?.[0];
            return (
              <motion.button key={key} onClick={() => toggleTrigger(key)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px',
                  background: active ? `${t.color}18` : 'rgba(255,255,255,0.02)',
                  border: `1.5px solid ${active ? t.color : isHot ? `${t.color}50` : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  boxShadow: active ? `0 0 20px ${t.color}22` : isHot ? `0 0 10px ${t.color}14` : 'none',
                  transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
                  maxWidth: isMobile ? '100%' : 220,
                }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>

                  {/* Label + ACTIVE badge */}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.7)' }}>
                      {t.label}
                    </span>
                    {isHot && (
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
                      maxWidth: 172,
                    }}>
                      {headline.length > 58 ? headline.slice(0, 55) + '…' : headline}
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
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.12em', marginBottom: 7 }}>BRIEF FOR</div>
            <select value={persona} onChange={e => setPersona(e.target.value)}
              style={{
                fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                padding: '8px 14px', cursor: 'pointer', outline: 'none',
                height: '100%',
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
          </div>

          <motion.button onClick={handleRun} disabled={running || !selectedTriggers.length}
            whileHover={!running && selectedTriggers.length ? { scale: 1.03, y: -2 } : {}}
            whileTap={!running && selectedTriggers.length ? { scale: 0.97 } : {}}
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
            style={{ maxWidth: 1200, margin: '0 auto', padding: '32px clamp(16px,4vw,48px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: 'var(--txt-faint)', letterSpacing: '0.16em', marginBottom: 18 }}>
              // SECTOR IMPACT MATRIX
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(172px,1fr))', gap: 10 }}>
              {Object.entries(SECTORS).map(([key, sec], i) => {
                const imp = impacts[key];
                return (
                  <motion.div key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: imp ? 1 : 0.3, scale: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.03, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
                    whileHover={imp ? { y: -3, boxShadow: `0 10px 30px ${sec.color}18` } : {}}
                    onClick={() => imp && setSelectedNode(key)}
                    style={{
                      background: 'rgba(255,255,255,0.025)', border: `1px solid ${imp ? sec.color + '30' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 8, padding: '14px', cursor: imp ? 'pointer' : 'default',
                      transition: 'border-color 0.2s',
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color, marginBottom: 9, boxShadow: imp ? `0 0 8px ${sec.color}` : 'none' }} />
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 7, color: 'rgba(255,255,255,0.85)' }}>{sec.label}</div>
                    {imp ? (
                      <>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 800, color: imp.impact > 0 ? '#ff5252' : '#00e676', lineHeight: 1 }}>
                          {imp.impact > 0 ? '+' : ''}{(imp.impact * 100).toFixed(1)}%
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', marginTop: 5 }}>
                          T+{imp.lag}d · {(imp.conf * 100).toFixed(0)}% conf
                          {imp.circuitBreaker && <span style={{ color: '#ff3b30', marginLeft: 6 }}>⚠</span>}
                        </div>
                        <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginTop: 10, overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.abs(imp.impact) * 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.03, ease: [0.16,1,0.3,1] as [number, number, number, number] }}
                            style={{ height: '100%', background: sec.color, borderRadius: 2 }} />
                        </div>
                      </>
                    ) : (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'rgba(255,255,255,0.15)' }}>—</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LLM BRIEF ─────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px clamp(16px,4vw,48px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
            <motion.div key="brief" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16,1,0.3,1] as [number, number, number, number] }}>
              <LlmBrief text={llmText} persona={PERSONAS.find(p => p.id === persona)} />
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
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--txt-dim)', lineHeight: 1.7, padding: '12px 14px', background: 'rgba(255,255,255,0.025)', borderLeft: `2px solid ${sec.color}55`, borderRadius: '0 6px 6px 0' }}>
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
  const sections = text.split(/(?=\n## |\n# )/).filter(s => s.trim());

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
          AI · GEMINI 2.5
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
