'use client';

import React, { useState } from 'react';
import { Expense } from '@/types';
import { formatPaiseToRupees } from '@/lib/expenses/calculator';
import { Receipt, Scissors, Trash2, CheckCircle2 } from 'lucide-react';

interface ExpenseBillfoldProps {
  expenses: Expense[];
  totalExpensesPaise: number;
  settled?: boolean;
  onDeleteExpense?: (id: string) => void;
  onAddClick?: () => void;
}

export function ExpenseBillfold({
  expenses,
  totalExpensesPaise,
  settled = false,
  onDeleteExpense,
  onAddClick,
}: ExpenseBillfoldProps) {
  const [viewMode, setViewMode] = useState<'receipt' | 'ledger'>('receipt');

  return (
    <div className="rounded-[14px] bg-[#2E2017] border-2 border-[#543D2B] p-4 sm:p-6 shadow-xl relative overflow-hidden text-[#EADBCE]">
      {/* Brass Corner Guards */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none" />

      {/* Perimeter Saddle Stitching */}
      <div className="absolute inset-2 border border-dashed border-[#8D6E53]/40 rounded-[10px] pointer-events-none" />

      {/* Billfold Header & Brass Money Clip */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#4A3525]">
        <div className="flex items-center gap-2.5">
          {/* Embossed Money Clip */}
          <div className="w-8 h-8 rounded-sm bg-gradient-to-b from-[#E7C970] via-[#C99E32] to-[#8C6D1F] border border-[#523F1C] shadow-md flex items-center justify-center text-[#2A1E0E]">
            <Receipt size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#D4AF37] uppercase block">
              TRAVELER&rsquo;S LEATHER BILLFOLD & POCKET LEDGER
            </span>
            <h3 className="text-sm font-bold text-[#F4ECE1]" style={{ fontFamily: 'var(--font-heading)' }}>
              Physical Expense Vouchers
            </h3>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#1E140D] p-1 rounded border border-[#4A3525] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('receipt')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
              viewMode === 'receipt' ? 'bg-[#D4AF37] text-[#2E2017]' : 'text-[#A89484] hover:text-[#FAF7EE]'
            }`}
          >
            THERMAL RECEIPT TAPE
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ledger')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
              viewMode === 'ledger' ? 'bg-[#D4AF37] text-[#2E2017]' : 'text-[#A89484] hover:text-[#FAF7EE]'
            }`}
          >
            BIFOLD LEDGER
          </button>
        </div>
      </div>

      {/* Mode 1: Thermal Receipt Paper Tape */}
      {viewMode === 'receipt' ? (
        <div className="max-w-md mx-auto relative my-2">
          {/* Jagged Serrated Tear Edge at Top */}
          <div className="h-2 w-full bg-[#FBF9F3] relative overflow-hidden flex">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#2E2017]"
              />
            ))}
          </div>

          {/* Receipt Body */}
          <div className="bg-[#FAF7EE] text-[#1E2522] p-6 shadow-2xl font-mono text-xs space-y-4 border-x border-[#DDD6C6]">
            {/* Header Stamp */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#888]">
              <span className="text-[12px] font-bold tracking-[0.25em] block">
                *** PACKPAL EXPEDITION VOUCHER ***
              </span>
              <p className="text-[10px] text-[#555]">
                TRAVEL SETTLEMENT REGISTER · FISCAL REC-094
              </p>
              <div className="flex justify-between text-[9px] text-[#666] pt-1">
                <span>DATE: {new Date().toISOString().split('T')[0]}</span>
                <span>STATUS: {settled ? 'BALANCED' : 'OPEN RECORD'}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-[10px] font-bold text-[#444] border-b border-[#CCC] pb-1">
                <span>ITEM / DESCRIPTION</span>
                <span>PAID (INR)</span>
              </div>

              {expenses.length === 0 ? (
                <div className="py-6 text-center text-[#777] italic text-[11px]">
                  No printed receipts in billfold.
                </div>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="flex items-start justify-between gap-2 py-1 border-b border-dashed border-[#E5E0D5]">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[11px] truncate">{exp.description}</div>
                      <div className="text-[9px] text-[#666] flex items-center gap-1.5 mt-0.5">
                        <span className="bg-[#EBE5D8] px-1 py-0.2 rounded font-semibold text-[#333]">
                          BY {exp.paidBy.toUpperCase()}
                        </span>
                        <span>·</span>
                        <span>SPLIT {exp.participants.length}x</span>
                        <span>·</span>
                        <span className="italic">{exp.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[12px]">
                        {formatPaiseToRupees(exp.amountPaise)}
                      </span>
                      {onDeleteExpense && (
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-[#999] hover:text-[#C0392B] p-0.5 transition-colors cursor-pointer"
                          title="Tear receipt from billfold"
                        >
                          <Scissors size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Block */}
            <div className="pt-2 border-t-2 border-dashed border-[#444] space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#555]">
                <span>TOTAL VOUCHER ENTRIES:</span>
                <span>{expenses.length}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#111] pt-1 border-t border-[#888]">
                <span>TOTAL SETTLEMENT:</span>
                <span>{formatPaiseToRupees(totalExpensesPaise)}</span>
              </div>
            </div>

            {/* Vintage Rubber Stamp Overlay */}
            <div className="pt-3 pb-1 flex justify-center">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 rounded-sm uppercase font-mono font-bold tracking-[0.18em] text-[10px] transform -rotate-2 ${
                  settled
                    ? 'border-[#27AE60] text-[#27AE60] bg-[#E8F8F0]'
                    : 'border-[#C0392B] text-[#C0392B] bg-[#FDEDEC]'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>{settled ? 'SETTLED & SQUARED' : 'ACCUMULATING DEBTS'}</span>
              </div>
            </div>

            {/* Receipt Footer Barcode Simulation */}
            <div className="text-center pt-2 border-t border-dashed border-[#888]">
              <div className="h-6 w-48 mx-auto flex items-center justify-between opacity-70">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111] h-full"
                    style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                  />
                ))}
              </div>
              <span className="text-[8px] tracking-[0.3em] text-[#666] block mt-1">
                *TRIPSPLIT-AUTHENTIC-LEDGER*
              </span>
            </div>
          </div>

          {/* Jagged Serrated Tear Edge at Bottom */}
          <div className="h-2 w-full bg-[#FAF7EE] relative overflow-hidden flex rotate-180">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#2E2017]"
              />
            ))}
          </div>
        </div>
      ) : (
        /* Mode 2: Leather Ledger Table */
        <div className="rounded-[8px] bg-[#1E140D] border border-[#4A3525] p-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#4A3525] text-[10px] font-bold text-[#D4AF37]">
            <span>ACCOUNTING LOG ({expenses.length})</span>
            <span>TOTAL: {formatPaiseToRupees(totalExpensesPaise)}</span>
          </div>

          <div className="divide-y divide-[#3A2A1E] mt-2">
            {expenses.length === 0 ? (
              <p className="text-center text-[#8D6E53] py-4">No entries recorded in travel ledger.</p>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-bold text-[#FAF7EE] block truncate">{exp.description}</span>
                    <span className="text-[10px] text-[#A89484]">
                      Paid by {exp.paidBy} · {exp.category} · {exp.participants.length} split
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[#D4AF37] text-sm">
                      {formatPaiseToRupees(exp.amountPaise)}
                    </span>
                    {onDeleteExpense && (
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(exp.id)}
                        className="text-[#8D6E53] hover:text-[#E74C3C] transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Billfold Bottom Action Strip */}
      {onAddClick && (
        <div className="mt-4 pt-3 border-t border-[#4A3525] flex justify-end">
          <button
            type="button"
            onClick={onAddClick}
            className="text-xs font-bold font-mono px-3 py-1.5 rounded bg-[#D4AF37] text-[#2A1E0E] hover:bg-[#E7C970] transition-colors cursor-pointer"
          >
            + CLIP NEW EXPENSE RECEIPT
          </button>
        </div>
      )}
    </div>
  );
}
