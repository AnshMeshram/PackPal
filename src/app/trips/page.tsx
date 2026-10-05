'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTrips, saveTrip, deleteTrip, generateId } from '@/lib/storage/local';
import { Trip } from '@/types';
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Copy,
  Luggage,
  ArrowRight,
  Route,
} from 'lucide-react';
import { resolveDestination } from '@/lib/destinations';
import { EmptyState } from '@/components/EmptyState';
import { calculateTotalPackedWeight } from '@/lib/packing/weights';

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = () => {
    setTrips(getTrips());
  };

  useEffect(() => {
    document.title = 'My Trips · PackPal';
    loadTrips();
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? All packing lists and expense records for this trip will be removed.`)) {
      deleteTrip(id);
      loadTrips();
    }
  };

  const handleDuplicate = (trip: Trip) => {
    const cloned: Trip = {
      ...trip,
      id: generateId(),
      name: `${trip.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTrip(cloned);
    loadTrips();
  };

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-16">
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper)]/95 sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <button
            className="btn btn-ghost btn-sm p-1.5 text-[var(--green-900)] hover:bg-[var(--polar)] rounded-[6px]"
            onClick={() => router.push('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1
              className="text-xl font-bold text-[var(--green-900)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              My Trips
            </h1>
            <p className="text-xs text-[var(--ink-muted)]">
              Manage your upcoming trips and travel companion itineraries
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
          onClick={() => router.push('/onboarding')}
        >
          <Plus size={15} />
          <span>New Trip</span>
        </button>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {trips.length === 0 ? (
          <EmptyState
            title="Where are you going next?"
            description="Create your first trip with weather-aware packing lists, day-by-day itineraries, and shared companion expenses."
            ctaText="Plan a Trip"
            onCta={() => router.push('/onboarding')}
            icon="suitcase"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wider uppercase text-[var(--ink-muted)] font-mono">
                RECORDED TRIPS ({trips.length})
              </p>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)]" />
                <span>Offline-Ready</span>
              </span>
            </div>

            {/* Featured First Trip (Large Editorial Card) */}
            {trips.length > 0 && (() => {
              const firstTrip = trips[0];
              const dest = resolveDestination(firstTrip.destination);
              const packedItems = firstTrip.packingItems?.filter((i) => i.packed).length || 0;
              const totalItems = firstTrip.packingItems?.length || 0;
              const packPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
              const packedWeight = calculateTotalPackedWeight(firstTrip.packingItems || []);
              const maxWeight = firstTrip.baggageLimitKg || 7;
              const nextAct = firstTrip.activities?.[0]?.name || 'Unscheduled';

              return (
                <div
                  className="rounded-[12px] border border-[var(--rule)] bg-white overflow-hidden group cursor-pointer hover:border-[var(--green-900)] transition-colors"
                  onClick={() => router.push(`/trips/${firstTrip.id}`)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    {/* Photo Header */}
                    <div
                      className="md:col-span-5 h-56 md:h-auto min-h-[220px] relative p-5 flex flex-col justify-between overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(to top, rgba(6, 32, 27, 0.96) 0%, rgba(12, 65, 55, 0.7) 45%, rgba(0, 0, 0, 0.25) 100%), url(${firstTrip.coverImage || dest.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <span className="self-start text-[10px] font-mono uppercase tracking-widest text-white px-2 py-0.5 rounded-[4px] bg-black/55 border border-white/20">
                        LATEST TRIP
                      </span>
                      <div className="p-3.5 rounded-[8px] bg-gradient-to-t from-[rgba(6,32,27,0.96)] via-[rgba(6,32,27,0.85)] to-transparent -mx-2 -mb-2 space-y-1">
                        <h2
                          className="text-xl sm:text-2xl font-bold !text-white hero-photo-title tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] break-words leading-tight"
                          style={{
                            fontFamily: 'var(--font-heading)',
                            color: '#FFFFFF',
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                          }}
                        >
                          {firstTrip.name}
                        </h2>
                        <p className="text-xs text-white/95 font-medium flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          <MapPin size={12} className="text-white shrink-0" />
                          <span className="truncate">{firstTrip.destination}</span>
                        </p>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ink-muted)]">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={13} className="text-[var(--green-900)]" />
                            <span>{firstTrip.durationDays} days ({firstTrip.startDate || 'Dates pending'})</span>
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Users size={13} className="text-[var(--green-900)]" />
                            <span>{firstTrip.members?.length || 1} travelers</span>
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Route size={13} className="text-[var(--green-900)]" />
                            <span>Next: {nextAct}</span>
                          </span>
                        </div>

                        {/* Packing and Weight Status */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--ink-muted)] flex items-center gap-1">
                              <Luggage size={12} />
                              <span>Luggage Status</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-[var(--green-900)]">
                              {packedWeight.toFixed(1)} / {maxWeight} kg · {packPercent}% packed
                            </span>
                          </div>
                          <div className="h-2 bg-[var(--polar)] rounded-full overflow-hidden border border-[var(--rule)]">
                            <div
                              className="h-full bg-[var(--emerald)] rounded-full transition-all duration-300"
                              style={{ width: `${packPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--rule)]">
                        <div className="flex items-center gap-2">
                          <button
                            className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(firstTrip);
                            }}
                            title="Duplicate trip"
                          >
                            <Copy size={13} />
                            <span>Duplicate</span>
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-[var(--coral)] rounded-[6px] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(firstTrip.id, firstTrip.name);
                            }}
                            title="Delete trip"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-[var(--green-900)] group-hover:translate-x-1 transition-transform">
                          <span>Open Trip</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Remaining Trips in 2-Column Grid */}
            {trips.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trips.slice(1).map((trip) => {
                  const dest = resolveDestination(trip.destination);
                  const packedItems = trip.packingItems?.filter((i) => i.packed).length || 0;
                  const totalItems = trip.packingItems?.length || 0;
                  const packPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
                  const packedWeight = calculateTotalPackedWeight(trip.packingItems || []);
                  const maxWeight = trip.baggageLimitKg || 7;

                  return (
                    <div
                      key={trip.id}
                      className="cursor-pointer group hover:border-[var(--green-900)] transition-colors rounded-[12px] border border-[var(--rule)] bg-white overflow-hidden flex flex-col justify-between"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                      {/* Photo Thumbnail */}
                      <div
                        className="h-32 relative p-3 flex flex-col justify-end overflow-hidden"
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(6, 32, 27, 0.95) 0%, rgba(12, 65, 55, 0.6) 45%, rgba(0, 0, 0, 0.2) 100%), url(${trip.coverImage || dest.coverImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="p-2.5 rounded-[6px] bg-gradient-to-t from-[rgba(6,32,27,0.96)] via-[rgba(6,32,27,0.85)] to-transparent -mx-1.5 -mb-1.5 space-y-0.5">
                          <h3
                            className="font-bold text-base sm:text-lg !text-white hero-photo-title drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] truncate"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              color: '#FFFFFF',
                              textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                            }}
                          >
                            {trip.name}
                          </h3>
                          <p className="text-xs text-white/95 font-medium flex items-center gap-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            <MapPin size={11} className="text-white shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[var(--green-900)]" />
                            <span>{trip.durationDays} days</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} className="text-[var(--green-900)]" />
                            <span>{trip.members?.length || 1} travelers</span>
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-[var(--green-900)]">
                            {packedWeight.toFixed(1)} / {maxWeight} kg
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="h-1.5 bg-[var(--polar)] rounded-full overflow-hidden border border-[var(--rule)]">
                            <div
                              className="h-full bg-[var(--emerald)] rounded-full transition-all duration-300"
                              style={{ width: `${packPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-[var(--rule)] flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <button
                              className="btn btn-ghost btn-sm text-[11px] p-1 text-[var(--ink-muted)] hover:text-[var(--green-900)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(trip);
                              }}
                              title="Duplicate"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm text-[11px] p-1 text-gray-400 hover:text-[var(--coral)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(trip.id, trip.name);
                              }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--green-900)] group-hover:translate-x-1 transition-transform">
                            <span>Open</span>
                            <ArrowRight size={13} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
