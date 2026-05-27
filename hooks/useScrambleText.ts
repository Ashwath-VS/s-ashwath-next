'use client';

import { useState, useEffect } from 'react';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—/|\\';

export function useScrambleText(target: string, delay = 0, duration = 900) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let raf: number;
    let startTime: number | null = null;

    const timeout = setTimeout(() => {
      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const result = target
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            const lockThreshold = (i / target.length) * 0.5;
            if (progress > lockThreshold + 0.5) return char;
            return CHARSET[Math.floor(Math.random() * CHARSET.length)];
          })
          .join('');

        setDisplay(result);

        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          setDisplay(target);
        }
      };

      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, delay, duration]);

  return display || target;
}
