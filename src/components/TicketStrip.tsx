import React from 'react';

export interface TicketStripField {
  label: string;
  value: string | React.ReactNode;
  subValue?: string;
}

interface TicketStripProps {
  code?: string;
  badge?: React.ReactNode;
  fields: TicketStripField[];
  className?: string;
}

export function TicketStrip({ code = 'PKP-PASS', badge, fields, className = '' }: TicketStripProps) {
  return (
    <div
      className={`relative bg-white rounded-[6px] border border-[var(--rule)] overflow-hidden font-mono ${className}`}
    >
      {/* Punched-hole left and right notch circles */}
      <div className="absolute top-1/2 -left-2 w-3.5 h-3.5 rounded-full bg-[var(--paper)] border border-[var(--rule)] transform -translate-y-1/2" />
      <div className="absolute top-1/2 -right-2 w-3.5 h-3.5 rounded-full bg-[var(--paper)] border border-[var(--rule)] transform -translate-y-1/2" />

      {/* Header bar */}
      <div className="px-4 py-2 bg-[var(--polar)]/60 border-b border-dashed border-[var(--rule)] flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
        <span className="font-bold tracking-wider text-[var(--green-900)]">{code}</span>
        {badge && <div>{badge}</div>}
      </div>

      {/* Fields Strip */}
      <div
        className="grid divide-x divide-dashed divide-[var(--rule)] py-2.5 px-4"
        style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}
      >
        {fields.map((field, idx) => (
          <div key={idx} className={`px-2 text-center min-w-0 ${idx === 0 ? 'pl-0 text-left' : ''} ${idx === fields.length - 1 ? 'pr-0 text-right' : ''}`}>
            <span className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] block font-semibold">
              {field.label}
            </span>
            <span className="text-xs font-bold text-[var(--green-900)] block truncate mt-0.5">
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
