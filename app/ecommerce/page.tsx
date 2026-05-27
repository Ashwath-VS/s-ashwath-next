'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const viewport = { once: true, margin: '0px 0px -40px 0px' }

const roleGroups = [
  { grp: 'Storefront', roles: ['Frontend & PWA Developer', 'UX / Catalog Design'] },
  { grp: 'Catalog', roles: ['Data Engineer', 'Catalog & Merchandising', 'QA & Data Quality'] },
  { grp: 'Infrastructure', roles: ['Server / DevOps', 'Database Administrator', 'CDN, Security & Performance'] },
  { grp: 'Intelligence', roles: ['AI Agent Builder', 'Prompt Engineer', 'AI Application Developer', 'Image-Generation Engineer'] },
  { grp: 'Commerce', roles: ['Payments Integration', 'Logistics & Fulfilment', 'Messaging & Notifications'] },
  { grp: 'Growth', roles: ['SEO Strategist', 'Programmatic-Content Engineer', 'Brand & Marketing'] },
  { grp: 'Business', roles: ['Founder', 'Vendor Operations', 'Product Manager', 'Technical Writer'] },
]

const systems = [
  {
    num: 'SYS_01',
    name: 'The Autonomous Content Engine',
    desc: 'An agent that processes the catalog in batches, generates regional-language search content with an LLM, and applies it through a staging → apply → rollback workflow with backups and per-batch locks. Runs on a nightly schedule, unattended.',
    highlight: '~9,300 products optimized to 99% coverage.',
    stack: 'Python · Gemini Flash · MySQL · cron · staging+rollback',
  },
  {
    num: 'SYS_02',
    name: 'The Conversational Assistant',
    desc: "A storefront AI assistant answering buyer questions in plain language. The interesting part was the platform fighting me — the commerce engine strips JavaScript from page content, so I routed it through a server-level injection layer and standalone endpoints to make it work at all.",
    highlight: 'The constraint taught me more than the feature did.',
    stack: 'JavaScript · Claude · server-side injection · PHP endpoints',
  },
  {
    num: 'SYS_03',
    name: 'The Buyer Intelligence Tool',
    desc: "A location-aware recommendation engine: a buyer enters their area, an LLM-backed system surfaces the parts most relevant to that regional market. Turns a sprawling catalog from overwhelming into personal.",
    highlight: null,
    stack: 'Claude · location lookup · rule layer',
  },
  {
    num: 'SYS_04',
    name: 'The Vendor Intelligence Dashboard',
    desc: "The one I'm proudest of visually — a demand-intelligence dashboard styled like a financial terminal, live heatmaps and hot/dead-stock lists across 15 regional markets. Two layers: instant rule-based data on every interaction, and a frontier LLM generating a personalized demand report on request.",
    highlight: 'Built to turn browsers into registered vendors.',
    stack: 'JavaScript · Claude (inference) · rule engine · real-time UI',
  },
  {
    num: 'SYS_05',
    name: 'The Product Imagery Studio',
    desc: "A bulk image-generation studio for a problem every marketplace has: vendors supply inconsistent, low-quality photos, and hand-editing thousands of SKUs alone is impossible. Pick a product, it generates a full set of standardized marketing shots in one batch and attaches them automatically. Best part: it runs the same prompt through two competing image models side by side, with live cost tracking — pick the better, cheaper result per job.",
    highlight: 'Over a thousand SKUs styled this way.',
    stack: 'Python · Gemini Flash Image + GPT Image (A/B) · batch pipeline · cost tracking',
  },
  {
    num: 'SYS_06',
    name: 'The Commerce Integration Layer',
    desc: 'The plumbing that makes a marketplace real, not a demo: payments, shipping and logistics, transactional email, automated order and payment messaging, and government-API-backed vendor verification for onboarding.',
    highlight: 'Half a dozen third-party systems, wired to behave as one.',
    stack: 'Payments · logistics · SMTP · messaging API · gov-verification APIs',
  },
  {
    num: 'SYS_07',
    name: 'The Infrastructure & The Discipline',
    desc: 'Linux administration, a CDN/security/performance layer, automated nightly backups — and the part that matters: a written set of operational safety rules. Diagnose with data before acting. Back up affected rows before any destructive change. Make every batch operation safely re-runnable.',
    highlight: 'Anyone can build a system that works once; making one that fails safely is the engineering.',
    stack: 'Linux · CDN/WAF · automated backups · ops runbook',
  },
]

