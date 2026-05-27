'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/',            label: 'Home' },
  { href: '/ecommerce',   label: 'E-Commerce' },
  { href: '/fintech',     label: 'FinTech' },
  { href: '/traveltech',  label: 'TravelTech' },
  { href: '/scenarios',   label: 'Macro Engine' },
  { href: '/experience',  label: 'Experience' },
];

export default function Nav() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '52px',
      background: 'rgba(7,9,12,0.88)',
      backdropFilter: 'blur(14px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'border-color 0.3s',
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 800,
        letterSpacing: '0.06em', color: 'var(--txt)',
      }}>
        S<span style={{ color: 'var(--acc)' }}>-</span>ASHWATH
      </Link>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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

      <div style={{
        fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700,
        color: 'var(--poc)', border: '1px solid rgba(255,176,32,0.25)',
        padding: '3px 10px', borderRadius: '2px', letterSpacing: '0.1em',
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: 'var(--live)', boxShadow: '0 0 6px var(--live)',
          animation: 'pulse 2s infinite',
          display: 'inline-block',
        }} />
        1 COMPLETE · 4 LIVE
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </nav>
  );
}
