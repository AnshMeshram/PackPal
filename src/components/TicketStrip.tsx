import React from 'react';

export interface TicketStripField {
  label: string;
  value: string | React.ReactNode;
  subValue?: string;
}

interface TicketStripProps {
  code?: string;
  route?: string;
  badge?: React.ReactNode;
  fields: TicketStripField[];
  className?: string;
}

export function TicketStrip({
  code = 'PKP-PASS',
  route,
  badge,
  fields,
  className = '',
}: TicketStripProps) {
  return (
    <div
      className={`relative bg-white rounded-[10px] border border-[var(--rule)] overflow-hidden font-mono shadow-[0_1px_3px_rgba(12,65,55,0.06)] ${className}`}
    >
      {/* Authentic perforated ticket cutout notches (Left & Right) */}
      <div className="absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-[var(--paper)] border border-[var(--rule)] transform -translate-y-1/2 shadow-inner z-20" />
      <div className="absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-[var(--paper)] border border-[var(--rule)] transform -translate-y-1/2 shadow-inner z-20" />

      {/* Header bar with tear perforation seam */}
      <div className="relative px-5 py-2.5 bg-[var(--polar)]/70 border-b border-dashed border-[var(--rule)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ink-muted)]">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-widest text-[var(--green-900)] text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald-ink)] inline-block" />
            {code}
          </span>
          {route && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/80 border border-[var(--rule)] text-[var(--green-900)] font-semibold tracking-wider">
              {route}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Decorative mini boarding-pass barcode lines */}
          <div className="hidden sm:flex items-center gap-[2px] h-3.5 opacity-40 text-[var(--green-900)]" aria-hidden="true">
            <span className="w-[1.5px] h-full bg-current" />
            <span className="w-[1px] h-full bg-current" />
            <span className="w-[2.5px] h-full bg-current" />
            <span className="w-[1px] h-full bg-current" />
            <span className="w-[3px] h-full bg-current" />
            <span className="w-[1px] h-full bg-current" />
            <span className="w-[2px] h-full bg-current" />
            <span className="w-[1.5px] h-full bg-current" />
          </div>

          {badge && <div>{badge}</div>}
        </div>
      </div>

      {/* Fields Strip with dashed tear-column dividers */}
      <div
        className="grid divide-x divide-dashed divide-[var(--rule)] py-3 px-5 relative"
        style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}
      >
        {fields.map((field, idx) => (
          <div
            key={idx}
            className={`px-3 text-center min-w-0 ${
              idx === 0 ? 'pl-1 text-left' : ''
            } ${idx === fields.length - 1 ? 'pr-1 text-right' : ''}`}
          >
            <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)] block font-semibold">
              {field.label}
            </span>
            <span className="text-xs sm:text-[13px] font-bold text-[var(--green-900)] block truncate mt-0.5">
              {field.value}
            </span>
            {field.subValue && (
              <span className="text-[10px] text-[var(--ink-muted)] block truncate mt-0.5">
                {field.subValue}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

