'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTrip, updateTrip, generateId } from '@/lib/storage/local';
import { Trip, Expense } from '@/types';
import { calculateBalances, calculateTotalExpensesPaise, formatPaiseToRupees, calculateEqualSharePaise } from '@/lib/expenses/calculator';
import { computeSettlements } from '@/lib/expenses/settlement';
import {
  Plus, Trash2, Loader2,
  MessageSquare, Check, X, AlertTriangle, Receipt,
} from 'lucide-react';

import { TripContextBar } from '@/components/TripContextBar';
import { ExpenseBillfold } from '@/components/ExpenseBillfold';


export default function ExpensesPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [showNL, setShowNL] = useState(false);
  const [nlText, setNlText] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResult, setNlResult] = useState<{description: string; amount: number; paidBy: string; participants: string[]; splitMethod: string; missingInfo?: string[]} | null>(null);
  const [error, setError] = useState('');

  // Manual form
  const [mDesc, setMDesc] = useState('');
  const [mAmount, setMAmount] = useState('');
  const [mPaidBy, setMPaidBy] = useState('');
  const [mParticipants, setMParticipants] = useState<string[]>([]);
  const [mCategory, setMCategory] = useState('General');

  const refreshTrip = useCallback(() => {
    const t = getTrip(tripId);
    setTrip(t);
    if (t) {
      document.title = `TripSplit · PackPal`;
    }
  }, [tripId]);

  useEffect(() => { refreshTrip(); }, [refreshTrip]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center flex-1 py-32 min-h-screen bg-[var(--paper)]">
        <p className="text-xs text-[var(--ink-muted)]">Loading TripSplit...</p>
      </div>
    );
  }

  const memberNames = trip.members.map((m) => m.name);
  const balances = calculateBalances(trip.expenses, memberNames);
  const settlements = computeSettlements(balances);
  const totalExpenses = calculateTotalExpensesPaise(trip.expenses);

  const saveExpenses = (exps: Expense[]) => {
    updateTrip(tripId, { expenses: exps });
    refreshTrip();
  };

  const deleteExpense = (id: string) => {
    saveExpenses(trip.expenses.filter((e) => e.id !== id));
  };

  const addManualExpense = () => {
    if (!mDesc.trim() || !mAmount || !mPaidBy || mParticipants.length === 0) {
      setError('Fill in all required fields.');
      return;
    }
    const amountNum = parseFloat(mAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (!memberNames.includes(mPaidBy)) {
      setError('Payer must be a trip member.');
      return;
    }
    const exp: Expense = {
      id: generateId(),
      description: mDesc.trim(),
      amountPaise: Math.round(amountNum * 100),
      paidBy: mPaidBy,
      participants: mParticipants,
      category: mCategory,
      splitMethod: 'equal',
      timestamp: new Date().toISOString(),
    };
    saveExpenses([...trip.expenses, exp]);
    setMDesc(''); setMAmount(''); setMPaidBy(''); setMParticipants([]); setShowManual(false); setError('');
  };

  const handleNLSubmit = async () => {
    if (!nlText.trim()) return;
    setNlLoading(true);
    setNlResult(null);
    setError('');
    try {
      const res = await fetch('/api/ai/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlText, memberNames }),
      });
      const data = await res.json();
      if (data.extraction) {
        setNlResult(data.extraction);
      } else {
        setError(data.error || 'Could not parse the expense.');
      }
    } catch {
      setError('Service is currently unavailable. Try entering manually or check local Ollama.');
    } finally {
      setNlLoading(false);
    }
  };

  const confirmNLExpense = () => {
    if (!nlResult) return;
    const exp: Expense = {
      id: generateId(),
      description: nlResult.description,
      amountPaise: Math.round(nlResult.amount * 100),
      paidBy: nlResult.paidBy,
      participants: nlResult.participants,
      category: 'General',
      splitMethod: nlResult.splitMethod as 'equal' | 'custom',
      timestamp: new Date().toISOString(),
    };
    saveExpenses([...trip.expenses, exp]);
    setNlResult(null);
    setNlText('');
    setShowNL(false);
  };

  const toggleParticipant = (name: string) => {
    setMParticipants((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-16">
      {/* Sticky Trip Context Bar */}
      <TripContextBar
        tripId={tripId}
        destination={trip.destination}
        startDate={trip.startDate}
        endDate={trip.endDate}
        durationDays={trip.durationDays}
      />

      {/* ── Page Header ── */}
      <header className="px-6 py-6 border-b border-[var(--rule)] bg-[var(--paper)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--emerald-ink)] uppercase font-mono block mb-1">
              TRIPSPLIT · EXACT PAISE ENGINE
            </span>
            <h1 className="text-3xl font-bold text-[var(--green-900)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Who owes what
            </h1>
            <p className="text-sm italic text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              &ldquo;Fair shares, clean ledgers, and zero debt ambiguity.&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-primary text-xs font-bold px-3.5 py-2 flex items-center gap-1.5"
              onClick={() => {
                setShowNL(!showNL);
                setShowManual(false);
              }}
            >
              <MessageSquare size={14} />
              <span>Read this expense</span>
            </button>
            <button
              className="btn btn-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
              onClick={() => {
                setShowManual(!showManual);
                setShowNL(false);
              }}
            >
              <Plus size={14} />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)] block">
              TOTAL GROUP EXPENSES
            </span>
            <p className="text-2xl font-bold font-mono text-[var(--green-900)] mt-1">
              {formatPaiseToRupees(totalExpenses)}
            </p>
          </div>

          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)] block">
              TRAVELERS
            </span>
            <p className="text-2xl font-bold font-mono text-[var(--green-900)] mt-1">
              {memberNames.length}
            </p>
          </div>

          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-4 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--ink-muted)] block">
              RECORDED TRANSACTIONS
            </span>
            <p className="text-2xl font-bold font-mono text-[var(--green-900)] mt-1">
              {trip.expenses?.length || 0}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-[6px] bg-[rgba(249,102,53,0.1)] border border-[var(--coral)] text-xs text-[var(--coral)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

        {/* Natural Language Expense Box */}
        {showNL && (
          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--green-900)]">
              <Receipt size={14} className="text-[var(--emerald-ink)]" />
              <span>What was paid?</span>
            </div>
            <textarea
              className="input w-full text-xs"
              rows={2}
              placeholder="e.g. Rahul paid ₹2400 for dinner for everyone"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-secondary text-xs px-3 py-1.5"
                onClick={() => setShowNL(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-1.5 flex items-center gap-1.5"
                onClick={handleNLSubmit}
                disabled={nlLoading || !nlText.trim()}
              >
                {nlLoading ? <Loader2 size={13} className="animate-spin" /> : <Receipt size={13} />}
                <span>{nlLoading ? 'Reading...' : 'Read this expense'}</span>
              </button>
            </div>
          </div>
        )}

        {/* NL Result Preview */}
        {nlResult && (
          <div className="rounded-[12px] bg-white border border-[var(--emerald-ink)]/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--green-900)]">
              <Receipt size={14} className="text-[var(--emerald-ink)]" />
              <span>I understood this as…</span>
            </div>


            <div className="p-3.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] space-y-1.5 text-xs">
              <p className="text-sm font-bold text-[var(--green-900)]">{nlResult.description}</p>
              <p className="text-xl font-bold font-mono text-[var(--green-900)]">{formatPaiseToRupees(Math.round(nlResult.amount * 100))}</p>
              <p><span className="text-[var(--ink-muted)]">Paid by:</span> <strong>{nlResult.paidBy}</strong></p>
              <p><span className="text-[var(--ink-muted)]">Participants:</span> {nlResult.participants.join(', ')}</p>
              <p>
                <span className="text-[var(--ink-muted)]">Split:</span>{' '}
                {nlResult.splitMethod === 'equal'
                  ? `Equal — ${formatPaiseToRupees(calculateEqualSharePaise(Math.round(nlResult.amount * 100), nlResult.participants.length))} each`
                  : 'Custom'}
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={() => setNlResult(null)}>
                Cancel
              </button>
              <button className="btn btn-primary text-xs font-bold px-4 py-1.5 flex items-center gap-1.5" onClick={confirmNLExpense}>
                <Check size={14} />
                <span>Confirm Expense</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Expense Form */}
        {showManual && (
          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[var(--green-900)]">Record Expense</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="Description (e.g. Dinner, Beach Cab, Villa)"
                value={mDesc}
                onChange={(e) => setMDesc(e.target.value)}
              />
              <input
                className="input"
                placeholder="Category (e.g. Food, Transport, Hotel)"
                value={mCategory}
                onChange={(e) => setMCategory(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="input font-mono"
                type="number"
                placeholder="Amount in Rupees (₹)"
                min={0}
                step={0.01}
                value={mAmount}
                onChange={(e) => setMAmount(e.target.value)}
              />
              <div>
                <select
                  className="input w-full"
                  value={mPaidBy}
                  onChange={(e) => setMPaidBy(e.target.value)}
                >
                  <option value="">Who paid?</option>
                  {memberNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Participants (Split Equally)</label>
              <div className="flex flex-wrap gap-1.5">
                {memberNames.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`text-xs px-3 py-1.5 rounded-[6px] border transition-colors ${
                      mParticipants.includes(n)
                        ? 'bg-[var(--green-900)] text-white border-[var(--green-900)]'
                        : 'bg-white border-[var(--rule)] text-[var(--ink)]'
                    }`}
                    onClick={() => toggleParticipant(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--rule)]">
              <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={() => setShowManual(false)}>
                Cancel
              </button>
              <button className="btn btn-primary text-xs font-bold px-4 py-1.5" onClick={addManualExpense}>
                Save Expense
              </button>
            </div>
          </div>
        )}

        {/* Balances & Settlement Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Balances */}
          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[var(--emerald-ink)] block">
              INDIVIDUAL BALANCES
            </span>
            <div className="divide-y divide-[var(--rule)]">
              {balances.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)] py-3">No members recorded.</p>
              ) : (
                balances.map((b) => (
                  <div key={b.memberName} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[var(--green-900)]">{b.memberName}</span>
                    <span
                      className={`font-bold ${
                        b.balancePaise > 0
                          ? 'text-[var(--emerald-ink)]'
                          : b.balancePaise < 0
                          ? 'text-[var(--coral)]'
                          : 'text-[var(--ink-muted)]'
                      }`}
                    >
                      {b.balancePaise > 0 ? `+${formatPaiseToRupees(b.balancePaise)}` : formatPaiseToRupees(b.balancePaise)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settlement Plan */}
          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-[0.16em] font-bold text-[var(--emerald-ink)] block">
              MINIMIZED SETTLEMENT PLAN
            </span>
            <div className="divide-y divide-[var(--rule)]">
              {settlements.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div className="settled-stamp">
                    <span>✓</span>
                    <span>ALL BALANCES SETTLED · ZERO DEBT</span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] max-w-xs">
                    All expenses and debts are completely squared away. No peer-to-peer transfers required.
                  </p>
                </div>
              ) : (
                settlements.map((s, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 break-words">
                      <strong className="text-[var(--green-900)]">{s.from}</strong>
                      <span className="text-[var(--ink-muted)]"> pays </span>
                      <strong className="text-[var(--green-900)]">{s.to}</strong>
                    </div>
                    <span className="font-bold font-mono text-[var(--green-900)] shrink-0">
                      {formatPaiseToRupees(s.amountPaise)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Anti-AI Physical Leather Billfold & Thermal Receipt Tape */}
        <ExpenseBillfold
          expenses={trip.expenses}
          totalExpensesPaise={totalExpenses}
          settled={settlements.length === 0 && trip.expenses.length > 0}
          onDeleteExpense={deleteExpense}
          onAddClick={() => {
            setShowManual(true);
            setShowNL(false);
          }}
        />

        {/* Journal Entries List */}
        <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[var(--emerald-ink)] block">
            EXPENSE JOURNAL LINES ({trip.expenses?.length || 0})
          </span>


          <div className="divide-y divide-[var(--rule)]">
            {(trip.expenses || []).length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)] py-4 text-center">
                No expenses logged yet. Click &ldquo;Read this expense&rdquo; or &ldquo;Add Manually&rdquo; to start.
              </p>
            ) : (
              trip.expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3 sm:gap-4 text-xs">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[var(--green-900)] break-words">{exp.description}</h4>
                    <p className="text-[11px] text-[var(--ink-muted)] mt-0.5 break-words">
                      {exp.paidBy} paid · Split with {exp.participants.length} travelers · {exp.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <span className="font-bold font-mono text-sm text-[var(--green-900)]">
                      {formatPaiseToRupees(exp.amountPaise)}
                    </span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 text-gray-400 hover:text-[var(--coral)] rounded-[4px] transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
