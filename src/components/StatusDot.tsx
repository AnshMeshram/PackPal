import React from 'react';

export type StatusType = 'live' | 'fallback' | 'offline' | 'optional' | 'checking';

interface StatusDotProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusDot({ status, label, className = '' }: StatusDotProps) {
  const getDotColor = () => {
    switch (status) {
      case 'live':
        return 'bg-[var(--emerald)]';
      case 'fallback':
        return 'bg-[var(--amber)]';
      case 'offline':
        return 'bg-[var(--coral)]';
      case 'optional':
        return 'bg-[var(--rule)]';
      case 'checking':
        return 'bg-[var(--teal)] animate-pulse';
      default:
        return 'bg-[var(--rule)]';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'live':
        return 'border-[var(--emerald-ink)]/30';
      case 'fallback':
        return 'border-[var(--amber)]/40';
      case 'offline':
        return 'border-[var(--coral)]/40';
      default:
        return 'border-[var(--rule)]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--ink)] ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${getDotColor()} ${getBorderColor()} inline-block shrink-0`} />
      {label && <span>{label}</span>}
    </span>
  );
}
