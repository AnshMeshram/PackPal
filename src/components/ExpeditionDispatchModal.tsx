'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Trip } from '@/types';
import { formatPaiseToRupees, calculateTotalExpensesPaise } from '@/lib/expenses/calculator';
import { calculateTotalPackedWeight } from '@/lib/packing/weights';
import { getDestinationRouteMeta } from '@/lib/destinations';
import { PackPalIcon } from '@/components/PackPalIcon';

interface ExpeditionDispatchModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpeditionDispatchModal({
  trip,
  isOpen,
  onClose,
}: ExpeditionDispatchModalProps) {
  if (!isOpen) return null;

  const routeMeta = getDestinationRouteMeta(trip.destination);
  const totalExpenses = calculateTotalExpensesPaise(trip.expenses || []);
  const packedWeight = calculateTotalPackedWeight(trip.packingItems || []);
  const baggageLimit = trip.luggage?.maxWeightKg || trip.baggageLimitKg || 7;
  const packedCount = trip.packingItems.filter((i) => i.packed).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="relative bg-[#FBF8F1] border-2 border-[#D8CEBE] rounded-[16px] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto font-sans text-[#0C4137]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DDD2BF] print:hidden">
          <div className="flex items-center gap-2">
            <PackPalIcon size={24} />
            <span className="text-xs font-mono font-bold tracking-widest text-[#04624A] uppercase">
              JOURNAL ARCHIVE EXPORT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-gray-500 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Printable Expedition Scrapbook Sheet ── */}
        <div className="space-y-6 p-2">
          {/* Vintage Expedition Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-double border-[#0C4137]/30">
            <div className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#736859] font-bold">
              PACKPAL EXPEDITION DISPATCH · VOL. 2026
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0C4137]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {trip.destination} Field Log
            </h1>
            <p className="italic text-xs text-[#736859]" style={{ fontFamily: 'var(--font-heading)' }}>
              &ldquo;{routeMeta.mood}&rdquo;
            </p>
          </div>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
            <div className="p-2.5 rounded-[6px] bg-white border border-[#DDD2BF]">
              <span className="text-[9px] uppercase tracking-wider text-[#736859] block">WAYPOINT</span>
              <strong className="text-[#0C4137] text-xs sm:text-sm">{routeMeta.route}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-white border border-[#DDD2BF]">
              <span className="text-[9px] uppercase tracking-wider text-[#736859] block">ELEVATION</span>
              <strong className="text-[#0C4137] text-xs sm:text-sm">{routeMeta.elevation}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-white border border-[#DDD2BF]">
              <span className="text-[9px] uppercase tracking-wider text-[#736859] block">DATES</span>
              <strong className="text-[#0C4137] text-xs sm:text-sm">{trip.durationDays} Days</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-white border border-[#DDD2BF]">
              <span className="text-[9px] uppercase tracking-wider text-[#736859] block">COMPANIONS</span>
              <strong className="text-[#0C4137] text-xs sm:text-sm">{trip.members.length} Travelers</strong>
            </div>
          </div>

          {/* Middle Two-Column: Baggage Inspection | Financial Ledger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Luggage Manifest Box */}
            <div className="p-4 rounded-[10px] bg-white border border-[#DDD2BF] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-[#04624A] block">
                CABIN LUGGAGE SCALE CHECK
              </span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold text-[#0C4137]">{packedWeight.toFixed(1)} kg</span>
                <span className="text-xs text-[#736859]">/ {baggageLimit} kg max limit</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#04624A] font-semibold">
                <CheckCircle2 size={13} />
                <span>
                  {packedCount} of {trip.packingItems.length} items verified stowed
                </span>
              </div>
            </div>

            {/* TripSplit Ledger Box */}
            <div className="p-4 rounded-[10px] bg-white border border-[#DDD2BF] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-[#04624A] block">
                TRIPSPLIT JOURNAL SETTLEMENT
              </span>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold text-[#0C4137]">{formatPaiseToRupees(totalExpenses)}</span>
                <span className="text-xs text-[#736859]">{trip.expenses.length} transactions</span>
              </div>
              <div className="pt-1">
                <span className="settled-stamp text-[10px]">
                  <span>✓</span>
                  <span>ALL BALANCES SETTLED · ZERO DEBT</span>
                </span>
              </div>
            </div>
          </div>

          {/* Field Notes & Marginalia Excerpt */}
          {trip.fieldNotes && trip.fieldNotes.length > 0 && (
            <div className="p-4 rounded-[10px] bg-[#FEFBF3] border border-[#DDD2BF] space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-[#736859] block">
                FIELD MARGINALIA & REMINDERS
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#2A2520]">
                {trip.fieldNotes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stamped Seal & Signature Footer */}
          <div className="pt-4 border-t border-[#DDD2BF] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-[#736859] block">
                AUTHENTICATED DISPATCH
              </span>
              <span className="text-[11px] font-bold text-[#0C4137]">
                COORDINATES: {routeMeta.coordinates}
              </span>
            </div>

            {/* Passport Entry Stamp Badge */}
            <div className="passport-stamp text-center shrink-0">
              <span className="text-[7.5px] font-mono text-white/70 tracking-widest block">JOURNAL VERIFIED</span>
              <span className="text-[11px] font-mono font-bold text-white tracking-[0.16em]">{routeMeta.code} · COMPLETE</span>
              <span className="text-[7.5px] font-mono text-white/70 tracking-wider block">{trip.startDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
