'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTrip, updateTrip, generateId } from '@/lib/storage/local';
import { Trip, Member } from '@/types';
import { calculateBalances, formatPaiseToRupees } from '@/lib/expenses/calculator';
import {
  Plus, Trash2, Utensils,
  Shirt, X,
} from 'lucide-react';
import { TripContextBar } from '@/components/TripContextBar';

export default function MembersPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const refreshTrip = useCallback(() => {
    const t = getTrip(tripId);
    setTrip(t);
    if (t) {
      document.title = `Travelers · PackPal`;
    }
  }, [tripId]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center flex-1 py-32 min-h-screen bg-[var(--paper)]">
        <p className="text-xs text-[var(--ink-muted)]">Loading travelers...</p>
      </div>
    );
  }

  const memberNames = trip.members.map((m) => m.name);
  const balances = calculateBalances(trip.expenses || [], memberNames);

  const handleAddMember = () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (trip.members.some((m) => m.name.toLowerCase() === cleanName.toLowerCase())) {
      setError(`A traveler named "${cleanName}" already exists.`);
      return;
    }

    const newMember: Member = {
      id: generateId(),
      name: cleanName,
      preferences: {
        dietary: dietary ? dietary.split(',').map((s) => s.trim()).filter(Boolean) : [],
        notes: notes.trim() || undefined,
      },
    };

    updateTrip(tripId, {
      members: [...trip.members, newMember],
    });

    setName('');
    setDietary('');
    setNotes('');
    setError(null);
    setShowAddModal(false);
    refreshTrip();
  };

  const handleRemoveMember = (member: Member) => {
    const hasExpenses = (trip.expenses || []).some(
      (e) => e.paidBy === member.name || e.participants.includes(member.name)
    );

    if (hasExpenses) {
      alert(`Cannot remove ${member.name} because they are part of recorded TripSplit expenses. Settle or adjust those expenses first.`);
      return;
    }

    if (trip.members.length <= 1) {
      alert('A trip must have at least one traveler.');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${member.name} from this trip?`)) {
      return;
    }

    updateTrip(tripId, {
      members: trip.members.filter((m) => m.id !== member.id),
    });
    refreshTrip();
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
            <span className="text-[10px] font-bold tracking-widest text-[var(--emerald-ink)] uppercase font-mono block mb-1">
              TRAVEL COMPANIONS · {trip.members.length} MEMBERS
            </span>
            <h1 className="text-3xl font-bold text-[var(--green-900)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Who&apos;s coming
            </h1>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Travel companions, dietary preferences, assigned gear, and current TripSplit balances.
            </p>
          </div>

          <button
            className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
            onClick={() => {
              setError(null);
              setShowAddModal(true);
            }}
          >
            <Plus size={15} />
            <span>Add Traveler</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Travelers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trip.members.map((member, idx) => {
            const memberBalance = balances.find((b) => b.memberName === member.name)?.balancePaise || 0;
            const itemsCount = trip.packingItems.filter((i) => i.owner === member.name).length;

            return (
              <div
                key={member.id || idx}
                className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-4 flex flex-col justify-between hover:border-[var(--green-900)] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[var(--polar)] border border-[var(--rule)] text-[var(--green-900)] font-bold flex items-center justify-center text-sm font-mono">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <h3 className="font-bold text-base text-[var(--green-900)] truncate max-w-[150px] sm:max-w-xs">{member.name}</h3>
                          {idx === 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--cream)] text-[var(--green-900)] font-bold border border-[var(--rule)] font-mono shrink-0">
                              Trip Lead
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--ink-muted)] truncate">
                          {itemsCount > 0 ? `${itemsCount} assigned packing items` : 'Shared packing checklist'}
                        </p>
                      </div>
                    </div>

                    {idx !== 0 && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="p-1.5 text-gray-400 hover:text-[var(--coral)] rounded-[4px] transition-colors shrink-0"
                        title="Remove traveler"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Preferences Box */}
                  <div className="mt-4 p-3 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Utensils size={13} className="text-[var(--emerald-ink)] shrink-0" />
                      <span className="break-words min-w-0">
                        <strong className="text-[var(--green-900)]">Dietary:</strong>{' '}
                        {member.preferences?.dietary && member.preferences.dietary.length > 0
                          ? member.preferences.dietary.join(', ')
                          : 'None recorded'}
                      </span>
                    </div>
                    {member.preferences?.notes && (
                      <div className="flex items-center gap-2">
                        <Shirt size={13} className="text-[var(--emerald-ink)] shrink-0" />
                        <span className="break-words min-w-0">
                          <strong className="text-[var(--green-900)]">Notes:</strong> {member.preferences.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Balance */}
                <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--ink-muted)]">TripSplit Balance:</span>
                  <span
                    className={`font-bold ${
                      memberBalance > 0
                        ? 'text-[var(--emerald-ink)]'
                        : memberBalance < 0
                        ? 'text-[var(--coral)]'
                        : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    {memberBalance > 0 ? '+' : ''}
                    {formatPaiseToRupees(memberBalance)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Traveler Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-[12px] p-5 sm:p-6 border border-[var(--rule)] space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
              <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Add Travel Companion
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-[6px] bg-[rgba(249,102,53,0.1)] border border-[var(--coral)] text-xs text-[var(--coral)]">
                {error}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Aman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Dietary Preferences (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, Gluten-Free"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="label">Packing / Luggage Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Carries first-aid kit, packs light"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button
                className="btn btn-secondary text-xs px-3 py-1.5"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-1.5"
                onClick={handleAddMember}
                disabled={!name.trim()}
              >
                Add Traveler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
