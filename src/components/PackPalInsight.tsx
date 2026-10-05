import React from 'react';
import { Compass, BookmarkCheck } from 'lucide-react';

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
  title = 'Field Guide Dispatch',
  source = 'Expedition Wisdom',
  quote,
  actionLabel,
  dismissLabel = 'Dismiss',
  onAction,
  onDismiss,
  className = '',
}: PackPalInsightProps) {
  return (
    <div
      className={`rounded-[12px] bg-white border border-[var(--rule)] border-l-4 p-4 space-y-3 shadow-xs ${className}`}
      style={{ borderLeftColor: 'var(--emerald-ink)' }}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[4px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center border border-[var(--emerald-ink)]/20">
            <Compass size={14} />
          </div>
          <span className="font-bold text-[var(--green-900)] text-[12px] uppercase tracking-wide font-mono">
            {title}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[var(--emerald-ink)] font-bold px-2 py-0.5 rounded-[4px] bg-[var(--paper)] border border-[var(--rule)] uppercase tracking-wider">
          {source}
        </span>
      </div>

      <blockquote
        className="text-sm text-[var(--ink)] leading-relaxed italic border-l-2 border-[var(--rule)] pl-3 my-1"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>

      {(onAction || onDismiss) && (
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--rule)]">
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="btn btn-primary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
            >
              <BookmarkCheck size={13} />
              <span>{actionLabel}</span>
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="btn btn-secondary text-xs font-semibold px-3 py-1.5 cursor-pointer"
            >
              {dismissLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

