'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useScrambleText } from '@/hooks/useScrambleText';
import { useIsMobile } from '@/hooks/useIsMobile';
import Marquee from '@/components/Marquee';

// ── CountUp ────────────────────────────────────────────────
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let v = 0;
      const step = () => {
        v += Math.ceil(target / 40);
        if (v >= target) { setVal(target); return; }
        setVal(v);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── System Status Panel ────────────────────────────────────
const DOMAINS_STATUS = [
  { id: 'DOMAIN_01', name: 'E-Commerce',  status: 'COMPLETE', color: '#00e676' },
  { id: 'DOMAIN_02', name: 'Fin-Tech',    status: 'LIVE',     color: '#2979ff' },
  { id: 'DOMAIN_03', name: 'Insurance',   status: 'LIVE',     color: '#7c4dff' },
  { id: 'DOMAIN_04', name: 'Travel-Tech', status: 'LIVE',     color: '#00acc1' },
  { id: 'DOMAIN_05', name: 'Macro Eng.',  status: 'LIVE',     color: '#ff9100' },
];

const BOOT = [
  '> initialising multi-domain engine...',
  '> connecting to market feeds...',
  '> loading 13 sectors, 31 edges...',
  '> agents online: 5 / 5 — all domains live',
  '> system ready.',
];

function SystemStatusPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '26px 24px',
        background: 'rgba(0,0,0,0.35)',
        fontFamily: 'var(--mono)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--acc), transparent 60%)' }} />

      {/* Boot sequence */}
      {BOOT.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.18 }}
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 5, letterSpacing: '0.04em' }}
        >
          {line}
          {i === BOOT.length - 1 && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ color: 'var(--live)', marginLeft: 6 }}
            >▋</motion.span>
          )}
        </motion.div>
      ))}

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '16px 0', transformOrigin: 'left' }}
      />

      {/* Domain status */}
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', marginBottom: 14 }}>
        DOMAIN STATUS
      </div>

      {DOMAINS_STATUS.map((d, i) => {
        const isLive = d.status !== 'BUILDING';
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 + i * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}
          >
            <motion.span
              animate={isLive ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: isLive ? d.color : 'rgba(255,255,255,0.15)',
                boxShadow: isLive ? `0 0 8px ${d.color}` : 'none',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', width: 72, flexShrink: 0 }}>{d.id}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', flex: 1 }}>{d.name}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              color: isLive ? d.color : 'rgba(255,255,255,0.2)',
            }}>{d.status}</span>
          </motion.div>
        );
      })}

      {/* Agents bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 10, paddingTop: 14 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)' }}>AGENTS ONLINE</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--live)' }}>5 / 5</span>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 2.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--live), rgba(0,230,118,0.4))', borderRadius: 2 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Domain data ────────────────────────────────────────────
const domains = [
  {
    href: '/ecommerce',
    title: 'E-Commerce',
    tag: '✓ COMPLETE',
    color: '#00e676',
    desc: 'Seven AI systems. One B2B marketplace. Built solo, end to end.',
    num: 'DOMAIN_01',
    live: true,
    grid: { col: '1 / 3', row: '1 / 2' },
  },
  {
    href: '/scenarios',
    title: 'Macro Engine',
    tag: '◈ SIM LIVE',
    color: '#ff9100',
    desc: 'Pick a shock. Watch 13 sectors cascade. Get an AI brief for your role.',
    num: 'DOMAIN_05',
    live: true,
    grid: { col: '3 / 4', row: '1 / 3' },
  },
  {
    href: '/fintech',
    title: 'Fin-Tech',
    tag: '◐ AGENT LIVE',
    color: '#2979ff',
    desc: 'MSME credit intelligence with GST, bank, and ITR triangulation.',
    num: 'DOMAIN_02',
    live: true,
    grid: { col: '1 / 2', row: '2 / 3' },
  },
  {
    href: '/traveltech',
    title: 'Travel-Tech',
    tag: '◐ 2 AGENTS LIVE',
    color: '#00acc1',
    desc: 'Two live systems — AirWave (fare scenario intelligence, 8 market agents) and SQUALL.IROPS (live airline-disruption nowcasting).',
    num: 'DOMAIN_04',
    live: true,
    grid: { col: '2 / 3', row: '2 / 3' },
  },
  {
    href: '/insurance',
    title: 'Insurance',
    tag: '◐ AGENT LIVE',
    color: '#7c4dff',
    desc: 'AI claims triage with fraud signal scoring. FNOL to adjuster brief in seconds.',
    num: 'DOMAIN_03',
    live: true,
    grid: { col: '1 / 4', row: '3 / 4' },
  },
];

const agentCards = [
  {
    href: '/fintech',
    slot: 'SLOT_01',
    title: 'SME Credit Analyst',
    desc: 'Enter GST, bank credits, ITR. Get a structured credit brief with risk flags and a recommended limit.',
    cta: 'Try the agent',
    color: '#2979ff',
    domain: 'DOMAIN_02',
    icon: '◎',
  },
  {
    href: '/traveltech',
    slot: 'SLOT_02',
    title: 'AirWave Fare Agent',
    desc: 'Enter route, cabin class, and current fare. AirWave runs 8 market agents and returns a go/no-go rebooking signal with net savings after change fees.',
    cta: 'Try the agent',
    color: '#00acc1',
    domain: 'DOMAIN_04',
    icon: '◎',
  },
  {
    href: 'https://irops.s-ashwath.com',
    slot: 'SLOT_03',
    title: 'SQUALL.IROPS Disruption Agent',
    desc: 'Enter a route. Squall predicts airline disruption risk from live weather, news and air-traffic, scores every real flight, then drafts proactive passenger rebooking messages — with the dollar case for acting early.',
    cta: 'Launch app',
    color: '#ff7043',
    domain: 'DOMAIN_04',
    icon: '◈',
  },
  {
    href: '/scenarios',
    slot: 'SLOT_04',
    title: 'Macro Cascade Simulator',
    desc: 'Pick a macro shock, get a full sector cascade and an AI brief tailored to your role.',
    cta: 'Run simulation',
    color: '#ff9100',
    domain: 'DOMAIN_05',
    icon: '◈',
  },
  {
    href: '/insurance',
    slot: 'SLOT_05',
    title: 'Claims Triage Agent',
    desc: 'Enter FNOL details — policy type, incident, claim amount, filing delay, and claims history. Get a structured triage brief with fraud risk score and adjuster recommendation.',
    cta: 'Try the agent',
    color: '#7c4dff',
    domain: 'DOMAIN_03',
    icon: '◎',
  },
];

// ── Section divider (replaces numbered eyebrow pattern) ────
function SectionDivider({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}
    >
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--txt-dim)', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <motion.div
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', transformOrigin: 'left' }}
      />
    </motion.div>
  );
}

// ── Travel-Tech card with animated "2 live projects" dropdown ──
function TravelTechBentoCard({ d, gridStyle, minH, delay }: {
  d: typeof domains[number]; gridStyle: React.CSSProperties; minH: number; delay: number;
}) {
  const [open, setOpen] = useState(false);
  const color = d.color;
  const projects = [
    { name: 'AirWave', sub: 'Fare Scenario Intelligence', href: '/traveltech', external: false, c: '#00acc1' },
    { name: 'SQUALL.IROPS', sub: 'Live Disruption Nowcast', href: 'https://irops.s-ashwath.com', external: true, c: '#ff7043' },
  ];
  return (
    <motion.div style={{ ...gridStyle, position: 'relative', zIndex: open ? 30 : 1 }}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}>
      <motion.div whileHover={{ y: -4, boxShadow: `0 24px 60px ${color}18` }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 16, padding: 3 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: minH, padding: '28px 28px 24px', background: 'var(--card-bg)', borderRadius: 13, overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 55% at 0% 0%, ${color}0d, transparent)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 32px 32px 0', borderColor: `transparent ${color}40 transparent transparent` }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, display: 'inline-block' }} />
                {d.tag}
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', letterSpacing: '0.1em' }}>{d.num}</span>
            </div>
            <h3 style={{ fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>{d.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--txt-dim)', lineHeight: 1.65, maxWidth: '36ch' }}>{d.desc}</p>
          </div>

          {/* Animated dropdown toggle */}
          <motion.button onClick={() => setOpen(o => !o)}
            animate={open ? {} : { boxShadow: [`0 0 0 0 ${color}00`, `0 0 0 4px ${color}1a`, `0 0 0 0 ${color}00`] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: 18, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 10, background: open ? color : `${color}1a`, border: `1px solid ${color}`, borderRadius: 9999, padding: '9px 18px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: open ? '#07090c' : color, transition: 'background 0.2s, color 0.2s' }}>
            <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ display: 'inline-block', fontSize: 13 }}>⧉</motion.span>
            2 LIVE PROJECTS
            <motion.span
              animate={open ? { rotate: 180 } : { rotate: 0, y: [0, 3, 0] }}
              transition={open ? { duration: 0.3 } : { y: { duration: 1.2, repeat: Infinity }, rotate: { duration: 0.3 } }}
              style={{ display: 'inline-block', fontSize: 13 }}>▾</motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* Popover with the two projects */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 8, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 40, background: 'var(--card-bg)', border: `1px solid ${color}30`, borderRadius: 12, padding: 6, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            {projects.map((p, i) => (
              <motion.a key={p.name} href={p.href}
                target={p.external ? '_blank' : undefined} rel={p.external ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.06 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 9, textDecoration: 'none', color: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.background = `${p.c}12`)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: p.c, boxShadow: `0 0 8px ${p.c}`, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--txt)' }}>{p.name}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--txt-faint)' }}>{p.sub}</span>
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: p.c, fontWeight: 600 }}>{p.external ? 'Launch ↗' : 'Open →'}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function Home() {
  const isMobile = useIsMobile();
  const headline = useScrambleText('I build and prove AI systems.', 300, 1000);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100dvh - var(--nav-h))',
        display: 'flex', alignItems: 'center',
        padding: `clamp(60px,8vw,120px) clamp(16px,4vw,48px)`,
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
          gap: isMobile ? 40 : 60,
          alignItems: 'center',
          width: '100%',
        }}>

          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--acc)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <motion.span
                animate={{ scaleX: [0, 1] }} transition={{ duration: 0.5 }}
                style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--acc)', transformOrigin: 'left' }}
              />
              MULTI-DOMAIN · AI SYSTEMS BUILDER
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{
                fontWeight: 700,
                fontSize: 'clamp(38px, 6vw, 88px)',
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
                marginBottom: 32,
                fontFamily: 'var(--mono)',
                textWrap: 'balance',
              }}
            >
              {headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', color: 'var(--txt-dim)', maxWidth: '52ch', lineHeight: 1.65, marginBottom: 48 }}
            >
              18 years leading enterprise technology programmes. Rather than directing the work, I build and validate it{' '}
              <strong style={{ color: 'var(--txt)', fontWeight: 600 }}>with my own hands.</strong>
              {' '}Five domains. Nine AI systems. All built solo.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}
            >
              {[
                { value: 5,  suffix: '',   label: 'Domains' },
                { value: 9,  suffix: '',   label: 'AI Systems' },
                { value: 18, suffix: 'yr', label: 'Enterprise' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  padding: '16px 32px',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  borderRight: i === 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, lineHeight: 1, color: 'var(--txt)' }}>
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--txt-faint)', marginTop: 6 }}>
                    {s.label.toUpperCase()}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs — pill shape + Button-in-Button trailing icon */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap', alignItems: 'center' }}
            >
              {/* Primary */}
              <motion.a href="/scenarios"
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="cta-primary-btn"
                style={{
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.1em', color: '#07090c',
                  background: 'var(--mac)',
                  padding: '10px 10px 10px 22px',
                  borderRadius: 9999,
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  textDecoration: 'none',
                }}
              >
                ◈ Run a simulation
                <span className="cta-trailing-icon" style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.15)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>→</span>
              </motion.a>

              {/* Secondary */}
              <motion.a href="/ecommerce"
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="cta-secondary-btn"
                style={{
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.1em', color: 'var(--txt-dim)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 10px 10px 22px',
                  borderRadius: 9999,
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  textDecoration: 'none',
                  transition: 'color 0.25s, border-color 0.25s',
                }}
              >
                View completed build
                <span className="cta-trailing-icon" style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>→</span>
              </motion.a>
            </motion.div>
          </div>

          {/* Right — system status panel */}
          {!isMobile && <SystemStatusPanel />}
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────── */}
      <Marquee />

      {/* ── DOMAINS (BENTO) ───────────────────────────────── */}
      <section style={{ padding: `clamp(48px,6vw,80px) clamp(16px,4vw,48px)`, maxWidth: 1200, margin: '0 auto' }}>
        <SectionDivider label="Domain Portfolio" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gridTemplateRows: isMobile ? 'auto' : 'auto auto auto',
          gap: 12,
        }}>
          {domains.map((d, i) => {
            const gridStyle = isMobile ? {} : { gridColumn: d.grid.col, gridRow: d.grid.row };
            const isWide = !isMobile && d.grid.col === '1 / 4'; // full-width card (Insurance)
            const minH = d.num === 'DOMAIN_01' ? (isMobile ? 220 : 260) : d.num === 'DOMAIN_05' ? (isMobile ? 220 : 300) : d.num === 'DOMAIN_04' ? (isMobile ? 215 : 235) : 200;
            const ctaLabel = d.num === 'DOMAIN_05' ? 'Run simulation →' : d.num === 'DOMAIN_01' ? 'View full build →' : 'Try agent →';
            const descMaxW = isWide ? '60ch' : '36ch';

            // Travel-Tech gets the animated 2-projects dropdown
            if (d.num === 'DOMAIN_04') {
              return <TravelTechBentoCard key={d.href} d={d} gridStyle={gridStyle as React.CSSProperties} minH={minH} delay={i * 0.07} />;
            }

            return (
              <motion.div key={d.href} style={gridStyle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Live domain card — Double-Bezel: outer shell + inner core */}
                <motion.a href={d.href}
                  whileHover={{ y: -4, boxShadow: `0 24px 60px ${d.color}18` }}
                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    height: '100%',
                    background: `${d.color}08`,
                    border: `1px solid ${d.color}25`,
                    borderRadius: 16,
                    padding: 3,
                    cursor: 'pointer', textDecoration: 'none', color: 'inherit',
                  }}
                >
                  {/* Inner core */}
                  <div style={{
                    flex: 1,
                    display: 'flex', flexDirection: isWide && !isMobile ? 'row' : 'column',
                    justifyContent: 'space-between',
                    alignItems: isWide && !isMobile ? 'center' : undefined,
                    minHeight: minH,
                    padding: '28px 28px 24px',
                    background: 'var(--card-bg)',
                    borderRadius: 13,
                    overflow: 'hidden', position: 'relative',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                    gap: isWide && !isMobile ? 40 : 0,
                  }}>
                    {/* Gradient wash */}
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 55% at 0% 0%, ${d.color}0d, transparent)`, pointerEvents: 'none' }} />
                    {/* Corner accent */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 32px 32px 0', borderColor: `transparent ${d.color}40 transparent transparent` }} />

                    {/* Tag + title + desc */}
                    <div style={{ position: 'relative', flex: isWide && !isMobile ? 1 : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: d.color }}>
                          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                            style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, boxShadow: `0 0 8px ${d.color}`, display: 'inline-block' }} />
                          {d.tag}
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', letterSpacing: '0.1em' }}>{d.num}</span>
                      </div>
                      <h3 style={{ fontSize: d.num === 'DOMAIN_01' ? 'clamp(24px,3vw,34px)' : 'clamp(20px,2.5vw,26px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>{d.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--txt-dim)', lineHeight: 1.65, maxWidth: descMaxW }}>{d.desc}</p>
                    </div>

                    {/* CTA — right-aligned normally, center-right for wide cards */}
                    <div style={{ position: 'relative', marginTop: isWide && !isMobile ? 0 : 20, display: 'flex', alignItems: isWide && !isMobile ? 'center' : 'flex-end', justifyContent: 'flex-end', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: d.color, fontWeight: 600 }}>
                        {ctaLabel}
                      </span>
                    </div>
                  </div>
                </motion.a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── AGENTS ────────────────────────────────────────── */}
      <section style={{ padding: `0 clamp(16px,4vw,48px) clamp(60px,8vw,100px)`, maxWidth: 1200, margin: '0 auto' }}>
        <SectionDivider label="Agentic AIs — Try Live" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}>
          {agentCards.map((a, i) => (
            <motion.div key={a.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              {/* Double-Bezel agent card */}
              <motion.a href={a.href}
                target={a.href.startsWith('http') ? '_blank' : undefined}
                rel={a.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                whileHover={{ y: -5, boxShadow: `0 20px 50px ${a.color}18` }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  height: '100%',
                  // Outer shell
                  background: `${a.color}07`,
                  border: `1px solid ${a.color}28`,
                  borderRadius: 14,
                  padding: 2,
                  textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                }}
              >
                {/* Inner core */}
                <div style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  minHeight: 230,
                  padding: '24px',
                  background: `${a.color}05`,
                  borderRadius: 12,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${a.color}, transparent)`, opacity: 0.55 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--txt-faint)' }}>{a.slot}</span>
                      <span style={{ fontSize: 18, color: a.color, opacity: 0.65 }}>{a.icon}</span>
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>{a.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--txt-dim)', lineHeight: 1.65 }}>{a.desc}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--live)' }}>
                      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--live)', boxShadow: '0 0 6px var(--live)', display: 'inline-block' }} />
                      LIVE · {a.domain}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: a.color, fontWeight: 600 }}>{a.cta} →</span>
                  </div>
                </div>
              </motion.a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DOCS CALLOUT ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 clamp(16px,4vw,48px) 52px',
        }}
      >
        <Link href="/docs" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
          padding: '18px 28px',
          background: 'rgba(255,59,48,0.03)',
          border: '1px solid rgba(255,59,48,0.14)',
          borderRadius: 8,
          textDecoration: 'none',
          transition: 'border-color 0.2s, background 0.2s',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--acc)', marginBottom: 5 }}>
              TECHNICAL DOCUMENTATION
            </div>
            <div style={{ fontSize: 14, color: 'var(--txt-dim)', maxWidth: '58ch' }}>
              Stack decisions, agent architectures, pipeline docs, and the problem statement behind each domain — all in one place.
            </div>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--acc)', flexShrink: 0 }}>
            VIEW DOCS →
          </span>
        </Link>
      </motion.div>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: `28px clamp(16px,4vw,48px)`,
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 14 }}>
          S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH
        </span>
        <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em' }}>
          <a href="mailto:rambotechnologies@gmail.com"
            style={{ color: 'var(--txt-dim)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--txt)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--txt-dim)')}>
            EMAIL
          </a>
          <a href="https://linkedin.com/in/s-ashwathv"
            style={{ color: 'var(--txt-dim)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--txt)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--txt-dim)')}>
            LINKEDIN
          </a>
          <a href="https://github.com/Ashwath-VS"
            target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--txt-dim)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--txt)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--txt-dim)')}>
            GITHUB
          </a>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', width: '100%', letterSpacing: '0.06em' }}>
          AI systems proven across five domains · built solo · s-ashwath.com
        </span>
      </footer>
    </div>
  );
}