const archLayers = [
  { ln: 'L1', layer: 'Frontend', title: 'PWA storefront + AI widgets', sub: 'JavaScript · Progressive Web App · responsive UI · embedded assistant & dashboards' },
  { ln: 'L2', layer: 'Application', title: 'Multi-vendor e-commerce platform', sub: 'PHP core · custom API endpoints · server-side injection layer' },
  { ln: 'L3', layer: 'Intelligence', title: 'Multi-LLM orchestration', sub: 'Claude · Gemini Flash · GPT Image · agent loops · prompt layer · evals · model A/B routing' },
  { ln: 'L4', layer: 'Data', title: 'Catalog & storage', sub: 'MySQL · large multi-vendor catalog · nightly automated backups' },
  { ln: 'L5', layer: 'Infrastructure', title: 'Server & edge', sub: 'Linux server · CDN / WAF · cron automation · monitoring' },
  { ln: 'L6', layer: 'Integrations', title: 'Third-party commerce systems', sub: 'Payments · logistics · transactional email · messaging API · government verification APIs' },
]

const stats = [
  { figure: '9,300', label: 'Products auto-optimized' },
  { figure: '200+', label: 'Self-generating pages' },
  { figure: '7', label: 'AI / automation systems', accent: true },
  { figure: '1', label: 'Person · end to end' },
]

