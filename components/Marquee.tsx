'use client';

import { motion } from 'framer-motion';

const ITEMS = [
  '5 DOMAINS', '7 AI SYSTEMS', '18 YRS ENTERPRISE DELIVERY',
  'OPERATOR · BUILDER', '4 AGENTS LIVE', 'GEMINI 2.0 FLASH',
  'LIVE MARKET DATA', 'BFS CASCADE ENGINE', '13 SECTORS · 31 EDGES',
  '12 PERSONAS', 'BUILT SOLO · END TO END',
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div style={{
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.25)',
      padding: '12px 0',
    }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', width: 'max-content', willChange: 'transform' }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.22)',
              padding: '0 24px',
            }}>
              {item}
            </span>
            <span style={{ color: 'var(--acc)', fontSize: 8, opacity: 0.45 }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
