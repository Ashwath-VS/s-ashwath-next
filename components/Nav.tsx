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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close overlay on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Full-width wrapper — pointer-events:none so the empty space around the pill
          doesn't block clicks on page content beneath it */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px clamp(16px, 4vw, 40px) 0',
        pointerEvents: 'none',
      }}>
        {/* Floating glass pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents: 'all',
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 48,
            padding: '0 8px 0 24px',
            background: 'rgba(7,9,12,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 9999,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.45)',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 800,
            letterSpacing: '0.06em', color: 'var(--txt)', flexShrink: 0,
            textDecoration: 'none',
          }}>
            S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH
          </Link>

          {/* Desktop links */}
          <div className="mobile-hide" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {links.map(l => {
              const isActive = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--txt)' : 'var(--txt-dim)',
                  padding: '6px 12px',
                  borderRadius: 9999,
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  transition: 'color 0.2s, background 0.2s',
                  textDecoration: 'none',
                  display: 'block',
                }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Status badge — desktop */}
          <div className="mobile-hide" style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
            color: 'var(--poc)',
            background: 'rgba(255,176,32,0.08)',
            border: '1px solid rgba(255,176,32,0.2)',
            padding: '6px 14px',
            borderRadius: 9999,
            letterSpacing: '0.08em',
            display: 'flex', alignItems: 'center', gap: 7,
            flexShrink: 0,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--live)', boxShadow: '0 0 6px var(--live)',
              display: 'inline-block', animation: 'pulse 2s infinite',
            }} />
            1 COMPLETE · 4 LIVE
          </div>

          {/* Hamburger button — mobile only (shown via .mobile-hamburger in globals.css) */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="mobile-hamburger"
            style={{
              display: 'none',
              width: 36, height: 36,
              background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 9999,
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              padding: 0,
            }}
          >
            {/* Line 1 — rotates to top arm of X */}
            <span style={{
              position: 'absolute',
              top: '50%', left: '50%',
              display: 'block', width: 16, height: 1.5,
              background: 'var(--txt)', borderRadius: 2,
              transform: open
                ? 'translate(-50%, -50%) rotate(45deg)'
                : 'translate(-50%, calc(-50% - 3.5px))',
              transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
            }} />
            {/* Line 2 — rotates to bottom arm of X */}
            <span style={{
              position: 'absolute',
              top: '50%', left: '50%',
              display: 'block', width: 16, height: 1.5,
              background: 'var(--txt)', borderRadius: 2,
              transform: open
                ? 'translate(-50%, -50%) rotate(-45deg)'
                : 'translate(-50%, calc(-50% + 3.5px))',
              transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
            }} />
          </button>
        </motion.div>
      </div>

      {/* Mobile full-screen overlay with staggered link reveal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99,
              background: 'rgba(7,9,12,0.97)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 clamp(24px, 6vw, 48px)',
            }}
          >
            {links.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.38, delay: 0.04 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={l.href} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 0',
                  fontFamily: 'var(--mono)',
                  fontSize: 'clamp(22px, 5vw, 30px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: pathname === l.href ? 'var(--txt)' : 'var(--txt-dim)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}>
                  {l.label}
                  {pathname === l.href && (
                    <span style={{ fontSize: 10, color: 'var(--acc)', letterSpacing: '0.12em', fontWeight: 500 }}>
                      ACTIVE
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{
                marginTop: 28,
                fontFamily: 'var(--mono)', fontSize: 10,
                color: 'var(--poc)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--live)', boxShadow: '0 0 6px var(--live)',
                display: 'inline-block', animation: 'pulse 2s infinite',
              }} />
              1 COMPLETE · 4 LIVE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