export default function EcommercePage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 96 }}>
      {/* Header */}
      <header style={{ padding: '50px 0 70px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} style={{
              fontFamily: 'var(--mono)',
              fontSize: 11.5,
              letterSpacing: '0.1em',
              color: 'var(--txt-faint)',
              marginBottom: 30,
            }}>
              // <span style={{ color: 'var(--acc)' }}>DOMAIN_01</span> / E-COMMERCE / AI SYSTEMS EXPERIMENT
            </motion.div>

            <motion.h1 variants={fadeUp} style={{
              fontWeight: 700,
              fontSize: 'clamp(36px, 6vw, 76px)',
              lineHeight: 0.99,
              letterSpacing: '-0.03em',
              marginBottom: 30,
              maxWidth: '15ch',
            }}>
              What does it take to build an{' '}
              <span style={{ color: 'var(--acc)', textShadow: '0 0 26px rgba(255,59,48,0.5)' }}>Amazon?</span>
            </motion.h1>

            <motion.p variants={fadeUp} style={{
              fontSize: 'clamp(17px, 2vw, 21px)',
              color: 'var(--txt-dim)',
              maxWidth: '62ch',
              lineHeight: 1.55,
            }}>
              I've spent nearly two decades leading enterprise technology programs — so I know how many specialists a marketplace is <em>supposed</em> to require. I wanted to test that. So as an AI experiment, I built a working B2B marketplace system end to end:{' '}
              <strong style={{ color: 'var(--txt)', fontWeight: 600 }}>buyer and vendor AI, payments, logistics, and a self-running content engine</strong>
              {' '}— all functioning. It took <strong style={{ color: 'var(--txt)', fontWeight: 600 }}>17+ distinct roles</strong>, every one my own.
            </motion.p>
          </motion.div>
        </div>
      </header>

      {/* 01: The Question */}
      <Section>
        <SectionHead idx="01" title="The Question" />
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          style={{
            fontWeight: 500,
            fontSize: 'clamp(20px, 2.6vw, 27px)',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
            maxWidth: '34ch',
          }}
        >
          Everyone treats building a marketplace as a job for a{' '}
          <span style={{ color: 'var(--acc)' }}>company</span>
          {' '}— engineers, ops, designers, marketers, each in their lane. Is that still true in the age of AI, or just how it's always been done? The only honest way to find out was to build the whole thing myself and count the hats. The answer turned out to be{' '}
          <span style={{ color: 'var(--acc)' }}>seventeen</span>.
        </motion.p>
      </Section>

      {/* 02: What It Took */}
      <Section>
        <SectionHead idx="02" title="What It Took" />
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          style={{ color: 'var(--txt-dim)', maxWidth: '60ch', marginBottom: 40 }}
        >
          Every role a marketplace normally hires a person for — here's the same list, done solo. None from courses; each learned because the build wouldn't ship without it.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          {roleGroups.map((g, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                display: 'grid',
                gridTemplateColumns: '0.5fr 1.5fr',
                gap: 36,
                padding: '26px 0',
                borderTop: '1px solid var(--border)',
                alignItems: 'baseline',
                ...(i === roleGroups.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--live)',
              }}>{g.grp}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {g.roles.map((r, j) => (
                  <motion.span
                    key={j}
                    whileHover={{ borderColor: 'var(--acc)', color: 'var(--txt)', y: -1 }}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      letterSpacing: '0.02em',
                      padding: '8px 14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 3,
                      color: 'var(--txt-dim)',
                      transition: 'all 0.2s',
                    }}
                  >{r}</motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: 'var(--txt-faint)',
            marginTop: 30,
            letterSpacing: '0.04em',
          }}
        >
          // 17+ hats · 1 operator · 1 question, answered
        </motion.p>
      </Section>

      {/* 03: The Systems */}
      <Section>
        <SectionHead idx="03" title="The Systems" />
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          style={{ color: 'var(--txt-dim)', maxWidth: '58ch', marginBottom: 16 }}
        >
          The list is easy to write. Here's the proof — seven systems behind it, each built and validated.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          {systems.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 28,
                padding: '34px 0',
                borderTop: '1px solid var(--border)',
                alignItems: 'start',
                ...(i === systems.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--acc)',
                paddingTop: 6,
                minWidth: 44,
                letterSpacing: '0.05em',
              }}>{s.num}</div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: 23, letterSpacing: '-0.01em', marginBottom: 13 }}>{s.name}</h4>
                <p style={{ color: 'var(--txt-dim)', fontSize: 16, marginBottom: 14 }}>
                  {s.desc}
                  {s.highlight && <>{' '}<strong style={{ color: 'var(--txt)', fontWeight: 600 }}>{s.highlight}</strong></>}
                </p>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11.5,
                  letterSpacing: '0.03em',
                  color: 'var(--txt-faint)',
                }}>
                  <span style={{ color: 'var(--live)' }}>STACK:</span> {s.stack}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'var(--border)',
            border: '1px solid var(--border)',
            marginTop: 60,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                background: 'var(--surface)',
                padding: '26px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)',
                fontWeight: 700,
                fontSize: 'clamp(24px, 3.2vw, 36px)',
                lineHeight: 1,
                marginBottom: 10,
                color: s.accent ? 'var(--acc)' : undefined,
              }}>{s.figure}</div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--txt-faint)',
                lineHeight: 1.4,
              }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* 04: Architecture */}
      <Section>
        <SectionHead idx="04" title="Architecture" />
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          style={{ color: 'var(--txt-dim)', maxWidth: '58ch', marginBottom: 16 }}
        >
          High-level system architecture — frontend to infrastructure, end to end.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 5,
            overflow: 'hidden',
            background: 'var(--surface)',
          }}
        >
          {archLayers.map((l, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ background: 'rgba(255,59,48,0.04)' }}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                borderBottom: i < archLayers.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.25s',
              }}
            >
              <div style={{
                padding: '22px 24px',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--acc)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ color: 'var(--txt-faint)' }}>{l.ln}</span> {l.layer}
              </div>
              <div style={{ padding: '22px 26px' }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{l.title}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-dim)', letterSpacing: '0.02em' }}>{l.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* 05: What Broke */}
      <Section>
        <SectionHead idx="05" title="What Broke" />
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          style={{
            fontWeight: 500,
            fontSize: 'clamp(19px, 2.4vw, 25px)',
            lineHeight: 1.5,
            maxWidth: '42ch',
          }}
        >
          The lessons that stuck came from the incidents, not the launches. A run of pages vanished — the lazy move is a blind rollback, but diagnosing first proved the cause predated my work and let me recover cleanly instead of compounding it. A disk-capacity failure silently corrupted tens of thousands of records; fixing that taught me the failure modes that matter are never the ones the demo shows you. Those incidents are why the safety rules exist.{' '}
          <strong style={{ color: 'var(--acc)', fontWeight: 600 }}>The rules are the real product.</strong>
        </motion.p>
      </Section>

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
              padding: 44,
              background: 'var(--surface)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontWeight: 600, fontSize: 26, marginBottom: 14, letterSpacing: '-0.01em' }}>
              One experiment done. Three domains in the lab.
            </h3>
            <p style={{ color: 'var(--txt-dim)', maxWidth: '50ch', margin: '0 auto 26px' }}>
              This marketplace was an AI experiment — evidence that one person, with the right AI leverage, can do what used to take a team. Fin-tech, insurance, and travel-tech are next. If you're putting AI into real operations, I'm happy to compare notes.
            </p>
            <motion.a
              href="/"
              whileHover={{ background: '#fff', color: 'var(--bg)' }}
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
              ← Back to all domains
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

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ padding: '60px 0' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        {children}
      </div>
    </section>
  )
}

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp}
      style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}
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
