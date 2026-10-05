'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTrip, updateTrip } from '@/lib/storage/local';
import { Trip, AITripChange, WeatherSummary } from '@/types';
import { calculateTotalPackedWeight, calculateTotalEstimatedWeight } from '@/lib/packing/weights';
import { calculateTotalExpensesPaise, calculateBalances, formatPaiseToRupees } from '@/lib/expenses/calculator';
import { computeSettlements } from '@/lib/expenses/settlement';
import {
  Calendar, Users, Luggage,
  ArrowRight, Sparkles, Loader2,
  Edit3, X, Check, ArrowLeft, Printer,
} from 'lucide-react';
import { resolveDestination, getDestinationRouteMeta } from '@/lib/destinations';
import { TripContextBar } from '@/components/TripContextBar';
import { TicketStrip } from '@/components/TicketStrip';
import { StatusDot } from '@/components/StatusDot';
import { PackPalInsight } from '@/components/PackPalInsight';
import { WeatherBarometer } from '@/components/WeatherBarometer';
import { FieldNotes } from '@/components/FieldNotes';
import { ExpeditionDispatchModal } from '@/components/ExpeditionDispatchModal';

export default function TripDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);

  // Edit Trip Modal state
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDest, setEditDest] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editStyle, setEditStyle] = useState('vacation');
  const [editLimit, setEditLimit] = useState(7);

  // Weather state
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Change My Trip (AI trip change) state
  const [changePrompt, setChangePrompt] = useState('');
  const [analyzingChange, setAnalyzingChange] = useState(false);
  const [aiChangeResult, setAiChangeResult] = useState<AITripChange | null>(null);
  const [changeAppliedMsg, setChangeAppliedMsg] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshTrip = useCallback(() => {
    const t = getTrip(tripId);
    setTrip(t);
    if (t) {
      document.title = `${t.name} · PackPal`;
      setEditName(t.name);
      setEditDest(t.destination);
      setEditStart(t.startDate);
      setEditEnd(t.endDate);
      setEditStyle(t.tripType || 'vacation');
      setEditLimit(t.baggageLimitKg || 7);
    }
    setIsLoaded(true);
  }, [tripId]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  const handleSaveTripEdits = () => {
    if (!trip) return;
    let days = trip.durationDays;
    try {
      const start = new Date(editStart);
      const end = new Date(editEnd);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      // fallback
    }

    updateTrip(tripId, {
      name: editName.trim() || trip.name,
      destination: editDest.trim() || trip.destination,
      startDate: editStart || trip.startDate,
      endDate: editEnd || trip.endDate,
      durationDays: days,
      tripType: editStyle,
      baggageLimitKg: Number(editLimit),
    });
    setShowEditTrip(false);
    refreshTrip();
  };

  // Fetch weather for destination
  useEffect(() => {
    if (!trip?.destination) return;
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(`/api/weather?destination=${encodeURIComponent(trip.destination)}`);
        if (res.ok) {
          const data = await res.json();
          setWeather({
            condition: data.weather?.condition || data.destinationInfo?.weatherForecast || data.weatherForecast || 'Mild conditions expected',
            temperatureRange: 'Seasonal temperature',
            source: 'live',
          });
        }
      } catch (err) {
        console.warn('Weather fetch fallback', err);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [trip?.destination]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-32 page-enter min-h-screen bg-[var(--paper)]">
        <Loader2 size={24} className="animate-spin text-[var(--emerald-ink)] mb-2" />
        <p className="text-xs font-semibold text-[var(--ink-muted)]">Loading trip overview...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 page-enter text-center px-4 min-h-screen bg-[var(--paper)]">
        <h3 className="text-xl font-bold text-[var(--green-900)] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Trip Not Found
        </h3>
        <p className="text-xs text-[var(--ink-muted)] max-w-sm mb-4">
          The requested trip is not available on this device.
        </p>
        <button
          className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2"
          onClick={() => router.push('/trips')}
        >
          <ArrowLeft size={15} />
          <span>Back to My Trips</span>
        </button>
      </div>
    );
  }

  const packedCount = trip.packingItems.filter((i) => i.packed).length;
  const totalItems = trip.packingItems.length;
  const packedWeight = calculateTotalPackedWeight(trip.packingItems);
  const estimatedWeight = calculateTotalEstimatedWeight(trip.packingItems);
  const totalExpenses = calculateTotalExpensesPaise(trip.expenses || []);
  const balances = calculateBalances(trip.expenses || [], trip.members.map((m) => m.name));
  const userBalance = balances.length > 0 ? balances[0].balancePaise : 0;
  const packProgress = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;
  const settlements = computeSettlements(balances);

  // ── Calculate Live Trip Readiness (Deterministic Real State) ──
  const totalActivities = (trip.activities?.length || 0) + (trip.itinerary?.flatMap((d) => d.activities || []).length || 0);
  const minActivitiesNeeded = Math.max(1, trip.durationDays);
  const baggageLimit = trip.luggage?.maxWeightKg || trip.baggageLimitKg || 7;
  const isWithinLimit = packedWeight <= baggageLimit;

  let readinessScore = 0;
  const readinessChecks: Array<{ label: string; ok: boolean; warn: boolean }> = [];

  // 1. Packing readiness (35 pts max)
  const packScore = totalItems > 0 ? Math.round((packedCount / totalItems) * 35) : 0;
  readinessScore += packScore;
  if (packProgress >= 80) {
    readinessChecks.push({ label: `Packing ${packProgress}%`, ok: true, warn: false });
  } else if (totalItems > 0) {
    readinessChecks.push({ label: `Packing ${packProgress}%`, ok: false, warn: true });
  } else {
    readinessChecks.push({ label: 'Packing list empty', ok: false, warn: true });
  }

  // 2. Luggage allowance (20 pts max)
  if (isWithinLimit) {
    readinessScore += 20;
    readinessChecks.push({ label: 'Luggage within limit', ok: true, warn: false });
  } else {
    readinessChecks.push({ label: `Luggage overweight (+${(packedWeight - baggageLimit).toFixed(1)} kg)`, ok: false, warn: true });
  }

  // 3. Itinerary planned (20 pts max)
  if (totalActivities >= minActivitiesNeeded) {
    readinessScore += 20;
    readinessChecks.push({ label: 'Itinerary planned', ok: true, warn: false });
  } else if (totalActivities > 0) {
    readinessScore += Math.round((totalActivities / minActivitiesNeeded) * 20);
    readinessChecks.push({ label: `Itinerary partial (${totalActivities} scheduled)`, ok: false, warn: true });
  } else {
    readinessChecks.push({ label: 'Itinerary pending', ok: false, warn: false });
  }

  // 4. Travelers added (15 pts max)
  if (trip.members.length >= 2) {
    readinessScore += 15;
    readinessChecks.push({ label: 'Travelers added', ok: true, warn: false });
  } else {
    readinessScore += 12;
    readinessChecks.push({ label: 'Travelers added (Solo)', ok: true, warn: false });
  }

  // 5. Expense settlement status (10 pts max)
  if (trip.expenses.length === 0) {
    readinessScore += 10;
    readinessChecks.push({ label: 'No expenses pending', ok: true, warn: false });
  } else if (settlements.length === 0) {
    readinessScore += 10;
    readinessChecks.push({ label: 'All expenses settled', ok: true, warn: false });
  } else {
    readinessScore += 5;
    readinessChecks.push({ label: 'Expense settlement pending', ok: false, warn: true });
  }

  readinessScore = Math.min(100, Math.max(0, readinessScore));

  // Upcoming 3 itinerary items
  const upcomingActivities = (trip.itinerary || [])
    .flatMap((day) => (day.activities || []).map((act) => ({ ...act, dayNum: day.day, date: day.date })))
    .slice(0, 3);

  const handleAnalyzeTripChange = async () => {
    if (!changePrompt.trim()) return;
    setAnalyzingChange(true);
    setChangeError(null);
    setAiChangeResult(null);
    setChangeAppliedMsg(null);

    try {
      const res = await fetch('/api/ai/trip-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeDescription: changePrompt,
          currentTrip: {
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            durationDays: trip.durationDays,
            tripType: trip.tripType,
            activities: trip.activities.map((a) => a.name),
          },
        }),
      });

      const data = await res.json();
      if (data.change) {
        setAiChangeResult(data.change);
      } else {
        setChangeError(data.error || 'Failed to analyze change');
      }
    } catch {
      setChangeError('Service is offline. Check Ollama local setup or try again.');
    } finally {
      setAnalyzingChange(false);
    }
  };

  const handleApplyTripChange = () => {
    if (!aiChangeResult || !trip) return;

    const updates: Partial<Trip> = {};

    if (aiChangeResult.action === 'extend_trip' && aiChangeResult.days) {
      const newDuration = trip.durationDays + aiChangeResult.days;
      updates.durationDays = newDuration;
      try {
        const start = new Date(trip.startDate);
        const newEnd = new Date(start);
        newEnd.setDate(start.getDate() + newDuration);
        updates.endDate = newEnd.toISOString().split('T')[0];
      } catch {
        // ignore
      }
    } else if (aiChangeResult.action === 'shorten_trip' && aiChangeResult.days) {
      const newDuration = Math.max(1, trip.durationDays - aiChangeResult.days);
      updates.durationDays = newDuration;
    } else if (aiChangeResult.action === 'add_activity' && aiChangeResult.activity) {
      const newActivity = {
        id: `${Date.now()}`,
        name: aiChangeResult.activity,
        notes: aiChangeResult.details || 'Added via Change my trip',
      };
      updates.activities = [...(trip.activities || []), newActivity];
    }

    updateTrip(tripId, updates);
    setChangeAppliedMsg('Trip updated successfully with requested changes.');
    setAiChangeResult(null);
    setChangePrompt('');
    refreshTrip();
    setTimeout(() => setChangeAppliedMsg(null), 4000);
  };

  const destProfile = resolveDestination(trip.destination);
  const routeMeta = getDestinationRouteMeta(trip.destination);
  const coverUrl = trip.coverImage || destProfile.coverImage;

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

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Destination Editorial Cover Banner */}
        <div
          className="relative rounded-[12px] overflow-hidden min-h-[240px] sm:min-h-[280px] flex flex-col justify-between p-5 sm:p-6 border border-[var(--rule)] shadow-sm"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(6, 32, 27, 0.96) 0%, rgba(12, 65, 55, 0.6) 45%, rgba(0, 0, 0, 0.25) 100%), url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Top Bar: Trip Style + Passport Entry Stamp + Edit Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-mono font-semibold bg-black/65 text-white border border-white/25 uppercase tracking-widest shadow-sm">
              {trip.tripType.toUpperCase()} · {trip.durationDays} DAYS
            </span>

            <div className="flex items-center gap-3">
              {/* Vintage Passport Arrival Stamp */}
              <div className="passport-stamp text-center shrink-0 hidden sm:inline-flex">
                <span className="text-[7.5px] font-mono text-white/70 tracking-widest block">OFFICIAL ENTRY</span>
                <span className="text-[11px] font-mono font-bold text-white tracking-[0.16em]">{routeMeta.code} · ARRIVAL</span>
                <span className="text-[7.5px] font-mono text-white/70 tracking-wider block">{trip.startDate}</span>
              </div>

              <button
                onClick={() => setShowDispatchModal(true)}
                className="text-xs px-3 py-1.5 rounded-[6px] bg-[#0C4137] text-white flex items-center gap-1.5 font-bold shadow-md cursor-pointer hover:bg-[#06201B] border border-white/40 transition-colors"
                title="Print or export trip expedition dispatch"
              >
                <Printer size={13} />
                <span>Dispatch</span>
              </button>

              <button
                onClick={() => setShowEditTrip(true)}
                className="text-xs px-3.5 py-1.5 rounded-[6px] bg-white text-[var(--green-900)] flex items-center gap-1.5 font-bold shadow-md cursor-pointer hover:bg-[var(--polar)] border border-white/80 transition-colors"
                style={{ backgroundColor: '#FFFFFF', color: '#0C4137' }}
              >
                <Edit3 size={13} className="text-[var(--green-900)]" />
                <span>Edit Trip</span>
              </button>
            </div>
          </div>

          {/* Bottom Area: Controlled dark-green gradient vignette behind text only */}
          <div className="relative z-10 pt-6 pb-1 px-1">
            <div className="p-3.5 sm:p-4 rounded-[8px] bg-gradient-to-t from-[rgba(6,32,27,0.96)] via-[rgba(6,32,27,0.85)] to-transparent -mx-2 -mb-2 space-y-1.5">
              {/* Monospace IATA Waypoint Route + Elevation */}
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.18em] text-[var(--emerald)] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                <span>{routeMeta.route}</span>
                <span className="text-white/40">•</span>
                <span>ELEV {routeMeta.elevation}</span>
                <span className="text-white/40 hidden md:inline">•</span>
                <span className="hidden md:inline text-white/70">{routeMeta.coordinates}</span>
              </div>

              {/* Italic Serif Pull-Quote Mood Lead-In */}
              <p
                className="italic text-xs sm:text-sm text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                &ldquo;{routeMeta.mood}&rdquo;
              </p>

              {/* Destination Hero Heading */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold !text-white hero-photo-title tracking-wide break-words leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: '#FFFFFF',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                }}
              >
                {trip.destination}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/95 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} className="text-white shrink-0" />
                  <span>{trip.startDate} to {trip.endDate}</span>
                </span>
                <span className="hidden sm:inline text-white/60">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={13} className="text-white shrink-0" />
                  <span>{trip.members.length} Travelers</span>
                </span>
                <span className="hidden sm:inline text-white/60">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Luggage size={13} className="text-white shrink-0" />
                  <span>{trip.baggageLimitKg} kg Cabin Limit</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Boarding-Pass Ticket Strip */}
        <TicketStrip
          code={`PKP-${routeMeta.code}`}
          route={routeMeta.route}
          badge={<StatusDot status={weather?.source === 'live' ? 'live' : 'fallback'} label={weather?.source === 'live' ? 'Live via SerpApi' : 'Seasonal estimate'} />}
          fields={[
            { label: 'PACKING', value: `${packProgress}% READY`, subValue: `${packedCount}/${totalItems} items` },
            { label: 'LUGGAGE', value: `${packedWeight.toFixed(1)} / ${trip.baggageLimitKg} KG`, subValue: `Est: ${estimatedWeight.toFixed(1)} kg` },
            { label: 'TRIPSPLIT', value: formatPaiseToRupees(totalExpenses), subValue: `${trip.members.length} travelers` },
            { label: 'BALANCE', value: userBalance >= 0 ? `+${formatPaiseToRupees(userBalance)}` : formatPaiseToRupees(userBalance), subValue: 'Your share' },
          ]}
        />

        {/* ── Killer Feature: Compact Live Trip Readiness Indicator ── */}
        <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--rule)]">
            <div>
              <span className="text-[10px] font-bold font-mono tracking-widest text-[var(--emerald-ink)] uppercase block">
                JOURNEY READINESS
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--green-900)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Trip Readiness
              </h2>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[var(--green-900)]">{readinessScore}%</span>
              <span className="text-xs text-[var(--ink-muted)]">completed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-[var(--polar)] rounded-full overflow-hidden border border-[var(--rule)]">
            <div
              className="h-full bg-[var(--green-900)] rounded-full transition-all duration-300"
              style={{ width: `${readinessScore}%` }}
            />
          </div>

          {/* Checklist rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {readinessChecks.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-[6px] border flex items-center gap-2 font-medium ${
                  item.ok
                    ? 'bg-[var(--polar)]/40 border-[var(--rule)] text-[var(--green-900)]'
                    : item.warn
                    ? 'bg-[var(--cream)]/60 border-[var(--rule)] text-[var(--green-900)]'
                    : 'bg-[var(--paper)] border-[var(--rule)] text-[var(--ink-muted)]'
                }`}
              >
                <span className={`font-mono font-bold text-sm shrink-0 ${item.ok ? 'text-[var(--emerald-ink)]' : item.warn ? 'text-[var(--amber)]' : 'text-gray-400'}`}>
                  {item.ok ? '✓' : item.warn ? '⚠' : '○'}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analog Atmospheric Barometer & Destination Weather Instrument */}
        <div className="space-y-3">
          <WeatherBarometer
            condition={weatherLoading ? 'Calibrating barometer...' : (weather?.condition || 'Mild seasonal conditions expected.')}
            source={weather?.source}
          />
        </div>

        {/* Split: Packing Readiness | Upcoming Itinerary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Packing Readiness Column */}
          <div className="md:col-span-6 rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--green-900)] uppercase font-mono tracking-wider">
                  PACKING READINESS
                </span>
                <span className="font-mono text-xs font-bold text-[var(--green-900)]">
                  {packedCount} / {totalItems} Packed
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="h-2 bg-[var(--polar)] rounded-full overflow-hidden border border-[var(--rule)]">
                  <div
                    className="h-full bg-[var(--emerald)] rounded-full transition-all duration-300"
                    style={{ width: `${packProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[var(--ink-muted)]">
                  <span>{packProgress}% packed</span>
                  <span>{packedWeight.toFixed(1)} / {trip.baggageLimitKg} kg cabin weight</span>
                </div>
              </div>

              <p className="text-xs text-[var(--ink-muted)] leading-relaxed pt-1">
                {packedWeight > trip.baggageLimitKg
                  ? `⚠️ Over baggage limit by ${(packedWeight - trip.baggageLimitKg).toFixed(1)} kg. Review heavy items.`
                  : `Within ${trip.baggageLimitKg} kg allowance. Ready for cabin boarding.`}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-between">
              <button
                className="btn btn-secondary text-xs px-3 py-1.5"
                onClick={() => router.push(`/trips/${tripId}/packing`)}
              >
                Open Packing List
              </button>
              <button
                className="btn btn-ghost text-xs text-[var(--green-900)] font-semibold flex items-center gap-1"
                onClick={() => router.push(`/trips/${tripId}/packing`)}
              >
                <span>Check my bag</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Next Activities Column */}
          <div className="md:col-span-6 rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--green-900)] uppercase font-mono tracking-wider">
                  NEXT ACTIVITIES
                </span>
                <span className="font-mono text-xs text-[var(--ink-muted)]">
                  {upcomingActivities.length} scheduled
                </span>
              </div>

              {upcomingActivities.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--ink-muted)]">
                  No upcoming activities scheduled yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingActivities.map((act, idx) => (
                    <div
                      key={act.id || idx}
                      className="p-2.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--polar)] text-[var(--green-900)]">
                          {act.time || 'Day ' + act.dayNum}
                        </span>
                        <span className="font-semibold text-[var(--green-900)]">{act.name}</span>
                      </div>
                      {act.notes && (
                        <span className="text-[10px] text-[var(--ink-muted)] truncate max-w-[120px]">
                          {act.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-between">
              <button
                className="btn btn-secondary text-xs px-3 py-1.5"
                onClick={() => router.push(`/trips/${tripId}/itinerary`)}
              >
                View Full Itinerary
              </button>
              <button
                className="btn btn-ghost text-xs text-[var(--green-900)] font-semibold flex items-center gap-1"
                onClick={() => router.push(`/trips/${tripId}/itinerary`)}
              >
                <span>Add Activity</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Travel Insight Quote Card */}
        <PackPalInsight
          quote={weather?.condition
            ? `Current weather indicates ${weather.condition.toLowerCase()}. Ensure appropriate footwear and layers are packed before departure.`
            : `Keep your packing streamlined. A 7 kg cabin limit allows for 4 days of essentials when lightweight fabrics are chosen.`}
          source="PackPal Destination Intelligence"
          actionLabel="Review Packing"
          onAction={() => router.push(`/trips/${tripId}/packing`)}
        />

        {/* Compact TripSplit & Travelers Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* TripSplit Compact Summary */}
          <div className="md:col-span-6 rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--green-900)] uppercase font-mono tracking-wider">
                TRIPSPLIT BALANCES
              </span>
              <button
                className="text-xs font-semibold text-[var(--green-900)] hover:underline flex items-center gap-1"
                onClick={() => router.push(`/trips/${tripId}/expenses`)}
              >
                <span>Manage</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="p-3 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[var(--ink-muted)] block">TOTAL GROUP EXPENSES</span>
                <span className="text-lg font-bold text-[var(--green-900)]">{formatPaiseToRupees(totalExpenses)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-[var(--ink-muted)] block">YOUR POSITION</span>
                <span className={`text-sm font-bold ${userBalance >= 0 ? 'text-[var(--emerald-ink)]' : 'text-[var(--coral)]'}`}>
                  {userBalance >= 0 ? `+${formatPaiseToRupees(userBalance)}` : formatPaiseToRupees(userBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Travelers Row */}
          <div className="md:col-span-6 rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--green-900)] uppercase font-mono tracking-wider">
                TRAVEL COMPANIONS ({trip.members.length})
              </span>
              <button
                className="text-xs font-semibold text-[var(--green-900)] hover:underline flex items-center gap-1"
                onClick={() => router.push(`/trips/${tripId}/members`)}
              >
                <span>All Travelers</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {trip.members.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="px-3 py-1.5 rounded-[6px] bg-[var(--polar)] border border-[var(--rule)] flex items-center gap-2 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-[var(--green-900)] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-[var(--green-900)]">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tactile Pencil Marginalia & Field Notes */}
        <FieldNotes
          tripId={tripId}
          notes={trip.fieldNotes || []}
          onNotesChange={refreshTrip}
        />

        {/* Modify Journey (Whisper-Quiet Natural Language Input) */}
        <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center">
                <Sparkles size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--green-900)]">Modify your journey</h3>
                <p className="text-xs text-[var(--ink-muted)]">
                  Scribble changes in plain words — e.g. &ldquo;Add 2 extra days&rdquo; or &ldquo;Add scuba diving on day 3&rdquo;
                </p>
              </div>
            </div>
            <StatusDot status="live" label="Local Travel Engine" />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. We decided to extend our trip by 2 days"
              value={changePrompt}
              onChange={(e) => setChangePrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeTripChange()}
              className="input flex-1 text-xs"
              disabled={analyzingChange}
            />
            <button
              onClick={handleAnalyzeTripChange}
              disabled={analyzingChange || !changePrompt.trim()}
              className="btn btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
            >
              {analyzingChange ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>Update Journey</span>
            </button>
          </div>

          {changeError && (
            <div className="p-3 rounded-[6px] bg-[rgba(249,102,53,0.1)] border border-[var(--coral)] text-xs text-[var(--coral)]">
              {changeError}
            </div>
          )}

          {changeAppliedMsg && (
            <div className="p-3 rounded-[6px] bg-[var(--polar)] border border-[var(--emerald-ink)]/30 text-xs text-[var(--green-900)] font-semibold">
              {changeAppliedMsg}
            </div>
          )}

          {aiChangeResult && (
            <div className="p-4 rounded-[6px] bg-[var(--polar)]/50 border border-[var(--green-900)] space-y-3 text-xs">
              <div className="font-bold text-[var(--green-900)] text-sm">
                Proposed Trip Modification
              </div>
              <p className="text-[var(--ink)]">
                {aiChangeResult.details || `Action: ${aiChangeResult.action.replace('_', ' ')} ${aiChangeResult.days ? `(${aiChangeResult.days} days)` : ''} ${aiChangeResult.activity ? `(${aiChangeResult.activity})` : ''}`}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleApplyTripChange}
                  className="btn btn-primary text-xs font-bold px-3 py-1.5 flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>Confirm and Apply</span>
                </button>
                <button
                  onClick={() => setAiChangeResult(null)}
                  className="btn btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Trip Modal */}
      {showEditTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-[12px] border border-[var(--rule)] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <h3 className="font-bold text-base text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Edit Trip Parameters
              </h3>
              <button onClick={() => setShowEditTrip(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Trip Name</label>
                <input
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Destination</label>
                <input
                  className="input"
                  value={editDest}
                  onChange={(e) => setEditDest(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Trip Style</label>
                  <select
                    className="input capitalize"
                    value={editStyle}
                    onChange={(e) => setEditStyle(e.target.value)}
                  >
                    <option value="vacation">Vacation</option>
                    <option value="adventure">Adventure</option>
                    <option value="business">Business</option>
                    <option value="backpacking">Backpacking</option>
                  </select>
                </div>
                <div>
                  <label className="label">Baggage Limit (kg)</label>
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    className="input"
                    value={editLimit}
                    onChange={(e) => setEditLimit(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button
                className="btn btn-secondary text-xs px-4 py-2"
                onClick={() => setShowEditTrip(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-2"
                onClick={handleSaveTripEdits}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Trip Expedition Dispatch Scrapbook Modal */}
      <ExpeditionDispatchModal
        trip={trip}
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
      />
    </div>
  );
}
