'use client';

import React, { useEffect, useRef, useState } from 'react';

type Variant = 'up' | 'scale' | 'left' | 'right';

interface LuxuryRevealProps {
  children: React.ReactNode;
  delay?: number;
  variant?: Variant;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export function LuxuryReveal({
  children,
  delay = 0,
  variant = 'up',
  className = '',
  threshold = 0.05,
  once = true,
}: LuxuryRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Immediately mark visible if already inside or above viewport
    const rect = ref.current.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100 && rect.bottom > -50) {
      setIsVisible(true);
      if (once) return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: Math.min(threshold, 0.05) }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      className={`luxury-reveal ${isVisible ? 'luxury-reveal-visible' : ''} ${className}`}
      data-variant={variant}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
