'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/useIsMobile'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const viewport = { once: true, margin: '0px 0px -40px 0px' }

const timeline = [
  {
    when: '2025 — Now',
    role: 'Sr. Project / Engineering Manager',
    org: 'A GLOBAL DIGITAL-ENGINEERING FIRM',
    desc: 'Run multiple concurrent enterprise programs with 40+ distributed engineers across delivery models. Drove a GenAI upskilling program to 80%+ completion and established an AI proof-of-concept POD for emerging use cases.',
  },
  {
    when: '2023 — 2025',
    role: 'Sr. Project / Engineering Manager',
    org: 'ENTERPRISE CREW-MANAGEMENT PLATFORM',
    desc: 'Led multiple scrum teams across development and maintenance for an aviation crew-control product. Delivered 15+ production releases in 19 months; owned roadmaps, release planning, and 24×7 production support.',
  },
  {
    when: '2021 — 2023',
    role: 'Principal Technical Product Manager',
    org: 'AIRLINE RETAILING / GDS PLATFORM',
    desc: 'Led offer & order management transformation and API platform delivery for airline retailing — offers, orders, seats & ancillaries. Partnered with architects on target-state design and functional baselining.',
  },
  {
    when: '2015 — 2019',
    role: 'Business Solution Specialist / Lead BA',
    org: 'GLOBAL AIRLINE-TECH MAJOR',
    desc: 'Lead BA across airline e-commerce, reservations, departure control and API platforms — functional baselining, roadmap alignment, and cross-functional delivery across global teams.',
  },
  {
    when: '2005 — 2015',
    role: 'Engineering & Delivery Roles',
    org: 'GLOBAL IT SERVICES & FINANCE PLATFORMS',
    desc: 'Software engineering and delivery across travel, finance, and global payments platforms — including a large multi-vendor transition program covering 37 enterprise applications. Foundations in .NET, SQL, GDS systems, and ITIL service delivery.',
  },
]

const ventures = [
  {
    tag: '◆ AI & Automation',
    name: 'AI & Automation Startup',
    sub: 'Co-Founder · 2019–2021',
    desc: 'Co-founded and led an AI & automation startup — building AI-driven solutions, securing partnerships, and developing product and go-to-market strategy.',
    stat: null,
    link: null,
  },
  {
    tag: '◆ Electric Mobility',
    name: 'Electric Mobility Venture',
    sub: 'Founder',
    desc: "An app-based electric two-wheeler last-mile mobility concept — tackling cost, congestion, and emissions in India's multi-billion-dollar last-mile market with a green, meter-based ride model.",
    stat: null,
    link: null,
  },
  {
    tag: '◆ Food & Beverage',
    name: 'Cloud-Kitchen F&B Group',
    sub: 'Founder',
    desc: 'A cloud-kitchen group running multiple South Indian F&B brands — authentic veg, fusion QSR, and premium non-veg — operating as a real, traction-proven business.',
    stat: '8,000+ monthly orders · 52% repeat · 4.4★ / 50K+ users',
    link: null,
  },
  {
    tag: '◆ AI Systems · R&D',
    name: 'AI Marketplace Experiment',
    sub: 'Personal R&D Project',
    desc: 'A hands-on AI experiment: I built a working B2B marketplace system end to end — seven AI/automation systems — to test how far one person can go with the right AI leverage. The flagship technical showcase.',
    stat: '→ See the full build',
    link: '/ecommerce',
  },
]

const chips = [
  'AI Systems & Agents',
  'Multi-LLM Orchestration',
  'Enterprise Program Mgmt',
  'Product Management',
  'Travel-Tech / GDS',
  'E-Commerce',
  'Fin-Tech / Payments',
  'API Platforms',
  'Agile Delivery',
  'Global Onsite-Offshore Teams',
  'Founder / 0→1',
]

