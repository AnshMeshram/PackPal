import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface PackPalInsightProps {
  title?: string;
  source?: string;
  quote: string;
  actionLabel?: string;
  dismissLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PackPalInsight({
  title = 'PackPal Travel Insight',
  source = 'Gemma 2 · Weather-Aware',
  quote,
  actionLabel,
  dismissLabel = 'Dismiss',
  onAction,
  onDismiss,
  className = '',
}: PackPalInsightProps) {
  return (
    <div
      className={`rounded-[12px] bg-white border border-[var(--rule)] border-l-4 border-l-[var(--cream)] p-4 space-y-3 ${className}`}
      style={{ borderLeftColor: 'var(--cream)' }}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center">
            <Compass size={14} />
          </div>
          <span className="font-bold text-[var(--green-900)] text-[12px]">{title}</span>
        </div>
        <span className="font-mono text-[10px] text-[var(--ink-muted)] px-2 py-0.5 rounded-[4px] bg-[var(--paper)] border border-[var(--rule)]">
          {source}
        </span>
      </div>

      <blockquote
        className="text-sm text-[var(--ink)] leading-relaxed italic"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>

      {(onAction || onDismiss) && (
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--rule)]">
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="btn btn-primary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              <span>{actionLabel}</span>
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="btn btn-secondary text-xs font-semibold px-3 py-1.5"
            >
              {dismissLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
