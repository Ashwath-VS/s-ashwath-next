'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on pointer-fine devices (desktop)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    dot.style.opacity  = '1';
    ring.style.opacity = '1';

    let mx = -200, my = -200;
    let rx = -200, ry = -200;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let raf: number;

    const animate = () => {
      rx = lerp(rx, mx, 0.1);
      ry = lerp(ry, my, 0.1);
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      raf = requestAnimationFrame(animate);
    };

    const onEnter = () => { ring.style.transform += ' scale(1.8)'; ring.style.borderColor = 'rgba(255,59,48,0.45)'; };
    const onLeave = () => { ring.style.borderColor = 'rgba(255,255,255,0.18)'; };

    const attachHovers = () => {
      document.querySelectorAll<HTMLElement>('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(animate);
    attachHovers();

    // Re-attach when DOM changes (Next.js navigation)
    const observer = new MutationObserver(attachHovers);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 10000,
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--acc)', pointerEvents: 'none',
        opacity: 0, willChange: 'transform',
        boxShadow: '0 0 10px var(--acc)',
        transition: 'opacity 0.3s',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.18)',
        pointerEvents: 'none', opacity: 0,
        willChange: 'transform',
        transition: 'opacity 0.3s, border-color 0.2s, transform 0.08s',
      }} />
    </>
  );
}
