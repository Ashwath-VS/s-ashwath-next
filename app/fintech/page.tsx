'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';

const FIN = '#2979ff';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }),
};

interface CreditBrief {
  revenueMatch: string; cashFlow: string; riskLevel: string;
  recommendation: string; limitRange: string; riskFlags: string[]; narrative: string;
}

function crore(n: number): string {
  return n >= 10000000 ? '₹' + (n / 10000000).toFixed(1) + ' Cr' : '₹' + (n / 100000).toFixed(1) + ' L';
}

function statusColor(val: string): string {
  if (['STRONG', 'HEALTHY', 'LOW', 'APPROVE'].includes(val)) return 'var(--live)';
  if (['MODERATE', 'ADEQUATE', 'MEDIUM', 'REVIEW', 'MORE_INFO'].includes(val)) return 'var(--poc)';
  return 'var(--acc)';
}

function analyseCredit(businessType: string, gst: string, bank: string, itr: string): CreditBrief {
  const gstN = parseFloat(gst), bankN = parseFloat(bank), itrN = parseFloat(itr);
  const bankToGst = bankN / gstN;
  const marginPct = (itrN / gstN) * 100;
  const divergePct = Math.abs(bankN - gstN) / gstN * 100;
  const revenueMatch = divergePct < 20 ? 'STRONG' : divergePct < 40 ? 'MODERATE' : 'WEAK';
  const cashFlow = bankToGst >= 0.82 ? 'HEALTHY' : bankToGst >= 0.62 ? 'ADEQUATE' : 'WEAK';
  let riskScore = 0;
  if (revenueMatch === 'WEAK') riskScore += 3;
  else if (revenueMatch === 'MODERATE') riskScore += 1;
  if (cashFlow === 'WEAK') riskScore += 2;
  else if (cashFlow === 'ADEQUATE') riskScore += 1;
  if (marginPct < 6) riskScore += 2;
  else if (marginPct < 12) riskScore += 1;
  if (itrN <= 0) riskScore += 3;
  const riskLevel = riskScore <= 1 ? 'LOW' : riskScore <= 3 ? 'MEDIUM' : riskScore <= 5 ? 'HIGH' : 'CRITICAL';
  const recommendation = riskScore <= 1 ? 'APPROVE' : riskScore <= 3 ? 'REVIEW' : riskScore <= 5 ? 'MORE_INFO' : 'DECLINE';
  const lp = recommendation === 'APPROVE' ? 0.20 : recommendation === 'REVIEW' ? 0.12 : 0.07;
  const limitRange = crore(gstN * lp * 0.85) + ' – ' + crore(gstN * lp * 1.15);
  const riskFlags: string[] = [];
  if (divergePct > 30) {
    riskFlags.push(bankN < gstN
      ? `Bank credits are ${Math.round(divergePct)}% below GST turnover — verify cash transactions or multiple banking arrangements`
      : `Bank credits exceed GST turnover by ${Math.round(divergePct)}% — confirm GST registration completeness`);
  }
  if (marginPct < 6 && itrN > 0)
    riskFlags.push(`ITR-to-GST ratio of ${marginPct.toFixed(1)}% is below sector norms — review operating cost structure`);
  if (itrN <= 0)
    riskFlags.push(`Zero or negative declared income — tax compliance posture requires direct verification`);
  if (bankToGst < 0.6)
    riskFlags.push(`Banking credits significantly below turnover — incomplete banking disclosure or multiple active accounts likely`);
  if (businessType === 'Export-oriented' && bankN < gstN * 0.7)
    riskFlags.push(`Export-oriented entity — verify foreign receivable remittance against FIRA/BRC`);
  if (!riskFlags.length)
    riskFlags.push(`No material risk flags — financials are internally consistent`);
  const gstS = crore(gstN), bankS = crore(bankN), itrS = crore(itrN);
  const p1 = `The ${businessType.toLowerCase()} business reports GST annual turnover of ${gstS} against bank credits of ${bankS} over 12 months` +
    (divergePct < 20
      ? `, a ${Math.round(divergePct)}% variance within the ±20% acceptable threshold. Banking behaviour is broadly consistent with declared turnover.`
      : `, a ${Math.round(divergePct)}% divergence that requires investigation into cash transactions, partial banking disclosure, or GST coverage gaps.`);
  const p2 = `Declared ITR income of ${itrS} implies an effective margin of ${marginPct.toFixed(1)}% on GST turnover. ` +
    (marginPct >= 15 ? 'This is above-average for the sector, indicating strong unit economics or conservative revenue recognition.'
      : marginPct >= 6 ? 'This falls within normal range. No structural profitability concern at this stage.'
      : 'This is below typical sector margins — possible cost pressure, deferred provisions, or income suppression warrants review.');
  const p3 = recommendation === 'APPROVE'
    ? 'Overall, the financials present a coherent and bankable profile. Revenue, banking, and tax signals are aligned. Recommend proceeding at the indicated limit, subject to standard KYC, bureau, and CIBIL checks.'
    : recommendation === 'REVIEW'
    ? 'The profile is mixed — core signals are acceptable but one or more divergences require clarification. Recommend a promoter call and 6-month bank statement review before final decision.'
    : 'The profile raises material concerns across multiple signals. Significant additional documentation and direct promoter verification are required before a credit decision can be made.';
  return { revenueMatch, cashFlow, riskLevel, recommendation, limitRange, riskFlags, narrative: p1 + '\n\n' + p2 + '\n\n' + p3 };
}

