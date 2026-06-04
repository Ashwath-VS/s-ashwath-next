'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const INS = '#7c4dff';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

// ── Helpers ───────────────────────────────────────────────────

function inr(n: number): string {
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

function signalColor(val: string): string {
  if (['LOW', 'FAST_TRACK', 'LIKELY_COVERED'].includes(val)) return 'var(--live)';
  if (['MEDIUM', 'STANDARD', 'NEEDS_REVIEW'].includes(val)) return 'var(--poc)';
  return 'var(--acc)';
}

// ── Claims analysis engine ────────────────────────────────────

interface ClaimBrief {
  fraudRisk: string;
  coverage: string;
  triage: string;
  settlementRange: string;
  riskFlags: string[];
  narrative: string;
}

function analyseClaim(
  policyType: string,
  incidentType: string,
  amount: string,
  daysSince: string,
  priorClaims: string,
  policyAge: string,
): ClaimBrief {
  const amt = parseFloat(amount) || 0;
  const days = parseInt(daysSince) || 0;
  const prior = priorClaims === '3 or more' ? 3 : parseInt(priorClaims) || 0;

  // Coverage assessment
  const coveredPerils: Record<string, string[]> = {
    Motor:    ['Accident', 'Theft'],
    Property: ['Fire', 'Theft', 'Natural Disaster'],
    Health:   ['Medical Claim'],
    Life:     ['Medical Claim'],
    Travel:   ['Accident', 'Theft', 'Natural Disaster', 'Medical Claim'],
  };
  const isCoveredPeril = (coveredPerils[policyType] || []).includes(incidentType);
  let coverage = isCoveredPeril ? 'LIKELY_COVERED' : 'EXCLUDED';
  if (incidentType === 'Theft') coverage = 'NEEDS_REVIEW';

  // Fraud risk scoring
  let score = 0;
  const flags: string[] = [];

  // Prior claims
  if (prior === 1) {
    score += 1;
  } else if (prior === 2) {
    score += 2;
    flags.push(`2 prior claims in 3 years — repeat claimant profile warrants additional document verification before adjudication.`);
  } else if (prior >= 3) {
    score += 4;
    flags.push(`3 or more prior claims in 3 years — high-frequency claimant pattern. Refer to SIU for systemic review.`);
  }

  // Policy seasoning risk
  if (policyAge === '< 3 months') {
    score += 3;
    flags.push(`Policy is less than 3 months old — early-inception claims carry elevated seasoning risk. Verify policy issuance date and confirm no misrepresentation at proposal stage.`);
  } else if (policyAge === '3–12 months') {
    score += 1;
  }

  // Filing delay
  if (days > 30) {
    score += 2;
    flags.push(`Claim filed ${days} days after incident — delay beyond 30 days requires written insured explanation and may affect admissibility under standard policy conditions.`);
  } else if (days <= 1 && (incidentType === 'Theft' || incidentType === 'Fire')) {
    score += 1;
    flags.push(`Same-day or next-day filing on a ${incidentType.toLowerCase()} claim — verify FIR or fire brigade report timestamp for chronological consistency.`);
  }

  // Amount vs. typical range
  const typicalCeiling: Record<string, number> = {
    Motor:    2000000,   // ₹20L
    Property: 10000000,  // ₹1 Cr
    Health:   500000,    // ₹5L
    Life:     5000000,   // ₹50L
    Travel:   500000,    // ₹5L
  };
  const ceiling = typicalCeiling[policyType] || 2000000;
  if (amt > ceiling * 2) {
    score += 2;
    flags.push(`Claim of ${inr(amt)} is well above the typical ${policyType} ceiling of ${inr(ceiling)} — mandatory surveyor/assessor report required before any settlement.`);
  } else if (amt > ceiling) {
    score += 1;
    flags.push(`Claim amount ${inr(amt)} exceeds median for ${policyType} class — independent surveyor assessment recommended.`);
  }

  // Coverage mismatch
  if (coverage === 'EXCLUDED') {
    score += 3;
    flags.push(`${incidentType} is not a standard covered peril under ${policyType} policies — review policy schedule for specific endorsements or riders before rejection.`);
  }

  if (!flags.length) {
    flags.push(`No material fraud indicators present — claim profile is internally consistent with standard parameters for this policy class.`);
  }

  const fraudRisk =
    score <= 1 ? 'LOW' :
    score <= 3 ? 'MEDIUM' :
    score <= 6 ? 'HIGH' :
    'CRITICAL';

  // Triage priority
  const triage =
    fraudRisk === 'CRITICAL' ? 'REFER_SIU' :
    fraudRisk === 'HIGH'     ? 'INVESTIGATE' :
    (fraudRisk === 'LOW' && amt <= ceiling * 0.5) ? 'FAST_TRACK' :
    'STANDARD';

  // Settlement estimate
  const settlePct =
    coverage === 'LIKELY_COVERED' && fraudRisk === 'LOW'    ? 0.92 :
    coverage === 'LIKELY_COVERED' && fraudRisk === 'MEDIUM' ? 0.72 :
    coverage === 'LIKELY_COVERED'                           ? 0.35 :
    coverage === 'NEEDS_REVIEW'   && fraudRisk === 'LOW'    ? 0.60 :
    coverage === 'NEEDS_REVIEW'                             ? 0.30 :
    0;

  const settlementRange = settlePct > 0
    ? `${inr(amt * settlePct * 0.85)} – ${inr(amt * settlePct)}`
    : 'Pending investigation / possible exclusion';

  // Narrative
  const p1 =
    `This ${policyType} claim of ${inr(amt)} for ${incidentType.toLowerCase()} was filed ` +
    (days === 0 ? 'on the date of' : `${days} day${days === 1 ? '' : 's'} after`) +
    ` the reported incident, against a policy that is ${policyAge} old. ` +
    (isCoveredPeril
      ? `${incidentType} is a standard covered peril under ${policyType} policies.`
      : `${incidentType} is not a standard covered peril under ${policyType} policies — this creates an immediate coverage concern that must be resolved before adjudication.`);

  const p2 = prior > 0
    ? `The insured has ${prior} prior claim${prior > 1 ? 's' : ''} on record in the past 3 years. ` +
      (prior >= 3
        ? 'This frequency crosses the threshold for SIU referral — the cumulative claim history requires pattern-level review.'
        : prior >= 2
        ? 'Two prior claims in 3 years falls within policy limits but warrants explicit mention in the adjuster file.'
        : 'One prior claim is within normal parameters.')
    : `The insured has no prior claims on record — a clean claims history that supports the claim profile.`;

  const p3 =
    triage === 'FAST_TRACK'  ? 'Overall, this claim presents no material fraud indicators, coverage is clear, and the quantum is within standard parameters. Recommend expedited processing with standard documentation checks only. Target assignment within 24 hours.' :
    triage === 'STANDARD'    ? 'The claim warrants standard processing. Collect complete supporting documentation, verify incident details against available third-party records, and assign to the next available adjuster per normal queue.' :
    triage === 'INVESTIGATE' ? 'One or more fraud indicators are present. Do not advance this claim without a formal investigation step — obtain FIR or fire report, conduct a site survey, and gather any available independent verification before proceeding to settlement.' :
    'Multiple high-risk signals are present across fraud, coverage, and behavioral dimensions. Refer immediately to the Special Investigation Unit. Do not communicate any claim decision, advance any payment, or acknowledge liability until SIU review is complete.';

  return {
    fraudRisk,
    coverage,
    triage,
    settlementRange,
    riskFlags: flags,
    narrative: `${p1}\n\n${p2}\n\n${p3}`,
  };
}

// ── Sub-components ────────────────────────────────────────────

function SectionHead({ idx, title }: { idx: string; title: string }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 34 }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: INS, letterSpacing: '0.1em' }}>{idx}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--txt-dim)' }}>{title}</span>
      <motion.span
        initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative', top: -3, transformOrigin: 'left', display: 'block' }}
      />
    </motion.div>
  );
}

