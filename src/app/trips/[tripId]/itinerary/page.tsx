'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getTrip, updateTrip, generateId } from '@/lib/storage/local';
import { Trip, Activity, ItineraryItem, PackingItem, PackingCategory } from '@/types';
import {
  Plus, Trash2, Calendar, Clock,
  Luggage, X,
} from 'lucide-react';
import { TripContextBar } from '@/components/TripContextBar';

const POPULAR_ACTIVITIES = [
  { name: 'City Walking Tour', cat: 'clothing', gear: 'Comfortable Walking Shoes' },
  { name: 'Beach & Swimming', cat: 'beach', gear: 'Swimwear & Beach Towel' },
  { name: 'Mountain Hiking', cat: 'hiking', gear: 'Hiking Boots & Daypack' },
  { name: 'Fine Dining / Sunset Dinner', cat: 'clothing', gear: 'Evening Casuals' },
  { name: 'Museum & Heritage Tour', cat: 'documents', gear: 'ID Card & Daypack' },
  { name: 'Photography Excursion', cat: 'electronics', gear: 'Camera & Power Bank' },
  { name: 'Water Sports / Kayaking', cat: 'gear', gear: 'Dry Bag & Waterproof Pouch' },
];

export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityTime, setActivityTime] = useState('10:00');
  const [activityNotes, setActivityNotes] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const refreshTrip = useCallback(() => {
    const t = getTrip(tripId);
    setTrip(t);
    if (t) {
      document.title = `Itinerary · PackPal`;
    }
  }, [tripId]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center flex-1 py-32 min-h-screen bg-[var(--paper)]">
        <p className="text-xs text-[var(--ink-muted)]">Loading trip itinerary...</p>
      </div>
    );
  }

  // Initialize or align days with trip duration
  const totalDays = Math.max(1, trip.durationDays || 3);
  const daysList = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Get current day's itinerary item
  const currentItineraryDay = trip.itinerary?.find((d) => d.day === activeDay) || {
    id: `day-${activeDay}`,
    day: activeDay,
    date: trip.startDate,
    activities: [],
  };

  const handleAddActivity = (nameOverride?: string) => {
    const finalName = nameOverride || activityName.trim();
    if (!finalName) return;

    const newActivity: Activity = {
      id: generateId(),
      name: finalName,
      day: activeDay,
      time: activityTime,
      notes: activityNotes.trim() || undefined,
    };

    const existingItinerary = trip.itinerary || [];
    let updatedItinerary: ItineraryItem[];

    const dayIndex = existingItinerary.findIndex((d) => d.day === activeDay);
    if (dayIndex >= 0) {
      updatedItinerary = existingItinerary.map((d, idx) =>
        idx === dayIndex ? { ...d, activities: [...d.activities, newActivity] } : d
      );
    } else {
      updatedItinerary = [
        ...existingItinerary,
        {
          id: generateId(),
          day: activeDay,
          date: trip.startDate,
          activities: [newActivity],
        },
      ];
    }

    const updatedActivities = [...(trip.activities || []), newActivity];

    updateTrip(tripId, {
      itinerary: updatedItinerary,
      activities: updatedActivities,
    });

    setActivityName('');
    setActivityNotes('');
    setShowAddModal(false);
    refreshTrip();
  };

  const handleDeleteActivity = (actId: string) => {
    const existingItinerary = trip.itinerary || [];
    const updatedItinerary = existingItinerary.map((d) => ({
      ...d,
      activities: d.activities.filter((a) => a.id !== actId),
    }));

    const updatedActivities = (trip.activities || []).filter((a) => a.id !== actId);

    updateTrip(tripId, {
      itinerary: updatedItinerary,
      activities: updatedActivities,
    });
    refreshTrip();
  };

  const syncItineraryWithPacking = () => {
    const allActivities = (trip.itinerary || []).flatMap((d) => d.activities);
    const existingNames = new Set(trip.packingItems.map((i) => i.name.toLowerCase()));
    const newItems: PackingItem[] = [];

    allActivities.forEach((act) => {
      const actLower = act.name.toLowerCase();
      POPULAR_ACTIVITIES.forEach((preset) => {
        if (actLower.includes(preset.name.toLowerCase().split(' ')[0])) {
          if (!existingNames.has(preset.gear.toLowerCase())) {
            existingNames.add(preset.gear.toLowerCase());
            newItems.push({
              id: generateId(),
              name: preset.gear,
              category: preset.cat as PackingCategory,
              quantity: 1,
              packed: false,
              essential: true,
              priority: 'essential',
              weightEstimateKg: 0.4,
              source: 'activity',
              reason: `Required for ${act.name}`,
            });
          }
        }
      });
    });

    if (newItems.length > 0) {
      updateTrip(tripId, {
        packingItems: [...trip.packingItems, ...newItems],
      });
      refreshTrip();
      setSyncStatus(`Added ${newItems.length} essential items for your itinerary to your packing list!`);
    } else {
      setSyncStatus('Packing list is already synchronized with your scheduled activities.');
    }

    setTimeout(() => setSyncStatus(null), 4000);
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
              DAILY TRAVEL SCHEDULE · {trip.durationDays} DAYS
            </span>
            <h1 className="text-3xl font-bold text-[var(--green-900)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Your days in {trip.destination}
            </h1>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Travel-journal timeline with start times, location notes, and automated packing sync.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
              onClick={syncItineraryWithPacking}
              title="Automatically sync gear needed for these activities to your packing list"
            >
              <Luggage size={14} />
              <span>Sync to Packing</span>
            </button>
            <button
              className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={15} />
              <span>Add Activity</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="bg-[var(--polar)] border-b border-[var(--rule)] px-6 py-2.5 text-xs font-medium text-[var(--green-900)] text-center">
          {syncStatus}
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {daysList.map((day) => {
            const dayActs = trip.itinerary?.find((d) => d.day === day)?.activities.length || 0;
            const isSelected = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--green-900)] text-white'
                    : 'bg-white text-[var(--ink-muted)] border border-[var(--rule)] hover:border-[var(--green-900)]'
                }`}
              >
                <span>Day {day}</span>
                {dayActs > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-[var(--emerald)] text-[var(--green-900)] font-bold'
                        : 'bg-[var(--polar)] text-[var(--green-900)]'
                    }`}
                  >
                    {dayActs}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Travel-Journal Section Label */}
        <div className="rounded-[12px] bg-white border border-[var(--rule)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center border border-[var(--rule)]">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--emerald-ink)] block">
                DAY {activeDay < 10 ? `0${activeDay}` : activeDay} · {trip.destination.toUpperCase()}
              </span>
              <h2 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Day {activeDay} Itinerary
              </h2>
            </div>
          </div>

          <button
            className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={13} />
            <span>Add Event</span>
          </button>
        </div>

        {/* Activity Timeline List */}
        {currentItineraryDay.activities.length === 0 ? (
          <div className="rounded-[12px] bg-white border border-[var(--rule)] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center mx-auto border border-[var(--rule)]">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                No events scheduled for Day {activeDay}
              </h3>
              <p className="text-xs text-[var(--ink-muted)] max-w-sm mx-auto mt-1">
                Add excursions, tours, or meals to coordinate your route and prepare your packing gear.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--emerald-ink)] font-mono block mb-2">
                QUICK PRESETS
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {POPULAR_ACTIVITIES.map((act) => (
                  <button
                    key={act.name}
                    onClick={() => handleAddActivity(act.name)}
                    className="text-xs px-3 py-1.5 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)] hover:bg-[var(--polar)]/80 cursor-pointer"
                  >
                    + {act.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4">
            {/* Route Line down the left */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 border-l-2 border-dashed border-[var(--rule)]" />

            {currentItineraryDay.activities.map((act, idx) => (
              <div
                key={act.id || idx}
                className="relative flex items-start gap-4 rounded-[12px] bg-white border border-[var(--rule)] p-4 hover:border-[var(--green-900)] transition-colors"
              >
                {/* Timeline Route Node */}
                <div className="absolute -left-[23px] top-5 w-3 h-3 rounded-full bg-[var(--green-900)] border-2 border-white ring-2 ring-[var(--polar)]" />

                {/* Left Column: Time */}
                <div className="min-w-[70px] shrink-0 font-mono text-xs font-bold text-[var(--green-900)]">
                  {act.time || 'All Day'}
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--green-900)] break-words">{act.name}</h3>
                  {act.notes && (
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed break-words">{act.notes}</p>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="p-1.5 text-gray-400 hover:text-[var(--coral)] rounded-[4px] transition-colors shrink-0"
                  title="Remove activity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-[12px] p-5 sm:p-6 border border-[var(--rule)] space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
              <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Add Activity to Day {activeDay}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Scuba Diving at Grand Island"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Start Time</label>
                <input
                  type="time"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  className="input w-full font-mono"
                />
              </div>

              <div>
                <label className="label">Location or Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pre-book ferry tickets, meet at jetty"
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  className="input w-full"
                />
              </div>

              {/* Presets */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block mb-1.5 font-mono">
                  SUGGESTIONS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_ACTIVITIES.slice(0, 4).map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      className="text-[11px] px-2.5 py-1 rounded-[4px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)]"
                      onClick={() => setActivityName(p.name)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
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
                onClick={() => handleAddActivity()}
                disabled={!activityName.trim()}
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
