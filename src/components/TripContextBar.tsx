import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  PackageCheck,
  Route,
  Receipt,
  UserPlus,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { PackPalIcon } from '@/components/PackPalIcon';

interface TripContextBarProps {
  tripId: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
}

export function TripContextBar({
  tripId,
  destination,
  startDate,
  endDate,
  durationDays,
}: TripContextBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { label: 'Overview', href: `/trips/${tripId}`, icon: LayoutDashboard },
    { label: 'Packing', href: `/trips/${tripId}/packing`, icon: PackageCheck },
    { label: 'Itinerary', href: `/trips/${tripId}/itinerary`, icon: Route },
    { label: 'Travelers', href: `/trips/${tripId}/members`, icon: UserPlus },
    { label: 'TripSplit', href: `/trips/${tripId}/expenses`, icon: Receipt, secondary: true },
  ];

  return (
    <div className="bg-[var(--paper)] border-b border-[var(--rule)] sticky top-0 z-30 shadow-none">
      {/* Upper Context Bar */}
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between border-b border-[var(--rule)]/60 text-xs min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--ink-muted)] min-w-0 flex-wrap">
          <PackPalIcon size={20} />
          <button
            onClick={() => router.push('/trips')}
            className="flex items-center gap-1 font-semibold text-[var(--green-900)] hover:underline shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Trips</span>
          </button>
          <span>/</span>
          <span className="font-bold text-[var(--green-900)] truncate max-w-[130px] sm:max-w-xs" title={destination}>
            {destination}
          </span>
          {(startDate || durationDays) && (
            <>
              <span className="text-[var(--rule)]">·</span>
              <span className="font-mono text-[11px] shrink-0">
                {durationDays ? `${durationDays}d` : ''} {startDate && endDate ? `(${startDate} → ${endDate})` : ''}
              </span>
            </>
          )}
        </div>

        {/* Small route marker */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-[var(--emerald-ink)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-900)]" />
          <span className="w-6 border-t border-dashed border-[var(--emerald-ink)]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)]" />
          <span className="font-semibold uppercase tracking-wider ml-1">TRIP CONTEXT</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-6 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--green-900)] text-white'
                  : 'text-[var(--ink-muted)] hover:text-[var(--green-900)] hover:bg-[var(--polar)]'
              } ${item.secondary ? 'opacity-85' : ''}`}
            >
              <Icon size={14} className={isActive ? 'text-[var(--emerald)]' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