function MetricBadge({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3 }}>
      <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 5 }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: signalColor(val) }}>{val || '—'}</span>
    </div>
  );
}

function SignalCard({ code, title, desc }: { code: string; title: string; desc: string }) {
  return (
    <div style={{ padding: '24px 22px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color: INS, marginBottom: 10 }}>{code}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-dim)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--txt-faint)', lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--txt-dim)', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 3,
  color: 'var(--txt)',
  fontFamily: 'var(--mono)',
  fontSize: 13,
  padding: '10px 12px',
  outline: 'none',
  WebkitAppearance: 'none',
  appearance: 'none',
};

// ── Page ──────────────────────────────────────────────────────

export default function InsurancePage() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    policyType: '',
    incidentType: '',
    amount: '',
    daysSince: '',
    priorClaims: '',
    policyAge: '',
  });
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<ClaimBrief | null>(null);
  const [err, setErr] = useState('');

  const field = (id: keyof typeof form, val: string) => setForm(f => ({ ...f, [id]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const { policyType, incidentType, amount, daysSince, priorClaims, policyAge } = form;
    if (!policyType || !incidentType || !amount || !daysSince || !priorClaims || !policyAge) {
      setErr('All fields are required to generate a triage assessment.'); return;
    }
    if (parseFloat(amount) <= 0) { setErr('Claim amount must be a positive value.'); return; }
    setLoading(true); setBrief(null);
    setTimeout(() => {
      setBrief(analyseClaim(policyType, incidentType, amount, daysSince, priorClaims, policyAge));
      setLoading(false);
    }, 1200 + Math.random() * 700);
  };

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>

      {/* ── HEADER ── */}
      <header style={{ padding: 'clamp(72px,10vw,120px) clamp(16px,4vw,48px) 64px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--txt-faint)', marginBottom: 24 }}>
          S-ASHWATH / DOMAIN_03 / <span style={{ color: INS }}>INSURANCE</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontWeight: 700, fontSize: 'clamp(34px, 5.5vw, 68px)', lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 26, maxWidth: '18ch' }}>
          Claims intelligence<br />for insurance<br />operations<span style={{ color: INS, textShadow: `0 0 26px rgba(124,77,255,0.45)` }}>.</span>
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(16px, 1.9vw, 19px)', color: 'var(--txt-dim)', maxWidth: '58ch', lineHeight: 1.55 }}>
          India processes over{' '}
          <strong style={{ color: 'var(--txt)' }}>250 million claims annually.</strong>{' '}
          The bottleneck isn&apos;t volume — it&apos;s the hours adjusters spend manually reviewing
          FNOL submissions, cross-referencing policy terms, and pattern-matching fraud signals before
          making a triage decision. This agent does that in seconds.
        </motion.p>
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: 36, marginTop: 40, flexWrap: 'wrap' }}>
          {[
            ['250M+', 'Claims filed in India per year'],
            ['₹45,000 Cr', 'Estimated annual fraud losses'],
            ['60%',  'Adjuster time on documentation'],
          ].map(([v, l]) => (
            <div key={l}>
              <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                <span style={{ color: INS }}>{v}</span>
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', display: 'block', marginTop: 7 }}>{l}</span>
            </div>
          ))}
        </motion.div>
      </header>

      {/* ── PROBLEM ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px)', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="01" title="The Problem" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 14 }}>
          {[
            {
              tag: '// The Pain',
              h: 'Adjusters are buried in FNOL forms',
              body: 'A standard first notice of loss file carries 6–10 attachments — FIR, survey reports, hospital bills, repair estimates, photographs, and witness statements. Reading all of it before making a triage decision takes hours. Actual judgment gets the last 20 minutes.',
            },
            {
              tag: '// The Risk',
              h: 'Fraud signals vanish in the queue',
              body: 'A motor claim filed the day after a 2-month-old policy is issued, for an amount above policy value, by an insured with 3 prior claims — each flag alone is a mild yellow. Together they are a clear refer-to-SIU. Manual review misses the combination.',
            },
            {
              tag: '// The Approach',
              h: 'AI triage with structured fraud scoring',
              body: 'The agent cross-references the primary FNOL signals — policy age, incident type, claim amount, filing delay, and claims history — applies underwriting logic, and produces a structured brief with a fraud score and triage recommendation the adjuster can act on immediately.',
              highlight: true,
            },
            {
              tag: '// The Target',
              h: 'Insurers, TPAs, and InsurTech platforms',
              body: 'Built for first-party claims teams, third-party administrators onboarding high-volume portfolios, and embedded insurance platforms where triage speed is a direct cost-of-claims lever.',
            },
          ].map((c, i) => (
            <motion.div key={i} custom={i * 0.5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ padding: '28px 26px', background: 'var(--bg2)', border: `1px solid ${c.highlight ? `rgba(124,77,255,0.3)` : 'var(--border)'}`, borderRadius: 4 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 12 }}>{c.tag}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, lineHeight: 1.3, color: c.highlight ? INS : 'var(--txt)' }}>{c.h}</h3>
              <p style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.6 }}>{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SIGNAL LOGIC ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px)', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="02" title="The Triage Signal Logic" />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          <SignalCard
            code="FNOL"
            title="First Notice of Loss"
            desc="Policy type, incident category, and claim quantum. The primary triage layer — determines coverage perimeter and expected settlement range before any investigation begins."
          />
          <SignalCard
            code="BEHAV"
            title="Behavioral Signals"
            desc="Policy age at filing, days from incident to report, and 3-year claims frequency. Each flag is mild alone; in combination they form the clearest early fraud pattern available at intake."
          />
          <SignalCard
            code="AMOUNT"
            title="Quantum Analysis"
            desc="Claim amount indexed against policy-class typical ceilings. Values above 1× ceiling trigger surveyor requirements; values above 2× ceiling require mandatory independent assessment before adjudication."
          />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ padding: '20px 24px', background: 'var(--bg2)', border: `1px solid rgba(124,77,255,0.18)`, borderRadius: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
            {[
              { score: '0 – 1', label: 'LOW', action: 'FAST_TRACK or STANDARD', color: 'var(--live)' },
              { score: '2 – 3', label: 'MEDIUM', action: 'STANDARD processing', color: 'var(--poc)' },
              { score: '4 – 6', label: 'HIGH', action: 'INVESTIGATE before advance', color: 'var(--acc)' },
              { score: '7+',    label: 'CRITICAL', action: 'REFER to SIU immediately', color: 'var(--acc)' },
            ].map(tier => (
              <div key={tier.label} style={{ padding: '14px 10px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--txt-faint)', letterSpacing: '0.12em', marginBottom: 5 }}>SCORE {tier.score}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: tier.color, marginBottom: 5 }}>{tier.label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)', lineHeight: 1.5 }}>{tier.action}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── AGENT ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px) 90px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="03" title="Claims Triage Agent · Live" />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ border: `1px solid rgba(124,77,255,0.22)`, borderRadius: 6, overflow: 'hidden', background: 'var(--bg2)' }}>

          {/* Agent header bar */}
          <div style={{ padding: '15px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--txt-dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: INS, boxShadow: `0 0 8px ${INS}`, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              CLAIMS TRIAGE AGENT
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>// INS_A1 · DOMAIN_03</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '380px 1fr' }}>

            {/* Input panel */}
            <div style={{ padding: '26px 28px', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 20 }}>// FNOL Profile</div>
              <form onSubmit={handleSubmit} noValidate>

                <FieldGroup label="Policy type">
                  <select value={form.policyType} onChange={e => field('policyType', e.target.value)} style={inputStyle}>
                    <option value="">Select type</option>
                    {['Motor', 'Property', 'Health', 'Life', 'Travel'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>

                <FieldGroup label="Incident type">
                  <select value={form.incidentType} onChange={e => field('incidentType', e.target.value)} style={inputStyle}>
                    <option value="">Select incident</option>
                    {['Accident', 'Theft', 'Fire', 'Medical Claim', 'Natural Disaster'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>

                <FieldGroup label="Claim amount" hint="Full amount in ₹ — 5 L = 500000">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--txt-faint)', pointerEvents: 'none' }}>₹</span>
                    <input type="number" value={form.amount} onChange={e => field('amount', e.target.value)}
                      placeholder="e.g. 500000" min={0} style={{ ...inputStyle, paddingLeft: 26 }} />
                  </div>
                </FieldGroup>

                <FieldGroup label="Days between incident and filing">
                  <input type="number" value={form.daysSince} onChange={e => field('daysSince', e.target.value)}
                    placeholder="e.g. 3" min={0} style={inputStyle} />
                </FieldGroup>

                <FieldGroup label="Prior claims in the last 3 years">
                  <select value={form.priorClaims} onChange={e => field('priorClaims', e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    {['0', '1', '2', '3 or more'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>

                <FieldGroup label="Policy age at time of claim">
                  <select value={form.policyAge} onChange={e => field('policyAge', e.target.value)} style={inputStyle}>
                    <option value="">Select age</option>
                    {['< 3 months', '3–12 months', '1–3 years', '3+ years'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>

                {err && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--acc)', marginBottom: 10 }}>// {err}</div>
                )}

                <motion.button type="submit" disabled={loading}
                  whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', padding: '13px', background: INS, color: '#fff', fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.4 : 1, marginTop: 4 }}>
                  Assess → Generate Triage Brief
                </motion.button>
              </form>
            </div>

            {/* Output panel */}
            <div style={{ padding: '26px 28px', minHeight: 460, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">

                {!loading && !brief && (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 32, color: 'var(--txt-faint)', opacity: 0.3 }}>◈</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>
                      Enter FNOL details and run assessment.<br />Triage brief generates in under 10 seconds.
                    </div>
                  </motion.div>
                )}

                {loading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                    <div style={{ width: 200, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div animate={{ x: ['-100%', '0%', '100%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ height: '100%', width: '100%', background: INS, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>
                      Scoring fraud signals — analysing FNOL profile...
                    </div>
                  </motion.div>
                )}

                {brief && !loading && (
                  <motion.div key="brief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: INS }}>// Triage Brief</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)' }}>
                        {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Metric badges */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      <MetricBadge label="Fraud Risk" val={brief.fraudRisk} />
                      <MetricBadge label="Coverage" val={brief.coverage} />
                      <MetricBadge label="Triage Priority" val={brief.triage} />
                      <MetricBadge label="Settlement Est." val={brief.triage === 'REFER_SIU' || brief.triage === 'INVESTIGATE' ? 'PENDING' : brief.fraudRisk} />
                    </div>

                    {/* Settlement range */}
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, marginBottom: 14, color: 'var(--txt-dim)' }}>
                      Indicative settlement range —{' '}
                      <strong style={{ color: INS }}>{brief.settlementRange}</strong>
                    </div>

                    {/* Risk flags */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 8 }}>// Risk Flags</div>
                      {brief.riskFlags.map((f, i) => (
                        <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-dim)', padding: '6px 0', borderBottom: i < brief.riskFlags.length - 1 ? '1px solid rgba(35,42,54,0.5)' : 'none', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--poc)', flexShrink: 0 }}>▸</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Narrative */}
                    <div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 8 }}>// Adjuster Narrative</div>
                      {brief.narrative.split(/\n\n+/).filter(Boolean).map((p, i) => (
                        <p key={i} style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.65, marginBottom: 11 }}>{p}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 13 }}>S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH</div>
          <div style={{ display: 'flex', gap: 22, fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.06em', color: 'var(--txt-dim)' }}>
            <a href="mailto:rambotechnologies@gmail.com" style={{ transition: 'color 0.2s' }}>EMAIL</a>
            <a href="https://www.linkedin.com/in/s-ashwathv" target="_blank" rel="noopener noreferrer" style={{ transition: 'color 0.2s' }}>LINKEDIN</a>
            <Link href="/">ALL DOMAINS</Link>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', width: '100%', marginTop: 6 }}>
            // Insurance · DOMAIN_03 · AI for claims triage and fraud signal analysis
          </div>
        </div>
      </footer>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
