'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getTrips, saveTrip, generateId } from '@/lib/storage/local';
import { Trip } from '@/types';
import {
  ArrowRight,
  Compass,
  Shield,
  Cpu,
  Lock,
  Zap,
} from 'lucide-react';
import { VECTOR_ASSETS } from '@/lib/media/assetResolver';
import { RouteLine } from '@/components/RouteLine';
import { TicketStrip } from '@/components/TicketStrip';
import { StatusDot } from '@/components/StatusDot';
import { PackPalIcon } from '@/components/PackPalIcon';

export default function Home() {
  const router = useRouter();
  const [demoStats, setDemoStats] = useState({
    destination: 'GOA, INDIA',
    duration: '4 DAYS',
    weather: '28°C SUN',
    baggage: '5.2 / 7.0 KG',
    readiness: '72% PACKED',
  });

  useEffect(() => {
    document.title = 'Home · PackPal';
    const trips = getTrips();
    const demo = trips.find((t) => t.name === 'Goa Getaway');
    if (demo) {
      const packedCount = demo.packingItems?.filter((i) => i.packed).length || 0;
      const total = demo.packingItems?.length || 1;
      const percent = Math.round((packedCount / total) * 100);
      setDemoStats({
        destination: demo.destination.toUpperCase(),
        duration: `${demo.durationDays} DAYS`,
        weather: '28°C SUN',
        baggage: `5.2 / ${demo.baggageLimitKg || 7}.0 KG`,
        readiness: `${percent}% PACKED`,
      });
    }
  }, []);

  const loadDemo = () => {
    const trips = getTrips();
    const demoTrip = trips.find((t) => t.name === 'Goa Getaway');

    if (demoTrip) {
      router.push(`/trips/${demoTrip.id}`);
      return;
    }

    const newDemoTrip: Trip = {
      id: generateId(),
      name: 'Goa Getaway',
      destination: 'Goa, India',
      startDate: '2026-10-15',
      endDate: '2026-10-18',
      durationDays: 4,
      tripType: 'vacation',
      baggageLimitKg: 7,
      luggage: {
        id: 'lug-1',
        bagType: 'cabin',
        bagName: 'Carry-On Trolley',
        maxWeightKg: 7,
        pieces: 1,
        dimensions: { lengthCm: 55, widthCm: 40, heightCm: 20 },
      },
      members: [
        { id: 'm1', name: 'Ansh', preferences: { notes: 'Packs light, carries daypack' } },
        { id: 'm2', name: 'Rahul', preferences: { dietary: ['Vegetarian'], notes: 'Carries first-aid kit' } },
        { id: 'm3', name: 'Aman', preferences: { dietary: ['No Seafood'] } },
        { id: 'm4', name: 'Riya', preferences: { notes: 'Brings camera & drone gear' } },
      ],
      activities: [
        { id: 'a1', name: 'Beach & Swimming', day: 2, time: '09:00', category: 'beach', requiredGear: ['Swimwear', 'Beach Towel', 'Waterproof pouch'] },
        { id: 'a2', name: 'Coastal Trekking', day: 3, time: '07:00', category: 'hiking', requiredGear: ['Hiking shoes', 'Hydration pack'] },
        { id: 'a3', name: 'Heritage Walk', day: 3, time: '15:00', category: 'sightseeing', requiredGear: ['Walking shoes', 'Hat'] },
        { id: 'a4', name: 'Sunset Dining', day: 1, time: '20:00', category: 'dining', requiredGear: ['Evening casuals'] },
      ],
      itinerary: [
        {
          id: 'it1', day: 1, date: '2026-10-15',
          activities: [
            { id: 'ia1', name: 'Arrival at Dabolim Airport', time: '10:00', notes: 'Prepaid taxi stand at exit' },
            { id: 'ia2', name: 'Hotel Check-in & Settle in', time: '14:00', notes: 'Villa near Calangute' },
            { id: 'ia3', name: 'Sunset Drinks & Welcome Dinner', time: '19:30', notes: 'Reserved table by the water' },
          ],
        },
        {
          id: 'it2', day: 2, date: '2026-10-16',
          activities: [
            { id: 'ia4', name: 'Baga Beach & Water Sports', time: '09:00', notes: 'Jet ski & parasailing booking' },
            { id: 'ia5', name: 'Seaside Cafe Lunch', time: '13:30', notes: 'Try coastal curry' },
            { id: 'ia6', name: 'Catamaran Sunset Cruise', time: '17:30', notes: 'Boarding at 17:15 sharp' },
          ],
        },
        {
          id: 'it3', day: 3, date: '2026-10-17',
          activities: [
            { id: 'ia7', name: 'Fort Aguada & Coastal Trek', time: '07:30', notes: 'Carry water and sun protection' },
            { id: 'ia8', name: 'Old Goa Heritage Walk & Churches', time: '14:00', notes: 'Modest attire required' },
          ],
        },
        {
          id: 'it4', day: 4, date: '2026-10-18',
          activities: [
            { id: 'ia9', name: 'Local Spice & Flea Market', time: '10:00', notes: 'Cashews and souvenirs' },
            { id: 'ia10', name: 'Hotel Checkout & Departure', time: '13:00', notes: 'Flight at 16:30' },
          ],
        },
      ],
      packingItems: [
        { id: 'p1', name: 'Government ID & Flight Passes', category: 'documents', quantity: 1, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.1, source: 'ai' },
        { id: 'p2', name: 'Phone Charger & Universal Adapter', category: 'electronics', quantity: 1, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.15, source: 'ai' },
        { id: 'p3', name: 'Quick-Dry Swimwear & Microfiber Towel', category: 'beach', quantity: 2, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.45, source: 'ai' },
        { id: 'p4', name: 'Broad Spectrum Sunscreen SPF 50+', category: 'toiletries', quantity: 1, packed: true, essential: true, priority: 'essential', weightEstimateKg: 0.2, source: 'ai' },
        { id: 'p5', name: 'Breathable Cotton T-Shirts', category: 'clothing', quantity: 4, packed: true, essential: false, priority: 'recommended', weightEstimateKg: 0.6, source: 'ai' },
        { id: 'p6', name: 'Linen Shorts & Evening Chinos', category: 'clothing', quantity: 2, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.5, source: 'ai' },
        { id: 'p7', name: 'Trail Hiking Shoes & Grip Socks', category: 'hiking', quantity: 1, packed: false, essential: true, priority: 'essential', weightEstimateKg: 0.85, source: 'activity' },
        { id: 'p8', name: '10,000mAh Power Bank & Cables', category: 'electronics', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.25, source: 'ai' },
        { id: 'p9', name: 'Polarized Sunglasses & Case', category: 'accessories', quantity: 1, packed: false, essential: false, priority: 'recommended', weightEstimateKg: 0.08, source: 'ai' },
      ],
      expenses: [
        { id: 'e1', description: 'Group Welcome Dinner', amountPaise: 240000, paidBy: 'Rahul', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Food', splitMethod: 'equal', timestamp: '2026-10-15T20:00:00' },
        { id: 'e2', description: 'Airport Prepaid Cab', amountPaise: 120000, paidBy: 'Ansh', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Transport', splitMethod: 'equal', timestamp: '2026-10-15T10:30:00' },
        { id: 'e3', description: 'Beachfront Villa Booking', amountPaise: 400000, paidBy: 'Aman', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Accommodation', splitMethod: 'equal', timestamp: '2026-10-15T14:00:00' },
        { id: 'e4', description: 'Jet Ski & Water Sports Tickets', amountPaise: 160000, paidBy: 'Riya', participants: ['Ansh', 'Rahul', 'Aman', 'Riya'], category: 'Activities', splitMethod: 'equal', timestamp: '2026-10-16T10:00:00' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTrip(newDemoTrip);
    router.push(`/trips/${newDemoTrip.id}`);
  };

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* ── Top Navigation ── */}
      <nav className="px-6 py-4 border-b border-[var(--rule)] bg-[var(--paper)]/95 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <PackPalIcon size={34} priority />
          <div>
            <span className="font-bold text-lg tracking-tight text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              PackPal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
          <button
            className="text-xs font-semibold text-[var(--green-900)] hover:text-[var(--emerald-ink)] transition-colors cursor-pointer"
            onClick={() => router.push('/trips')}
          >
            Trips
          </button>
          <button
            className="text-xs font-semibold text-[var(--green-900)] hover:text-[var(--emerald-ink)] transition-colors cursor-pointer hidden sm:block"
            onClick={() => router.push('/about')}
          >
            About
          </button>
          <button
            className="text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--green-900)] transition-colors cursor-pointer hidden sm:block"
            onClick={() => router.push('/settings')}
          >
            Settings
          </button>
          <button
            className="btn btn-primary text-xs font-bold px-3 sm:px-4 py-2"
            onClick={() => router.push('/onboarding')}
          >
            <span className="hidden sm:inline">Plan a Trip</span>
            <span className="sm:hidden">Plan</span>
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative px-6 pt-12 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Headline */}
          <div className="lg:col-span-6 space-y-6 text-left relative">
            <div className="text-[11px] font-bold tracking-widest text-[var(--emerald-ink)] uppercase">
              EDITORIAL TRAVEL JOURNAL · BUILT FOR FRIENDS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[var(--green-900)] leading-[1.08] font-normal" style={{ fontFamily: 'var(--font-heading)' }}>
              Pack smarter.<br />
              <span className="italic font-normal text-[var(--green-900)]">travel lighter.</span>
            </h1>

            <p className="text-base text-[var(--ink-muted)] leading-relaxed max-w-lg">
              PackPal turns your destination, live weather, and daily plans into a personalized
              packing setup that actually fits your trip—backed by local AI and zero cloud lock-in.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                className="btn btn-primary text-xs font-bold px-7 py-3 flex items-center justify-center gap-2"
                onClick={() => router.push('/onboarding')}
              >
                <Compass size={16} />
                <span>PLAN A TRIP</span>
              </button>
              <button
                className="btn btn-secondary text-xs font-semibold px-7 py-3 flex items-center justify-center gap-2"
                onClick={loadDemo}
              >
                <span>TRY DEMO TRIP</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Curved Route Line crossing toward the card */}
            <div className="hidden lg:block w-72 pt-3">
              <RouteLine variant="curved" />
            </div>

            {/* Micro Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--rule)]">
              <div>
                <span className="text-[11px] font-bold text-[var(--green-900)] block">01 PLAN</span>
                <span className="text-[11px] text-[var(--ink-muted)]">Days & routes</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[var(--green-900)] block">02 PACK</span>
                <span className="text-[11px] text-[var(--ink-muted)]">Smart weight</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[var(--green-900)] block">03 TRAVEL</span>
                <span className="text-[11px] text-[var(--ink-muted)]">Weather aware</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[var(--green-900)] block">04 SHARE</span>
                <span className="text-[11px] text-[var(--ink-muted)]">TripSplit</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Travel Board Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-[12px] border border-[var(--rule)] bg-white p-4">
              {/* Destination Cover Image */}
              <div
                className="relative h-60 sm:h-64 rounded-[6px] overflow-hidden p-4 sm:p-5 flex flex-col justify-end"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(6, 32, 27, 0.96) 0%, rgba(12, 65, 55, 0.6) 50%, rgba(0, 0, 0, 0.2) 100%), url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="p-3 sm:p-3.5 rounded-[6px] bg-gradient-to-t from-[rgba(6,32,27,0.92)] via-[rgba(6,32,27,0.7)] to-transparent -mx-2 -mb-2 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-200 block">
                    ACTIVE TRIP BRIEFING
                  </span>
                  <h3
                    className="text-2xl font-bold !text-white hero-photo-title tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: '#FFFFFF',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    Goa, India
                  </h3>
                  <p className="text-white/95 text-xs mt-0.5 flex flex-wrap items-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <span>4 Days</span>
                    <span className="text-white/60">•</span>
                    <span>4 Travelers</span>
                    <span className="text-white/60">•</span>
                    <span>28°C Coastal Sun</span>
                  </p>
                </div>
              </div>

              {/* Monospace Boarding Pass / Ticket Strip with Punch Holes */}
              <div className="mt-3">
                <TicketStrip
                  code="PKP-GOA · DEMO PASS"
                  badge={<StatusDot status="live" label="Live via SerpApi" />}
                  fields={[
                    { label: 'DESTINATION', value: demoStats.destination },
                    { label: 'DURATION', value: demoStats.duration },
                    { label: 'WEATHER', value: demoStats.weather },
                    { label: 'BAGGAGE', value: demoStats.baggage },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Everything Before the Journey (Numbered Editorial Horizontal Flow) ── */}
      <section className="px-6 py-16 bg-[var(--polar)]/30 border-y border-[var(--rule)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[var(--rule)]">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--emerald-ink)] block mb-1">
                THE PACKPAL FRAMEWORK
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Everything before the journey
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-md mt-2 md:mt-0">
              One companion that replaces scattered notes, calculators, weather bookmarks, and split spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 01 PLAN */}
            <div className="p-5 rounded-[12px] bg-white border border-[var(--rule)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--emerald-ink)] tracking-wider block mb-1 font-mono">01 — PLAN</span>
                <h3 className="text-base font-bold text-[var(--green-900)] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  Itinerary & Schedule
                </h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Day-by-day activity timelines with notes, start times, and location presets from beaches to mountain treks.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--rule)] flex items-center gap-2 text-[11px] text-[var(--green-900)] font-semibold">
                <Image src={VECTOR_ASSETS.map} alt="Plan" width={16} height={16} />
                <span>Daily Routes</span>
              </div>
            </div>

            {/* 02 PACK */}
            <div className="p-5 rounded-[12px] bg-white border border-[var(--rule)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--emerald-ink)] tracking-wider block mb-1 font-mono">02 — PACK</span>
                <h3 className="text-base font-bold text-[var(--green-900)] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  Luggage & Weight Check
                </h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Categorized gear lists with unit weights, inline counters, airline baggage limits, and non-destructive AI advice.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--rule)] flex items-center gap-2 text-[11px] text-[var(--green-900)] font-semibold">
                <Image src={VECTOR_ASSETS.suitcase} alt="Pack" width={16} height={16} />
                <span>Cabin Limits</span>
              </div>
            </div>

            {/* 03 TRAVEL */}
            <div className="p-5 rounded-[12px] bg-white border border-[var(--rule)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--emerald-ink)] tracking-wider block mb-1 font-mono">03 — TRAVEL</span>
                <h3 className="text-base font-bold text-[var(--green-900)] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  Weather Intelligence
                </h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Live Google Search & SerpApi destination conditions that proactively adjust packing recommendations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--rule)] flex items-center gap-2 text-[11px] text-[var(--green-900)] font-semibold">
                <Image src={VECTOR_ASSETS.weather} alt="Travel" width={16} height={16} />
                <span>Live Conditions</span>
              </div>
            </div>

            {/* 04 SHARE */}
            <div className="p-5 rounded-[12px] bg-white border border-[var(--rule)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--emerald-ink)] tracking-wider block mb-1 font-mono">04 — SHARE</span>
                <h3 className="text-base font-bold text-[var(--green-900)] mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  TripSplit Expenses
                </h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Natural language expense parsing (*“Rahul paid ₹2400 for dinner”*) and exact integer paise debt minimization.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[var(--rule)] flex items-center gap-2 text-[11px] text-[var(--green-900)] font-semibold">
                <Image src={VECTOR_ASSETS.wallet} alt="Split" width={16} height={16} />
                <span>Exact Paise Math</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo Band: Made for Real Trips ── */}
      <section className="px-6 py-12 bg-[var(--paper)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="h-44 rounded-[12px] p-5 flex flex-col justify-end border border-[var(--rule)]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(12, 65, 55, 0.9) 0%, rgba(12, 65, 55, 0.2) 60%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
            }}
          >
            <span className="text-xs font-bold text-white font-mono uppercase">COASTAL & BEACH</span>
            <p className="text-emerald-100 text-[11px]">Sunscreen, quick-dry layers, swim gear</p>
          </div>
          <div
            className="h-44 rounded-[12px] p-5 flex flex-col justify-end border border-[var(--rule)]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(12, 65, 55, 0.9) 0%, rgba(12, 65, 55, 0.2) 60%), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
            }}
          >
            <span className="text-xs font-bold text-white font-mono uppercase">MOUNTAIN TRAILS</span>
            <p className="text-emerald-100 text-[11px]">Trek boots, fleece, daypack water kit</p>
          </div>
          <div
            className="h-44 rounded-[12px] p-5 flex flex-col justify-end border border-[var(--rule)]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(12, 65, 55, 0.9) 0%, rgba(12, 65, 55, 0.2) 60%), url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80')`,
              backgroundSize: 'cover',
            }}
          >
            <span className="text-xs font-bold text-white font-mono uppercase">CITY & CULTURE</span>
            <p className="text-emerald-100 text-[11px]">Power bank, IDs, walking footwear, museum pass</p>
          </div>
        </div>
      </section>

      {/* ── Green Block: Open-Source AI Architecture (Gemma 2) ── */}
      <section className="px-6 py-16 bg-[var(--paper)]">
        <div className="max-w-4xl mx-auto">
          <div className="p-7 sm:p-9 rounded-[12px] bg-[var(--green-900)] text-white border border-[var(--green-700)]">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={17} className="text-[var(--emerald)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--emerald)]">
                OPEN-SOURCE AI AT THE CORE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Why PackPal uses local Gemma 2
            </h2>

            <p className="text-sm text-emerald-100/90 leading-relaxed mb-6 max-w-2xl">
              Built for Hacktoberfest 2026, PackPal is powered by Google’s open-weights <strong>Gemma 2</strong> model
              running locally via <strong>Ollama</strong>. Your private travel dates, friend list, and expenses stay
              on your computer—with instant deterministic TypeScript fallbacks if the model is offline.
            </p>

            {/* Architecture diagram flow */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center text-xs font-medium bg-black/20 p-3.5 rounded-[6px] border border-white/10">
              <div className="p-2.5 bg-white/10 rounded-[6px]">
                <span className="block font-bold text-[var(--emerald)]">PackPal UI</span>
                <span className="text-[10px] text-gray-300">Natural prompt</span>
              </div>
              <span className="text-emerald-400 font-mono hidden sm:inline">➔</span>
              <div className="p-2.5 bg-white/10 rounded-[6px]">
                <span className="block font-bold text-[var(--emerald)]">Ollama Engine</span>
                <span className="text-[10px] text-gray-300">Local port 11434</span>
              </div>
              <span className="text-emerald-400 font-mono hidden sm:inline">➔</span>
              <div className="p-2.5 bg-white/10 rounded-[6px]">
                <span className="block font-bold text-[var(--emerald)]">Gemma 2</span>
                <span className="text-[10px] text-gray-300">Structured JSON</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10 text-xs">
              <div className="flex items-start gap-2.5">
                <Lock size={15} className="text-[var(--emerald)] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">100% Private</strong>
                  <span className="text-emerald-100/80">No vendor lock-in or tracking of personal trip notes.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap size={15} className="text-[var(--emerald)] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Deterministic Math</strong>
                  <span className="text-emerald-100/80">AI suggests; TypeScript strictly calculates weights & paise.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield size={15} className="text-[var(--emerald)] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Offline Ready</strong>
                  <span className="text-emerald-100/80">Built-in heuristic rules continue working even on airplane mode.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cream Journal Band: Built for a Friend Story ── */}
      <section className="px-6 py-14 bg-[var(--paper)]">
        <div className="max-w-3xl mx-auto p-6 sm:p-7 rounded-[12px] bg-[var(--cream)]/60 border border-[var(--rule)] text-left">
          <div className="flex items-center gap-2 mb-2 text-[var(--green-900)]">
            <Image src={VECTOR_ASSETS.friends} alt="Friends" width={20} height={20} />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">HACKTOBERFEST 2026 THEME</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--green-900)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            “Built for a friend who doesn’t want to forget half their suitcase.”
          </h3>
          <p className="text-sm text-[var(--ink)] leading-relaxed mb-3">
            Every group trip starts with excitement and ends up trapped across four different apps: packing lists in Apple Notes,
            weather on Google, flight tickets in emails, and split bills in messy WhatsApp chats.
          </p>
          <p className="text-sm text-[var(--ink)] leading-relaxed">
            PackPal was designed for friends traveling together: enter where you’re going once, let Gemma 2 and SerpApi coordinate
            gear and weather, pack under cabin weight limits, and settle dinner bills in seconds without awkward math.
          </p>
          <div className="pt-3 mt-3 border-t border-[var(--rule)] text-xs text-[var(--ink-muted)] flex items-center justify-between">
            <span>TripSplit: Split bills equally or custom in exact paise</span>
            <span className="font-mono font-semibold text-[var(--green-900)]">NO SPREADSHEETS NEEDED</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-[var(--rule)] bg-[var(--paper)] text-center text-xs text-[var(--ink-muted)]">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <PackPalIcon size={22} />
          <span className="font-bold text-sm text-[var(--green-900)]">PackPal</span>
          <span>·</span>
          <span>Open-Source Local AI Travel Companion</span>
        </div>
        <p>Built with Next.js 16, React 19, TypeScript, Gemma 2, Ollama, SerpApi & MongoDB Atlas.</p>
        <p className="mt-1 opacity-75">Hacktoberfest 2026 DEV Weekend Challenge — Theme: Build for a Friend</p>
      </footer>
    </div>
  );
}