export default function ExperiencePage() {
  const isMobile = useIsMobile();
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100dvh', paddingTop: 'var(--nav-h)' }}>
      {/* Header */}
      <header style={{ padding: '50px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '150px 1fr',
              gap: isMobile ? 24 : 40,
              alignItems: 'start',
            }}
          >
            {/* Avatar — initials */}
            <motion.div
              variants={fadeUp}
              style={{
                width: isMobile ? 80 : 150,
                height: isMobile ? 80 : 150,
                borderRadius: 14,
                border: '1px solid rgba(255,59,48,0.22)',
                background: 'rgba(255,59,48,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Radial wash */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 80% 80% at 50% 30%, rgba(255,59,48,0.12), transparent)',
              }} />
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: isMobile ? 26 : 44,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: 'var(--acc)',
                lineHeight: 1,
                position: 'relative',
              }}>
                SA
              </span>
            </motion.div>

            {/* Intro copy */}
            <motion.div variants={stagger}>
              <motion.div variants={fadeUp} style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--acc)',
                marginBottom: 20,
              }}>
                Operator-Builder
              </motion.div>

              <motion.h1 variants={fadeUp} style={{
                fontWeight: 700,
                fontSize: 'clamp(32px, 5vw, 58px)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                marginBottom: 22,
                maxWidth: '18ch',
              }}>
                I start things,{' '}
                <span style={{ color: 'var(--acc)' }}>ship them,</span>{' '}
                and run them — across domains.
              </motion.h1>

              <motion.p variants={fadeUp} style={{
                fontSize: 'clamp(16px, 1.9vw, 20px)',
                color: 'var(--txt-dim)',
                maxWidth: '60ch',
                lineHeight: 1.55,
              }}>
                Nearly two decades leading enterprise technology programs, alongside founding ventures across{' '}
                <strong style={{ color: 'var(--txt)', fontWeight: 600 }}>AI, electric mobility, and food & beverage</strong>
                {' '}— plus hands-on AI systems experiments. Different industries, one through-line: taking an idea from zero to working reality, with my own hands.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 38, marginTop: 34, flexWrap: 'wrap' }}>
                {[
                  { v: <>18<span style={{ color: 'var(--acc)' }}>+</span></>, l: 'Years Enterprise' },
                  { v: <><span style={{ color: 'var(--acc)' }}>3</span></>, l: 'Ventures Founded' },
                  { v: <>4</>, l: 'Industries' },
                ].map((m, i) => (
                  <div key={i}>
                    <span style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 24,
                      fontWeight: 700,
                      display: 'block',
                      lineHeight: 1,
                    }}>{m.v}</span>
                    <span style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--txt-faint)',
                      marginTop: 7,
                      display: 'block',
                    }}>{m.l}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Section 01: Career */}
      <section style={{ padding: '55px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <SectionHead idx="01" title="Enterprise Career" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger}
          >
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '130px 1fr',
                  gap: isMobile ? 8 : 30,
                  padding: '24px 0',
                  borderTop: '1px solid var(--border)',
                  ...(i === timeline.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
                }}
              >
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--txt-faint)',
                  letterSpacing: '0.04em',
                  paddingTop: 4,
                }}>
                  {item.when}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 19, marginBottom: 5 }}>{item.role}</div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--live)',
                    letterSpacing: '0.04em',
                    marginBottom: 10,
                  }}>{item.org}</div>
                  <div style={{ color: 'var(--txt-dim)', fontSize: 15.5 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 02: Ventures */}
      <section style={{ padding: '55px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <SectionHead idx="02" title="Ventures & Experiments" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16,
            }}
          >
            {ventures.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -3, borderColor: 'var(--acc)' }}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: 28,
                  background: 'var(--surface)',
                  transition: 'border-color 0.3s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--poc)',
                  marginBottom: 14,
                }}>{v.tag}</div>
                <h4 style={{ fontWeight: 700, fontSize: 21, marginBottom: 4, letterSpacing: '-0.01em' }}>{v.name}</h4>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11.5,
                  color: 'var(--txt-faint)',
                  marginBottom: 14,
                  letterSpacing: '0.03em',
                }}>{v.sub}</div>
                <p style={{ color: 'var(--txt-dim)', fontSize: 15 }}>{v.desc}</p>
                {v.stat && (
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: v.link ? undefined : 'var(--live)',
                    marginTop: 14,
                    letterSpacing: '0.02em',
                  }}>
                    {v.link
                      ? <Link href={v.link} style={{ color: 'var(--live)' }}>{v.stat}</Link>
                      : v.stat
                    }
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 03: Capabilities */}
      <section style={{ padding: '55px 0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <SectionHead idx="03" title="Capabilities" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
          >
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--acc)',
              marginBottom: 18,
            }}>
              Domains & Skills
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={stagger}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}
            >
              {chips.map((chip, i) => (
                <motion.span
                  key={i}
                  variants={fadeUp}
                  whileHover={{ borderColor: 'var(--acc)', color: 'var(--txt)' }}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    padding: '8px 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    color: 'var(--txt-dim)',
                    transition: 'all 0.2s',
                    display: 'inline-block',
                  }}
                >
                  {chip}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Endcap */}
      <section style={{ padding: '30px 0 80px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: 42,
              background: 'var(--surface)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontWeight: 600, fontSize: 24, marginBottom: 12, letterSpacing: '-0.01em' }}>
              Different industries. Same operator.
            </h3>
            <p style={{ color: 'var(--txt-dim)', maxWidth: '50ch', margin: '0 auto 24px' }}>
              The through-line isn't the domain — it's being the person who takes an idea from zero to running reality. If that's useful to you, I'm happy to compare notes.
            </p>
            <motion.a
              href="/"
              whileHover={{ background: '#fff', color: 'var(--bg)', y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12.5,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '15px 30px',
                background: 'var(--acc)',
                color: '#fff',
                borderRadius: 3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              ← Back to domains
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '38px 0', marginTop: 20 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 14 }}>
              S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH
            </div>
            <div style={{ display: 'flex', gap: 22, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-dim)' }}>
              <a href="mailto:rambotechnologies@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>EMAIL</a>
              <a href="https://www.linkedin.com/in/s-ashwathv" style={{ color: 'inherit', textDecoration: 'none' }}>LINKEDIN</a>
              <span style={{ color: 'var(--txt-faint)' }}>GITHUB · SOON</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp}
      style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 34 }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--acc)', letterSpacing: '0.1em' }}>{idx}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>{title}</span>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewport}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative', top: -3, transformOrigin: 'left' }}
      />
    </motion.div>
  )
}
