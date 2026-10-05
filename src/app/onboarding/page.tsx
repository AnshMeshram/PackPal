/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveTrip, generateId } from '@/lib/storage/local';
import { Trip } from '@/types';
import { resolveDestination } from '@/lib/destinations';
import { loadCustomSettings } from '@/lib/storage/settings';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  MapPin,
  Calendar,
  Luggage,
  Compass,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { RouteLine } from '@/components/RouteLine';

const ACTIVITY_OPTIONS = [
  'Beach & Swimming', 'Coastal Trekking', 'Mountain Hiking', 'Sightseeing & Culture',
  'Fine Dining', 'Nightlife', 'Museums', 'Photography', 'Shopping', 'Adventure Sports',
];

const TRIP_TYPES = [
  { id: 'vacation', label: 'Vacation', desc: 'Relaxation, beaches, and leisure' },
  { id: 'adventure', label: 'Adventure', desc: 'Hiking, camping, and outdoor exploration' },
  { id: 'business', label: 'Business', desc: 'Work conferences, meetings, and urban transit' },
  { id: 'backpacking', label: 'Backpacking', desc: 'Minimalist multi-city transit' },
];

const ONBOARDING_STEPS = [
  { step: 1, label: 'Destination', question: 'Where are you heading?' },
  { step: 2, label: 'Trip Name', question: 'What shall we name this trip?' },
  { step: 3, label: 'Dates', question: 'When are you traveling?' },
  { step: 4, label: 'Trip Style', question: 'What style of journey is this?' },
  { step: 5, label: 'Baggage', question: 'What is your baggage allowance?' },
  { step: 6, label: 'Your Name', question: 'Who is the lead traveler?' },
  { step: 7, label: 'Companions', question: 'Who is traveling with you?' },
  { step: 8, label: 'Activities', question: 'What will you be doing?' },
  { step: 9, label: 'Review', question: 'Ready to pack and explore?' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);

  // Form states
  const [destination, setDestination] = useState('');
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState('vacation');
  const [baggageLimit, setBaggageLimit] = useState(7);
  const [yourName, setYourName] = useState('');
  const [companionInput, setCompanionInput] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['Sightseeing & Culture']);
  const [error, setError] = useState<string | null>(null);

  // Destination Scout (P3)
  const [scoutSuggestions, setScoutSuggestions] = useState<
    Array<{ destination: string; reason: string; tags: string[]; confidence: number }>
  >([]);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutSource, setScoutSource] = useState<'gemma' | 'fallback' | null>(null);
  const [scoutError, setScoutError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scoutAbortRef = useRef<AbortController | null>(null);

  // Destination Photo (P4)
  const [destinationPhoto, setDestinationPhoto] = useState<{
    url: string;
    title: string;
    source: 'serpapi' | 'local';
  } | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    document.title = 'New Trip · PackPal';
    const custom = loadCustomSettings();
    if (custom.defaultBaggageLimitKg) setBaggageLimit(custom.defaultBaggageLimitKg);
    if (custom.defaultTripType) setTripType(custom.defaultTripType);
    if (custom.favoriteActivities && custom.favoriteActivities.length > 0) {
      setSelectedActivities(custom.favoriteActivities);
    }
  }, []);

  // Debounced Destination Scout (600ms, min 3 chars, abort in-flight)
  useEffect(() => {
    const query = destination.trim();
    if (query.length < 3) {
      setScoutSuggestions([]);
      setScoutSource(null);
      setScoutError(null);
      setScoutLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (scoutAbortRef.current) {
        scoutAbortRef.current.abort();
      }
      const controller = new AbortController();
      scoutAbortRef.current = controller;

      setScoutLoading(true);
      setScoutError(null);

      try {
        const res = await fetch('/api/destinations/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          const suggestions = data.suggestions || [];
          setScoutSuggestions(suggestions);
          setScoutSource(data.source || null);
          if (suggestions.length === 0) {
            setScoutError("Couldn't find live suggestions. You can still enter the destination manually.");
          }
        } else {
          setScoutError("Couldn't find live suggestions. You can still enter the destination manually.");
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          setScoutError("Couldn't find live suggestions. You can still enter the destination manually.");
        }
      } finally {
        setScoutLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [destination]);

  const fetchPhoto = async (targetDest: string) => {
    const clean = targetDest.trim();
    if (!clean || clean.length < 2) return;
    setPhotoLoading(true);
    try {
      const res = await fetch(`/api/destinations/image?q=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        setDestinationPhoto(data);
      } else {
        const fb = resolveDestination(clean);
        setDestinationPhoto({ url: fb.coverImage, title: fb.name, source: 'local' });
      }
    } catch {
      const fb = resolveDestination(clean);
      setDestinationPhoto({ url: fb.coverImage, title: fb.name, source: 'local' });
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSelectDestination = (destName: string) => {
    setDestination(destName);
    setScoutSuggestions([]);
    setShowSuggestions(false);
    if (!tripName.trim()) {
      setTripName(`${destName.split(',')[0]} Trip`);
    }
    fetchPhoto(destName);
  };

  const addCompanion = () => {
    const name = companionInput.trim();
    if (name && !companions.includes(name)) {
      setCompanions([...companions, name]);
      setCompanionInput('');
    }
  };

  const removeCompanion = (name: string) => {
    setCompanions(companions.filter((c) => c !== name));
  };

  const toggleActivity = (a: string) => {
    setSelectedActivities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1 && !destination.trim()) {
      setError('Please specify a destination.');
      return false;
    }
    if (step === 2 && !tripName.trim()) {
      setError('Please enter a trip name.');
      return false;
    }
    if (step === 3) {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return false;
      }
      if (endDate < startDate) {
        setError('End date must not be before start date.');
        return false;
      }
    }
    if (step === 5 && (isNaN(baggageLimit) || baggageLimit <= 0)) {
      setError('Baggage limit must be a positive number in kg.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    // Auto-fill trip name and fetch photo when moving past destination
    if (currentStep === 1) {
      if (!tripName.trim()) {
        setTripName(`${destination.split(',')[0]} Trip`);
      }
      if (!destinationPhoto || destinationPhoto.title !== destination) {
        fetchPhoto(destination);
      }
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    if (next > maxVisitedStep) {
      setMaxVisitedStep(next);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setError(null);
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (target: number) => {
    if (target <= maxVisitedStep) {
      setError(null);
      setCurrentStep(target);
    }
  };

  const handleFinalSubmit = () => {
    if (!validateStep(currentStep)) return;

    const start = new Date(startDate || new Date().toISOString().split('T')[0]);
    const end = new Date(endDate || start.toISOString().split('T')[0]);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const allMembers = [yourName.trim() || 'You', ...companions];
    const defaultProfile = resolveDestination(destination.trim());
    const finalCover = destinationPhoto?.url || defaultProfile.coverImage;
    const finalTitle = destinationPhoto?.title || defaultProfile.name;
    const finalSource = destinationPhoto?.source || 'local';

    const trip: Trip = {
      id: generateId(),
      name: tripName.trim() || `${destination} Adventure`,
      destination: destination.trim(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      durationDays,
      tripType,
      baggageLimitKg: baggageLimit,
      coverImage: finalCover,
      coverImageTitle: finalTitle,
      coverImageSource: finalSource,
      luggage: {
        id: `lug-${Date.now()}`,
        bagType: 'cabin',
        bagName: `${baggageLimit}kg Cabin Bag`,
        maxWeightKg: baggageLimit,
        pieces: 1,
        dimensions: { lengthCm: 55, widthCm: 40, heightCm: 20 },
      },
      members: allMembers.map((name, i) => ({ id: `m-${i}`, name })),
      activities: selectedActivities.map((name, i) => ({ id: `a-${i}`, name })),
      itinerary: Array.from({ length: durationDays }, (_, i) => ({
        id: `it-${i}`,
        day: i + 1,
        date: new Date(start.getTime() + i * 86400000).toISOString().split('T')[0],
        activities: [],
      })),
      packingItems: [],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTrip(trip);
    router.push(`/trips/${trip.id}`);
  };

  // Contextual tips for each step
  const getStepTip = () => {
    switch (currentStep) {
      case 1:
        return 'PackPal connects with SerpApi to inspect live weather patterns, marine forecasts, and temperature ranges for your destination.';
      case 2:
        return 'A descriptive name makes your trip easily distinguishable in your local travel journal.';
      case 3:
        return 'Trip length determines clothing multipliers, laundry opportunities, and gear wear estimates.';
      case 4:
        return 'Trip style helps Gemma 2 prioritize formal attire versus rugged trail footwear and waterproof layers.';
      case 5:
        return 'Most domestic airlines enforce a 7.0 kg cabin trolley limit. PackPal strictly calculates unit weights to avoid baggage fees.';
      case 6:
        return 'Your name identifies the primary traveler packing this suitcase in the local journal.';
      case 7:
        return 'Travel companions can be assigned packing items (e.g. who carries the first-aid kit) and split expenses in TripSplit.';
      case 8:
        return 'Selecting activities triggers gear suggestions—such as hiking boots for mountain treks or dry bags for kayaking.';
      case 9:
      default:
        return 'Everything is stored 100% locally on your machine with zero cloud lock-in.';
    }
  };

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--rule)] bg-[var(--paper)]/95 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-ghost btn-sm p-1.5 text-[var(--green-900)] hover:bg-[var(--polar)] rounded-[6px]"
            onClick={() => router.push('/trips')}
            aria-label="Back to trips"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Let&apos;s plan your trip
            </h1>
            <p className="text-[11px] text-[var(--ink-muted)]">Journey-prep checklist · Step {currentStep} of 9</p>
          </div>
        </div>

        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)]">
          {Math.round((currentStep / 9) * 100)}% Complete
        </span>
      </header>

      {/* Main Multi-Pane Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Rail: 9-Step Progress Track */}
          <div className="lg:col-span-3 rounded-[12px] bg-white border border-[var(--rule)] p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--emerald-ink)] block px-2 mb-2 font-mono">
              JOURNEY TRACK
            </span>

            {ONBOARDING_STEPS.map((s) => {
              const isCurrent = s.step === currentStep;
              const isPassed = s.step < currentStep;
              const isClickable = s.step <= maxVisitedStep;

              return (
                <button
                  key={s.step}
                  onClick={() => jumpToStep(s.step)}
                  disabled={!isClickable}
                  className={`w-full text-left px-3 py-2 rounded-[6px] text-xs font-medium flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'bg-[var(--green-900)] text-white font-bold'
                      : isPassed
                      ? 'text-[var(--green-900)] hover:bg-[var(--polar)] cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                        isCurrent
                          ? 'bg-[var(--emerald)] text-[var(--green-900)] font-bold'
                          : isPassed
                          ? 'bg-[var(--polar)] text-[var(--green-900)]'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isPassed ? <Check size={11} /> : s.step}
                    </span>
                    <span>{s.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center Pane: Active Question */}
          <div className="lg:col-span-6 rounded-[12px] bg-white border border-[var(--rule)] p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[var(--emerald-ink)] uppercase font-mono block mb-1">
                STEP {currentStep} OF 9 · {ONBOARDING_STEPS[currentStep - 1].label.toUpperCase()}
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[var(--green-900)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {ONBOARDING_STEPS[currentStep - 1].question}
              </h2>
            </div>

            {error && (
              <div className="p-3 rounded-[6px] bg-[rgba(249,102,53,0.1)] border border-[var(--coral)] text-xs text-[var(--coral)] font-medium">
                {error}
              </div>
            )}

            {/* Dynamic Step Content */}
            <div className="space-y-4">
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="label">Destination City or Region</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3 text-[var(--emerald-ink)]" />
                      <input
                        type="text"
                        className="input pl-10 w-full"
                        placeholder="Where are you dreaming of going?"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        autoFocus
                      />
                      {photoLoading && (
                        <div className="absolute right-3.5 top-3">
                          <Loader2 size={16} className="animate-spin text-[var(--emerald-ink)]" />
                        </div>
                      )}
                    </div>

                    {/* Scout Loading indicator */}
                    {scoutLoading && (
                      <div className="flex items-center gap-2 mt-2 px-1 text-xs text-[var(--ink-muted)] font-mono">
                        <Loader2 size={13} className="animate-spin text-[var(--emerald-ink)]" />
                        <span>PackPal is looking for places…</span>
                      </div>
                    )}

                    {/* Destination Scout Panel (max 3 rows) */}
                    {showSuggestions && scoutSuggestions.length > 0 && (
                      <div className="mt-2 rounded-[8px] bg-white border border-[var(--rule)] overflow-hidden divide-y divide-[var(--rule)] shadow-sm">
                        {scoutSuggestions.map((s) => {
                          const thumb = resolveDestination(s.destination).coverImage;
                          return (
                            <button
                              key={s.destination}
                              type="button"
                              onClick={() => handleSelectDestination(s.destination)}
                              className="w-full text-left p-3 hover:bg-[var(--polar)] transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={thumb}
                                  alt={s.destination}
                                  className="w-10 h-10 rounded-[6px] object-cover border border-[var(--rule)] shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-[var(--green-900)] block truncate">{s.destination}</span>
                                  <p className="text-[11px] text-[var(--ink-muted)] line-clamp-1 mt-0.5">{s.reason}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {s.tags?.slice(0, 3).map((t) => (
                                      <span key={t} className="text-[9px] px-1.5 py-0.2 rounded-[4px] bg-[var(--polar)] text-[var(--green-900)] font-mono">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-[var(--emerald-ink)] group-hover:translate-x-0.5 transition-transform shrink-0 font-semibold">
                                Select →
                              </span>
                            </button>
                          );
                        })}
                        {scoutSource && (
                          <div className="px-3 py-1.5 bg-[var(--paper)] text-[10px] text-[var(--ink-muted)] font-mono flex items-center justify-between">
                            <span>{scoutSource === 'gemma' ? 'Suggested with Gemma 2' : 'Built-in suggestions'}</span>
                            <span className="text-[9px]">Click to apply</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Scout fallback message */}
                    {scoutError && !scoutLoading && destination.trim().length >= 3 && scoutSuggestions.length === 0 && (
                      <p className="text-[11px] text-[var(--ink-muted)] mt-1.5 font-mono">
                        {scoutError}
                      </p>
                    )}

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {['Goa, India', 'Manali, India', 'Bali, Indonesia', 'Tokyo, Japan', 'Paris, France'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className="text-[11px] px-2.5 py-1 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)] hover:bg-[var(--polar)]/80 cursor-pointer"
                          onClick={() => handleSelectDestination(preset)}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Destination Photo Preview (P4) */}
                  {destination.trim().length >= 2 && (
                    <div className="pt-2">
                      {photoLoading ? (
                        <div className="p-3 rounded-[8px] bg-white border border-[var(--rule)] text-xs text-[var(--ink-muted)] flex items-center gap-2 font-mono">
                          <Loader2 size={14} className="animate-spin text-[var(--emerald-ink)]" />
                          <span>Finding a view of {destination}…</span>
                        </div>
                      ) : destinationPhoto ? (
                        <div className="rounded-[8px] overflow-hidden border border-[var(--rule)] bg-white">
                          <div className="relative h-28 w-full overflow-hidden">
                            <img
                              src={destinationPhoto.url}
                              alt={destinationPhoto.title || destination}
                              onError={(e) => {
                                e.currentTarget.src = resolveDestination(destination).coverImage;
                              }}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,32,27,0.95)] via-[rgba(6,32,27,0.5)] to-transparent flex items-end p-2.5">
                              <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-200 block drop-shadow">
                                  Destination photo {destinationPhoto.source === 'serpapi' ? '· via SerpApi' : '· Curated view'}
                                </span>
                                <p className="text-xs font-bold text-white leading-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                  {destinationPhoto.title || destination}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <label className="label">Trip Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Goa Getaway"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      type="date"
                      className="input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TRIP_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTripType(t.id)}
                      className={`p-4 rounded-[6px] border text-left transition-colors cursor-pointer ${
                        tripType === t.id
                          ? 'border-[var(--green-900)] bg-[var(--polar)]'
                          : 'border-[var(--rule)] hover:border-[var(--green-900)] bg-white'
                      }`}
                    >
                      <span className="font-bold text-sm text-[var(--green-900)] block">{t.label}</span>
                      <span className="text-xs text-[var(--ink-muted)] block mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <label className="label">Cabin Baggage Allowance (kg)</label>
                  <div className="relative">
                    <Luggage size={16} className="absolute left-3.5 top-3 text-[var(--green-900)]" />
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={50}
                      className="input pl-10"
                      value={baggageLimit}
                      onChange={(e) => setBaggageLimit(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[7, 8, 10, 15, 20].map((kg) => (
                      <button
                        key={kg}
                        type="button"
                        className={`text-xs px-3 py-1 rounded-[6px] border ${
                          baggageLimit === kg
                            ? 'bg-[var(--green-900)] text-white border-[var(--green-900)]'
                            : 'bg-white border-[var(--rule)] text-[var(--ink)]'
                        }`}
                        onClick={() => setBaggageLimit(kg)}
                      >
                        {kg} kg
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div>
                  <label className="label">Your Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter your name"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>
              )}

              {currentStep === 7 && (
                <div>
                  <label className="label">Add Friends or Companions</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Rahul"
                      value={companionInput}
                      onChange={(e) => setCompanionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCompanion();
                        }
                      }}
                    />
                    <button type="button" className="btn btn-secondary px-4" onClick={addCompanion}>
                      <Plus size={15} />
                    </button>
                  </div>
                  {companions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {companions.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2.5 py-1 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)] flex items-center gap-1.5"
                        >
                          <span>{c}</span>
                          <button
                            type="button"
                            onClick={() => removeCompanion(c)}
                            className="text-[var(--coral)] hover:opacity-80"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 8 && (
                <div>
                  <label className="label">Select Planned Activities</label>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITY_OPTIONS.map((act) => {
                      const selected = selectedActivities.includes(act);
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => toggleActivity(act)}
                          className={`text-xs px-3 py-1.5 rounded-[6px] border transition-colors cursor-pointer ${
                            selected
                              ? 'bg-[var(--green-900)] text-white border-[var(--green-900)]'
                              : 'bg-white border-[var(--rule)] text-[var(--ink)] hover:border-[var(--green-900)]'
                          }`}
                        >
                          {act}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 9 && (
                <div className="space-y-4">
                  {(destinationPhoto || destination.trim().length >= 2) && (
                    <div className="rounded-[8px] overflow-hidden border border-[var(--rule)] bg-white">
                      <div className="relative h-32 w-full overflow-hidden">
                        <img
                          src={destinationPhoto?.url || resolveDestination(destination).coverImage}
                          alt={destinationPhoto?.title || destination}
                          onError={(e) => {
                            e.currentTarget.src = resolveDestination(destination).coverImage;
                          }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,32,27,0.95)] via-[rgba(6,32,27,0.5)] to-transparent flex items-end p-3">
                          <div>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-200 block drop-shadow">
                              Destination photo {destinationPhoto?.source === 'serpapi' ? '· via SerpApi' : '· Curated view'}
                            </span>
                            <p className="text-sm font-bold text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              {destinationPhoto?.title || destination}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Destination:</span>
                      <strong className="text-[var(--green-900)]">{destination || 'Not set'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Dates:</span>
                      <strong>{startDate} to {endDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Trip Style:</span>
                      <strong className="capitalize">{tripType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Baggage Limit:</span>
                      <strong>{baggageLimit} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Travelers:</span>
                      <strong>{[yourName || 'You', ...companions].join(', ')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Activities:</span>
                      <strong>{selectedActivities.length} selected</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--rule)]">
              <button
                type="button"
                className="btn btn-secondary text-xs px-4 py-2"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </button>

              {currentStep < 9 ? (
                <button
                  type="button"
                  className="btn btn-primary text-xs font-bold px-5 py-2 flex items-center gap-1.5"
                  onClick={handleNext}
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary text-xs font-bold px-6 py-2.5 flex items-center gap-2"
                  onClick={handleFinalSubmit}
                >
                  <Compass size={16} />
                  <span>Create Trip & Start Packing</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Pane: Cream Travel Notes Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-[12px] bg-[var(--cream)]/60 border border-[var(--rule)] p-5 space-y-3">
              <div className="flex items-center gap-2 text-[var(--green-900)]">
                <Sparkles size={15} />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">TRAVEL WISDOM</span>
              </div>
              <p className="text-xs text-[var(--ink)] leading-relaxed italic">
                &ldquo;{getStepTip()}&rdquo;
              </p>
            </div>

            {/* Mini Route Preview */}
            <div className="rounded-[12px] bg-white border border-[var(--rule)] p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] font-mono block">
                JOURNEY PROGRESS
              </span>
              <RouteLine
                startLabel={yourName ? yourName.toUpperCase() : 'DEPART'}
                endLabel={destination ? destination.split(',')[0].toUpperCase() : 'DESTINATION'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Live Summary Strip */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-[var(--rule)] py-2.5 px-6 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4 text-[var(--ink-muted)] font-mono">
            <span className="flex items-center gap-1 font-semibold text-[var(--green-900)] min-w-0">
              <MapPin size={12} className="text-[var(--emerald-ink)] shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">{destination || 'Destination pending'}</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <Calendar size={12} />
              <span>{startDate && endDate ? `${startDate} → ${endDate}` : 'Dates pending'}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Luggage size={12} />
              <span>{baggageLimit} kg limit</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--emerald-ink)] font-mono">
              STEP {currentStep} / 9
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
