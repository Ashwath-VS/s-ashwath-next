'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }),
};

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let start = 0;
      const step = () => {
        start += Math.ceil(target / 40);
        if (start >= target) { setVal(target); return; }
        setVal(start);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const domains = [
  { href: '/ecommerce',  title: 'E-Commerce',  tag: '✓ Complete', color: '#00e676', desc: 'Seven AI systems. One B2B marketplace. Built solo, end to end.', num: 'DOMAIN_01', live: true },
  { href: '/fintech',    title: 'Fin-Tech',    tag: '◐ Agent Live', color: '#2979ff', desc: 'MSME credit intelligence with GST, bank, and ITR triangulation.', num: 'DOMAIN_02', live: true },
  { href: '#',           title: 'Insurance',   tag: '◐ Coming next', color: '#7c4dff', desc: 'AI for claims, underwriting and risk — regulated, high-stakes ops.', num: 'DOMAIN_03', live: false },
  { href: '/traveltech', title: 'Travel-Tech', tag: '◐ Agent Live', color: '#00acc1', desc: 'Fare monitor + IRROP rebooking. 18 years of airline domain depth.', num: 'DOMAIN_04', live: true },
];

export default function Home() {
  return (
    <div style={{ paddingTop: 52 }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ padding: '130px 48px 90px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--acc)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-block', width: 28, height: 1, background: 'var(--acc)' }} />
          MULTI-DOMAIN · AI SYSTEMS BUILDER
        </motion.div>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontWeight: 700, fontSize: 'clamp(44px, 7vw, 92px)', lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: 36, maxWidth: '14ch' }}>
          I build{' '}
          <span style={{ color: 'var(--acc)', textShadow: '0 0 40px rgba(255,59,48,0.4)' }}>and prove</span>
          {' '}AI systems.
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: 'var(--txt-dim)', maxWidth: '56ch', lineHeight: 1.6, marginBottom: 56 }}>
          18 years leading enterprise technology programmes — and rather than directing the work, I build and validate it{' '}
          <strong style={{ color: 'var(--txt)', fontWeight: 600 }}>with my own hands.</strong>
          {' '}One completed experiment. Four more in the lab.
        </motion.p>

        {/* Stats */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {[
            { value: 5,  suffix: '',    label: 'Domains' },
            { value: 7,  suffix: '',    label: 'AI Systems Built' },
            { value: 18, suffix: 'yr',  label: 'Enterprise Delivery' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '20px 40px', borderLeft: i === 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)', borderRight: i === 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, lineHeight: 1, color: 'var(--txt)' }}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--txt-faint)', marginTop: 8 }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── DOMAINS ──────────────────────────────────── */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--acc)', letterSpacing: '0.12em' }}>01</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>Domain Portfolio</span>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 }}
            style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', transformOrigin: 'left' }}
          />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {domains.map((d, i) => (
            <motion.div key={d.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
              <motion.a href={d.href}
                whileHover={d.live ? { y: -5, boxShadow: `0 20px 60px ${d.color}22` } : {}}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'block', position: 'relative',
                  padding: '36px 32px 80px',
                  background: 'var(--card-bg)',
                  border: `1px solid ${d.live ? d.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 8, overflow: 'hidden',
                  cursor: d.live ? 'pointer' : 'default',
                  textDecoration: 'none', color: 'inherit',
                  minHeight: 240,
                }}>
                {/* Gradient wash on hover handled by box-shadow above */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.06,
                  background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${d.color}, transparent)`,
                  pointerEvents: 'none',
                }} />

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
                  color: d.live ? d.color : 'rgba(255,255,255,0.3)',
                  marginBottom: 22,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.live ? d.color : 'rgba(255,255,255,0.2)', display: 'inline-block', boxShadow: d.live ? `0 0 8px ${d.color}` : 'none' }} />
                  {d.tag}
                </div>

                <h3 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>{d.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.65, maxWidth: '32ch' }}>{d.desc}</p>

                <div style={{ position: 'absolute', bottom: 28, left: 32, right: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', letterSpacing: '0.1em' }}>{d.num}</span>
                  {d.live && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: d.color }}>Enter build →</span>}
                </div>

                {/* Corner accent */}
                {d.live && (
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 28px 28px 0', borderColor: `transparent ${d.color}55 transparent transparent` }} />
                )}
              </motion.a>
            </motion.div>
          ))}

          {/* Macro Engine — full width featured */}
          <motion.div style={{ gridColumn: '1 / -1' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
            <motion.a href="/scenarios"
              whileHover={{ y: -4, boxShadow: '0 24px 80px rgba(255,145,0,0.18)' }}
              transition={{ duration: 0.25 }}
              style={{
                display: 'block', position: 'relative',
                padding: '36px 40px',
                background: 'linear-gradient(120deg, rgba(255,145,0,0.07) 0%, var(--card-bg) 50%)',
                border: '1px solid rgba(255,145,0,0.35)',
                borderRadius: 8, overflow: 'hidden',
                cursor: 'pointer', textDecoration: 'none', color: 'inherit',
              }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse 80% 100% at 100% 50%, rgba(255,145,0,0.06), transparent)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, position: 'relative' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mac)', letterSpacing: '0.14em', marginBottom: 16 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mac)', display: 'inline-block', boxShadow: '0 0 8px var(--mac)' }} />
                    ◈ SIMULATION LIVE · NEW · DOMAIN_05
                  </div>
                  <h3 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>
                    Macro Cascade Intelligence Engine
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--txt-dim)', maxWidth: '68ch', lineHeight: 1.65 }}>
                    Pick a macro shock — war, oil spike, rate hike, pandemic. The model propagates it through 13 interconnected sectors using live market data, then generates a plain-English strategic brief tailored to your role. Powered by Llama 3.3 via Groq.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    {['13 SECTORS', '31 EDGES', 'LIVE VIX DATA', 'AI BRIEF', '12 PERSONAS'].map(tag => (
                      <span key={tag} style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(255,145,0,0.6)', border: '1px solid rgba(255,145,0,0.2)', padding: '2px 8px', borderRadius: 2 }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'flex-end', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--mac)', fontWeight: 700 }}>Run a scenario →</span>
                </div>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── AGENTS ───────────────────────────────────── */}
      <section style={{ padding: '0 48px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--acc)', letterSpacing: '0.12em' }}>02</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>Agentic AIs · Try Live</span>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 }}
            style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', transformOrigin: 'left' }}
          />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { href: '/fintech',   slot: 'SLOT_01',  title: 'SME Credit Analyst',        desc: 'Enter GST turnover, bank credits, and ITR. Get a structured credit brief with risk flags and a recommended limit.', cta: 'Try the agent', color: '#2979ff', domain: 'DOMAIN_02', icon: '◎' },
            { href: '/traveltech',slot: 'SLOT_02',  title: 'Fare Optimization Agent',   desc: 'Enter your route, cabin, booked fare, and days out. Get a rebooking signal with net savings after change fees.', cta: 'Try the agent', color: '#00acc1', domain: 'DOMAIN_04', icon: '◎' },
            { href: '/scenarios', slot: 'SLOT_03',  title: 'Macro Cascade Simulator',   desc: 'Pick a macro shock, get a full sector cascade and an AI-generated plain-English brief tailored to your role.', cta: 'Run the simulation', color: '#ff9100', domain: 'DOMAIN_05', icon: '◈' },
          ].map((a, i) => (
            <motion.div key={a.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
              <motion.a href={a.href}
                whileHover={{ y: -5, boxShadow: `0 18px 50px ${a.color}22` }}
                transition={{ duration: 0.22 }}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  border: `1px solid ${a.color}35`,
                  borderRadius: 8, padding: '28px 24px',
                  background: `${a.color}08`,
                  minHeight: 240, height: '100%',
                  textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${a.color}, transparent)`, opacity: 0.6 }} />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--txt-faint)' }}>// {a.slot}</span>
                    <span style={{ fontSize: 18, color: a.color, opacity: 0.7 }}>{a.icon}</span>
                  </div>
                  <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>{a.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--txt-dim)', lineHeight: 1.65 }}>{a.desc}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--live)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--live)', display: 'inline-block', boxShadow: '0 0 6px var(--live)' }} />
                    LIVE · {a.domain}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: a.color, fontWeight: 600 }}>{a.cta} →</span>
                </div>
              </motion.a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 48px', maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 14 }}>
          S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH
        </span>
        <div style={{ display: 'flex', gap: 28, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em' }}>
          <a href="mailto:rambotechnologies@gmail.com" style={{ color: 'var(--txt-dim)', transition: 'color 0.2s' }}>EMAIL</a>
          <a href="https://linkedin.com/in/s-ashwathv" style={{ color: 'var(--txt-dim)', transition: 'color 0.2s' }}>LINKEDIN</a>
          <span style={{ color: 'var(--txt-faint)' }}>GITHUB · SOON</span>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', width: '100%', letterSpacing: '0.06em' }}>
          // AI systems proven across five domains · built solo · s-ashwath.com
        </span>
      </footer>
    </div>
  );
}
