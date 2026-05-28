'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '/',            label: 'Home' },
  { href: '/ecommerce',   label: 'E-Commerce' },
  { href: '/fintech',     label: 'FinTech' },
  { href: '/traveltech',  label: 'TravelTech' },
  { href: '/scenarios',   label: 'Macro Engine' },
  { href: '/experience',  label: 'Experience' },
  { href: '/docs',        label: 'Docs' },
];

export default function Nav() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,32px)', height: '52px',
        background: 'rgba(7,9,12,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'border-color 0.3s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--txt)', flexShrink: 0 }}>
          S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH
        </Link>

        {/* Desktop links */}
        <div className="mobile-hide" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.08em', color: pathname === l.href ? 'var(--txt)' : 'var(--txt-dim)',
              transition: 'color 0.2s',
              borderBottom: pathname === l.href ? '1px solid var(--acc)' : '1px solid transparent',
              paddingBottom: '2px',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Status badge (desktop) */}
        <div className="mobile-hide" style={{
          fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700,
          color: 'var(--poc)', border: '1px solid rgba(255,176,32,0.25)',
          padding: '3px 10px', borderRadius: '2px', letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: '7px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--live)', boxShadow: '0 0 6px var(--live)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          1 COMPLETE · 4 LIVE
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: 'none', flexDirection: 'column', gap: 5,
            background: 'none', border: 'none', padding: 8, cursor: 'pointer',
          }}
          className="mobile-hamburger"
        >
          <span style={{ display: 'block', width: 20, height: 1.5, background: 'var(--txt)', transition: 'transform 0.2s, opacity 0.2s', transform: open ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none' }} />
          <span style={{ display: 'block', width: 20, height: 1.5, background: 'var(--txt)', transition: 'opacity 0.2s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: 20, height: 1.5, background: 'var(--txt)', transition: 'transform 0.2s, opacity 0.2s', transform: open ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none' }} />
        </button>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @media (max-width: 768px) {
            .mobile-hamburger { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 52, left: 0, right: 0, zIndex: 99,
              background: 'rgba(7,9,12,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '20px clamp(16px,4vw,32px) 28px',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}
          >
            {links.map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={l.href} style={{
                  display: 'block', padding: '14px 0',
                  fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: pathname === l.href ? 'var(--txt)' : 'var(--txt-dim)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {pathname === l.href && <span style={{ color: 'var(--acc)', marginRight: 10 }}>›</span>}
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--poc)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--live)', boxShadow: '0 0 6px var(--live)', display: 'inline-block' }} />
              1 COMPLETE · 4 LIVE
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
