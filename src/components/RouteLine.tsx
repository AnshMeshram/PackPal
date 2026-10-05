import React from 'react';

interface RouteLineProps {
  className?: string;
  variant?: 'curved' | 'horizontal' | 'vertical';
  startLabel?: string;
  endLabel?: string;
}

export function RouteLine({
  className = '',
  variant = 'horizontal',
  startLabel,
  endLabel,
}: RouteLineProps) {
  if (variant === 'curved') {
    return (
      <div className={`relative pointer-events-none select-none ${className}`}>
        <svg
          viewBox="0 0 400 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-[var(--emerald-ink)]"
        >
          {/* Start Point */}
          <circle cx="20" cy="90" r="4" fill="var(--green-900)" />
          <circle cx="20" cy="90" r="8" stroke="var(--emerald-ink)" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Curved Dashed Path */}
          <path
            d="M 28 88 C 120 70, 220 110, 360 30"
            stroke="var(--emerald-ink)"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* End Point / Pin Marker */}
          <circle cx="366" cy="28" r="4.5" fill="var(--coral)" />
          <circle cx="366" cy="28" r="9" stroke="var(--coral)" strokeWidth="1.5" strokeOpacity="0.4" />
        </svg>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--green-900)] ring-4 ring-[var(--polar)] shrink-0" />
        <div className="w-0.5 flex-1 min-h-[30px] border-l-2 border-dashed border-[var(--rule)] my-1" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--emerald-ink)] ring-4 ring-[var(--polar)] shrink-0" />
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={`flex items-center gap-2 select-none font-mono text-[10px] text-[var(--ink-muted)] ${className}`}>
      {startLabel && <span className="font-semibold uppercase text-[var(--green-900)]">{startLabel}</span>}
      <div className="w-2 h-2 rounded-full bg-[var(--green-900)] shrink-0" />
      <div className="flex-1 border-t-2 border-dashed border-[var(--emerald-ink)]/50 min-w-[40px]" />
      <div className="w-2 h-2 rounded-full bg-[var(--coral)] shrink-0" />
      {endLabel && <span className="font-semibold uppercase text-[var(--coral)]">{endLabel}</span>}
    </div>
  );
}
