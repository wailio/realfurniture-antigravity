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
  threshold = 0.15,
  once = true,
}: LuxuryRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

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
