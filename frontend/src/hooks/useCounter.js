'use client';
import { useState, useEffect, useRef } from 'react';
import { easeOutExpo } from '@/lib/utils';

export function useCounter(target, duration = 1200, decimals = 0, trigger = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = easeOutExpo(progress) * target;
      setValue(parseFloat(current.toFixed(decimals)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, decimals, trigger]);

  return value;
}