function MetricBadge({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3 }}>
      <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 5 }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: statusColor(val) }}>{val || '—'}</span>
    </div>
  );
}

export default function FintechPage() {
  const [form, setForm] = useState({ businessType: '', gst: '', bank: '', itr: '', context: '' });
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<CreditBrief | null>(null);
  const [err, setErr] = useState('');
  const isMobile = useIsMobile();

  const field = (id: keyof typeof form, val: string) => setForm(f => ({ ...f, [id]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.businessType || !form.gst || !form.bank || !form.itr) {
      setErr('All required fields must be filled.'); return;
    }
    setLoading(true); setBrief(null);
    setTimeout(() => {
      setBrief(analyseCredit(form.businessType, form.gst, form.bank, form.itr));
      setLoading(false);
    }, 1400 + Math.random() * 600);
  };

  return (
    <div style={{ paddingTop: 52 }}>

      {/* ── HEADER ── */}
      <header style={{ padding: 'clamp(72px,10vw,120px) clamp(16px,4vw,48px) 64px', maxWidth: 1080, margin: '0 auto' }}>
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--txt-faint)', marginBottom: 24 }}>
          S-ASHWATH / DOMAIN_02 / <span style={{ color: FIN }}>FIN-TECH</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontWeight: 700, fontSize: 'clamp(34px, 5.5vw, 68px)', lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 26, maxWidth: '16ch' }}>
          Credit intelligence<br />for Indian MSME<br />lending<span style={{ color: FIN, textShadow: '0 0 26px rgba(41,121,255,0.45)' }}>.</span>
        </motion.h1>
        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(16px, 1.9vw, 19px)', color: 'var(--txt-dim)', maxWidth: '60ch', lineHeight: 1.55 }}>
          India has a <strong style={{ color: 'var(--txt)' }}>$530B MSME credit gap.</strong> The bottleneck isn&apos;t capital — it&apos;s the hours underwriters spend manually triangulating GST returns, bank statements, and ITR before making a decision. This agent does that in seconds.
        </motion.p>
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: 36, marginTop: 40, flexWrap: 'wrap' }}>
          {[['63M+', 'MSMEs in India'], ['$530B', 'MSME credit gap'], ['70%', 'Analyst time on doc review']].map(([v, l]) => (
            <div key={l}>
              <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                <span style={{ color: FIN }}>{v}</span>
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--txt-faint)', display: 'block', marginTop: 7 }}>{l}</span>
            </div>
          ))}
        </motion.div>
      </header>

      {/* ── PROBLEM ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px)', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="01" title="The Problem" color={FIN} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[
            { tag: '// The Pain', h: 'Underwriters are buried in documents', body: 'A typical MSME credit file has 8–12 documents — GST returns, ITR, bank statements, balance sheets, Tally exports, CA certificates. Cross-referencing them manually takes hours. The actual credit judgment gets 30 minutes.' },
            { tag: '// The Risk', h: 'Manual triangulation misses signals', body: 'A business showing ₹2Cr GST turnover with ₹80L in bank credits isn\'t just a discrepancy — it\'s either a cash-heavy operation or income suppression. These patterns are caught late, if at all.' },
            { tag: '// The Approach', h: 'AI triangulation with a credit narrative', body: 'The agent cross-references the three primary Indian MSME financial signals — GST, bank credits, ITR — applies underwriting logic, and delivers a structured brief with a risk narrative the underwriter can act on immediately.', highlight: true },
            { tag: '// The Target', h: 'NBFCs, fintechs, embedded lenders', body: 'Built for mid-market lenders, trade finance providers, and embedded finance platforms onboarding MSME borrowers — where speed of underwriting is a competitive differentiator.' },
          ].map((c, i) => (
            <motion.div key={i} custom={i * 0.5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ padding: '28px 26px', background: 'var(--bg2)', border: `1px solid ${c.highlight ? 'rgba(41,121,255,0.28)' : 'var(--border)'}`, borderRadius: 4 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 12 }}>{c.tag}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, lineHeight: 1.3, color: c.highlight ? FIN : 'var(--txt)' }}>{c.h}</h3>
              <p style={{ fontSize: 14, color: 'var(--txt-dim)', lineHeight: 1.6 }}>{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRIANGULATION ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px)', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="02" title="The Triangulation Logic" color={FIN} />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr', gap: 14, maxWidth: 680, margin: '0 auto', alignItems: 'center' }}>
          <TriCard code="GST" title="Annual Turnover" desc="Government-verified revenue. The primary benchmark — hard to falsify, easy to cross-reference against banking behaviour." color={FIN} />
          <div style={{ textAlign: 'center', fontSize: 22, color: 'var(--txt-faint)' }}>⟷</div>
          <TriCard code="BANK" title="Credits (12m)" desc="Actual cash flow. Should track GST turnover within ±20%. Larger divergence reveals cash business or fund diversion." color={FIN} />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ textAlign: 'center', fontSize: 20, color: 'var(--txt-faint)', margin: '12px 0' }}>↕</motion.div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'flex', justifyContent: 'center' }}>
          <TriCard code="ITR" title="Declared Income" desc="Net profitability signal. ITR-to-GST ratio reveals operating margin health and tax compliance posture." color={FIN} />
        </motion.div>
      </section>

      {/* ── AGENT ── */}
      <section style={{ padding: '60px clamp(16px,4vw,48px) 90px', maxWidth: 1080, margin: '0 auto' }}>
        <SectionHead idx="03" title="SME Credit Analyst · Live Agent" color={FIN} />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ border: `1px solid rgba(41,121,255,0.22)`, borderRadius: 6, overflow: 'hidden', background: 'var(--bg2)' }}>

          {/* Agent header */}
          <div style={{ padding: '15px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', color: 'var(--txt-dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: FIN, boxShadow: `0 0 8px ${FIN}`, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              SME CREDIT ANALYST AGENT
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>// FINTECH_A4 · DOMAIN_02</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '360px 1fr' }}>
            {/* Input panel */}
            <div style={{ padding: '26px 28px', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 20 }}>// Business Profile</div>
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup label="Business type">
                  <select value={form.businessType} onChange={e => field('businessType', e.target.value)} style={selectStyle(FIN)}>
                    <option value="">Select type</option>
                    {['Manufacturing', 'Trading', 'Services', 'Mixed (Mfg + Trading)', 'Export-oriented', 'Retail'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="GST Annual Turnover" hint="Full amount in ₹ — 1.2 Cr = 12000000">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--txt-faint)', pointerEvents: 'none' }}>₹</span>
                    <input type="number" value={form.gst} onChange={e => field('gst', e.target.value)} placeholder="e.g. 12000000" min={0} style={{ ...inputStyle(FIN), paddingLeft: 26 }} />
                  </div>
                </FieldGroup>
                <FieldGroup label="Bank Credits — last 12 months">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--txt-faint)', pointerEvents: 'none' }}>₹</span>
                    <input type="number" value={form.bank} onChange={e => field('bank', e.target.value)} placeholder="e.g. 9500000" min={0} style={{ ...inputStyle(FIN), paddingLeft: 26 }} />
                  </div>
                </FieldGroup>
                <FieldGroup label="ITR Declared Income (latest year)">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--txt-faint)', pointerEvents: 'none' }}>₹</span>
                    <input type="number" value={form.itr} onChange={e => field('itr', e.target.value)} placeholder="e.g. 1800000" min={0} style={{ ...inputStyle(FIN), paddingLeft: 26 }} />
                  </div>
                </FieldGroup>
                <FieldGroup label="Additional context (optional)">
                  <textarea value={form.context} onChange={e => field('context', e.target.value)} placeholder="e.g. seasonal business, export receivables, recent capex..." rows={3}
                    style={{ ...inputStyle(FIN), resize: 'vertical', lineHeight: 1.5, fontSize: 12 }} />
                </FieldGroup>
                {err && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--acc)', marginBottom: 10 }}>// {err}</div>}
                <motion.button type="submit" disabled={loading} whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', padding: '13px', background: FIN, color: '#fff', fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.4 : 1, marginTop: 4 }}>
                  Analyse → Generate Credit Brief
                </motion.button>
              </form>
            </div>

            {/* Output panel */}
            <div style={{ padding: '26px 28px', minHeight: 440, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                {!loading && !brief && !err && (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 32, color: 'var(--txt-faint)', opacity: 0.3 }}>▚</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-faint)', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.8 }}>Enter business financials and run analysis.<br />Credit brief generates in under 10 seconds.</div>
                  </motion.div>
                )}
                {loading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
                    <div style={{ width: 200, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div animate={{ x: ['-100%', '0%', '100%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ height: '100%', width: '100%', background: FIN, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--txt-faint)', letterSpacing: '0.08em' }}>Triangulating financials — analysing signals...</div>
                  </motion.div>
                )}
                {brief && !loading && (
                  <motion.div key="brief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: FIN }}>// Credit Brief</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--txt-faint)' }}>{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      <MetricBadge label="Revenue Match" val={brief.revenueMatch} />
                      <MetricBadge label="Cash Flow" val={brief.cashFlow} />
                      <MetricBadge label="Risk Level" val={brief.riskLevel} />
                      <MetricBadge label="Recommendation" val={brief.recommendation} />
                    </div>
                    {brief.limitRange && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, marginBottom: 14, color: 'var(--txt-dim)' }}>
                        Suggested credit limit — <strong style={{ color: FIN }}>{brief.limitRange}</strong>
                      </div>
                    )}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 8 }}>// Risk Flags</div>
                      {brief.riskFlags.map((f, i) => (
                        <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--txt-dim)', padding: '6px 0', borderBottom: i < brief.riskFlags.length - 1 ? '1px solid rgba(35,42,54,0.5)' : 'none', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--poc)', flexShrink: 0 }}>▸</span><span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--txt-faint)', marginBottom: 8 }}>// Credit Narrative</div>
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
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--txt-faint)', width: '100%', marginTop: 6 }}>// Fin-Tech · DOMAIN_02 · AI for Indian MSME credit underwriting</div>
        </div>
      </footer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

function SectionHead({ idx, title, color }: { idx: string; title: string; color: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 34 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color, letterSpacing: '0.1em' }}>{idx}</span>
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

function TriCard({ code, title, desc, color }: { code: string; title: string; desc: string; color: string }) {
  return (
    <div style={{ padding: '24px 22px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, textAlign: 'center', maxWidth: 300 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700, color, marginBottom: 10 }}>{code}</div>
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

function inputStyle(accentColor: string): React.CSSProperties {
  return { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--txt)', fontFamily: 'var(--mono)', fontSize: 13, padding: '10px 12px', outline: 'none', WebkitAppearance: 'none', appearance: 'none' };
}

function selectStyle(accentColor: string): React.CSSProperties {
  return { ...inputStyle(accentColor) };
}
