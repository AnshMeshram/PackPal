'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getTrip, updateTrip, generateId } from '@/lib/storage/local';
import { Trip, PackingItem, BagType } from '@/types';
import { calculateTotalPackedWeight, calculateTotalEstimatedWeight, calculateItemWeight, formatWeight } from '@/lib/packing/weights';
import {
  Plus, Trash2, Check, X, Loader2,
  ChevronDown, ChevronUp, Sparkles, Weight,
  Volume2, VolumeX, Printer, Search, Luggage,
  Settings, Edit3, Send, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { TripContextBar } from '@/components/TripContextBar';
import { StatusDot } from '@/components/StatusDot';
import { LuggageScaleGauge } from '@/components/LuggageScaleGauge';
import { LuggageBaggageTag } from '@/components/LuggageBaggageTag';
import { PackPalIcon } from '@/components/PackPalIcon';
import { getDestinationRouteMeta } from '@/lib/destinations';
import { loadCustomSettings } from '@/lib/storage/settings';

const DEFAULT_CATEGORIES: { id: string; label: string }[] = [
  { id: 'clothing', label: 'Clothing' },
  { id: 'toiletries', label: 'Toiletries' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'documents', label: 'Documents' },
  { id: 'beach', label: 'Beach' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'health', label: 'Health' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'gear', label: 'Gear' },
  { id: 'miscellaneous', label: 'Misc' },
];

const LUGGAGE_PRESETS: { type: BagType; name: string; maxWeightKg: number; dims: { l: number; w: number; h: number } }[] = [
  { type: 'cabin', name: 'Cabin Trolley', maxWeightKg: 7, dims: { l: 55, w: 40, h: 20 } },
  { type: 'backpack', name: 'Travel Backpack (40L)', maxWeightKg: 8, dims: { l: 50, w: 35, h: 20 } },
  { type: 'checkin', name: 'Check-In Suitcase', maxWeightKg: 20, dims: { l: 75, w: 50, h: 30 } },
  { type: 'trolley', name: 'Weekend Duffle', maxWeightKg: 10, dims: { l: 55, w: 30, h: 25 } },
  { type: 'custom', name: 'Custom Bag', maxWeightKg: 7, dims: { l: 55, w: 40, h: 20 } },
];

export default function PackingPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(() => getTrip(tripId));
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [source, setSource] = useState<'ai' | 'fallback' | ''>('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [optimizeResults, setOptimizeResults] = useState<{ itemId: string; decision: string; reason: string }[]>([]);
  const [bouncingItemId, setBouncingItemId] = useState<string | null>(null);

  // Luggage Setup Modal state
  const [showLuggageModal, setShowLuggageModal] = useState(false);
  const [bagType, setBagType] = useState<BagType>('cabin');
  const [bagName, setBagName] = useState('Cabin Trolley');
  const [bagMaxWeight, setBagMaxWeight] = useState(7);
  const [bagLength, setBagLength] = useState(55);
  const [bagWidth, setBagWidth] = useState(40);
  const [bagHeight, setBagHeight] = useState(20);

  // Custom Category state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Add Item Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('clothing');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemOwner, setNewItemOwner] = useState<string>('');
  const [newItemWeight, setNewItemWeight] = useState(0.2);

  // Edit Item state
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);

  // Undo delete state
  const [recentlyDeleted, setRecentlyDeleted] = useState<PackingItem | null>(null);

  // AI Luggage Advisor state ("Ask PackPal about your bag")
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState<string | null>(null);

  // Voice narration / ElevenLabs state
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refreshTrip = useCallback(() => {
    const t = getTrip(tripId);
    setTrip(t);
    if (t) {
      document.title = `Packing · PackPal`;
    }
    if (t?.luggage) {
      setBagType(t.luggage.bagType);
      setBagName(t.luggage.bagName);
      setBagMaxWeight(t.luggage.maxWeightKg);
      if (t.luggage.dimensions) {
        setBagLength(t.luggage.dimensions.lengthCm);
        setBagWidth(t.luggage.dimensions.widthCm);
        setBagHeight(t.luggage.dimensions.heightCm);
      }
    } else if (t) {
      setBagMaxWeight(t.baggageLimitKg || 7);
    }
  }, [tripId]);

  useEffect(() => { refreshTrip(); }, [refreshTrip]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center flex-1 py-32 min-h-screen bg-[var(--paper)]">
        <Loader2 size={24} className="animate-spin text-[var(--emerald-ink)] mb-2" />
        <p className="text-xs text-[var(--ink-muted)]">Loading packing setup...</p>
      </div>
    );
  }

  const items = trip.packingItems || [];
  const routeMeta = getDestinationRouteMeta(trip.destination);
  const packedWeight = calculateTotalPackedWeight(items);
  const estimatedWeight = calculateTotalEstimatedWeight(items);
  const baggageLimit = trip.luggage?.maxWeightKg || trip.baggageLimitKg || 7;
  const packedCount = items.filter((i) => i.packed).length;
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;
  const essentialCount = items.filter((i) => i.essential).length;
  const essentialPackedCount = items.filter((i) => i.essential && i.packed).length;
  const essentialPercent = essentialCount > 0 ? Math.round((essentialPackedCount / essentialCount) * 100) : 100;

  // Build combined categories (defaults + custom)
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...(trip.customCategories || []).map((cat) => ({ id: cat.toLowerCase(), label: cat })),
  ];

  const saveItems = (newItems: PackingItem[]) => {
    updateTrip(tripId, { packingItems: newItems });
    refreshTrip();
  };

  const togglePacked = (id: string) => {
    setBouncingItemId(id);
    setTimeout(() => {
      setBouncingItemId((curr) => (curr === id ? null : curr));
    }, 280);
    const updated = items.map((i) => (i.id === id ? { ...i, packed: !i.packed } : i));
    saveItems(updated);
  };

  const deleteItem = (item: PackingItem) => {
    setRecentlyDeleted(item);
    saveItems(items.filter((i) => i.id !== item.id));
    setTimeout(() => {
      setRecentlyDeleted((prev) => (prev?.id === item.id ? null : prev));
    }, 6000);
  };

  const handleUndoDelete = () => {
    if (!recentlyDeleted) return;
    saveItems([...items, recentlyDeleted]);
    setRecentlyDeleted(null);
  };

  const changeQuantity = (id: string, delta: number) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    });
    saveItems(updated);
  };

  const handleSaveLuggage = () => {
    updateTrip(tripId, {
      baggageLimitKg: bagMaxWeight,
      luggage: {
        id: trip.luggage?.id || `lug-${Date.now()}`,
        bagType,
        bagName,
        maxWeightKg: bagMaxWeight,
        pieces: 1,
        dimensions: { lengthCm: bagLength, widthCm: bagWidth, heightCm: bagHeight },
      },
    });
    setShowLuggageModal(false);
    refreshTrip();
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    const existing = trip.customCategories || [];
    if (!existing.includes(name)) {
      updateTrip(tripId, { customCategories: [...existing, name] });
      refreshTrip();
    }
    setNewCatName('');
    setShowCategoryModal(false);
  };

  const addManualItem = () => {
    if (!newItemName.trim()) return;
    const newItem: PackingItem = {
      id: generateId(),
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty,
      packed: false,
      essential: false,
      priority: 'recommended',
      weightEstimateKg: newItemWeight,
      source: 'manual',
      owner: newItemOwner || undefined,
    };
    saveItems([...items, newItem]);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemOwner('');
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    const updated = items.map((i) => (i.id === editingItem.id ? editingItem : i));
    saveItems(updated);
    setEditingItem(null);
  };

  const generateAIPlan = async () => {
    setGenerating(true);
    setError('');
    const userSettings = loadCustomSettings();
    try {
      const res = await fetch('/api/pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip: {
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            durationDays: trip.durationDays,
            tripType: trip.tripType,
            activities: trip.activities?.map((a) => a.name) || [],
          },
          baggageLimitKg: baggageLimit,
          packingRules: userSettings.packingRules,
          travelStyle: userSettings.travelStyle,
        }),
      });

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        saveItems(data.items);
        setSource(data.source || 'ai');
      } else {
        setError(data.error || 'Failed to generate recommendations.');
      }
    } catch {
      setError('Unable to reach generation service.');
    } finally {
      setGenerating(false);
    }
  };

  const optimizeBag = async () => {
    setOptimizing(true);
    setOptimizeResults([]);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          baggageLimitKg: baggageLimit,
          tripContext: `${trip.destination}, ${trip.durationDays} days, ${trip.tripType}`,
        }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setOptimizeResults(data.recommendations);
      } else {
        setError('Optimization returned no suggestions.');
      }
    } catch {
      setError('Luggage optimizer is unavailable.');
    } finally {
      setOptimizing(false);
    }
  };

  const applyOptimization = () => {
    const removeIds = new Set(optimizeResults.filter((r) => r.decision === 'remove').map((r) => r.itemId));
    const updated = items.filter((i) => !removeIds.has(i.id));
    saveItems(updated);
    setOptimizeResults([]);
  };

  const handleAskAdvisor = async (promptQuery?: string) => {
    const q = promptQuery || advisorQuery;
    if (!q.trim()) return;
    setAdvisorLoading(true);
    setAdvisorResponse(null);

    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          baggageLimitKg: baggageLimit,
          tripContext: `${trip.destination}, ${trip.durationDays} days. User question: "${q}"`,
        }),
      });
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        const top = data.recommendations.slice(0, 3).map((r: { reason: string }) => r.reason).join(' • ');
        setAdvisorResponse(`PackPal Luggage Advice: ${top}`);
      } else {
        setAdvisorResponse(`Based on your ${baggageLimit}kg limit, prioritize lightweight apparel and eliminate duplicate footwear.`);
      }
    } catch {
      setAdvisorResponse(`PackPal Advice: Your suitcase is currently ${packedWeight.toFixed(1)}kg of ${baggageLimit}kg. Keep heavy jackets out of the cabin bag.`);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const playVoiceBriefing = async () => {
    if (audioBase64) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
      return;
    }

    setAudioLoading(true);
    try {
      const res = await fetch('/api/pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip: {
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            durationDays: trip.durationDays,
            tripType: trip.tripType,
            activities: trip.activities?.map((a) => a.name) || [],
          },
          includeAudio: true,
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setAudioBase64(data.audioBase64);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);
      } else {
        alert('ElevenLabs voice briefing requires an ELEVENLABS_API_KEY in .env.local.');
      }
    } catch {
      alert('Voice synthesis service is currently offline.');
    } finally {
      setAudioLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = activeCategoryFilter === 'all' || item.category.toLowerCase() === activeCategoryFilter.toLowerCase();
    const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-20">
      {audioBase64 && (
        <audio
          ref={audioRef}
          src={`data:audio/mp3;base64,${audioBase64}`}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

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
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--emerald-ink)] uppercase font-mono block mb-1">
              SUITCASE READINESS · {trip.destination.toUpperCase()}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--green-900)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Pack for {trip.destination}
            </h1>
            <p className="text-sm italic text-[var(--ink-muted)] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              &ldquo;Everything you need, nothing you don&apos;t.&rdquo;
            </p>

            {/* 3 Inline Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-[6px] bg-white border border-[var(--rule)] text-[var(--green-900)] font-bold">
                Packed: {packedCount}/{items.length} ({progress}%)
              </span>
              <span className="px-2.5 py-1 rounded-[6px] bg-white border border-[var(--rule)] text-[var(--green-900)] font-bold">
                Weight: {packedWeight.toFixed(1)} / {baggageLimit} kg
              </span>
              <span className="px-2.5 py-1 rounded-[6px] bg-white border border-[var(--rule)] text-[var(--green-900)] font-bold">
                Essentials: {essentialPercent}%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
              onClick={playVoiceBriefing}
              disabled={audioLoading}
              title="Listen to audio packing briefing via ElevenLabs"
            >
              {audioLoading ? <Loader2 size={13} className="animate-spin" /> : isPlaying ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isPlaying ? 'Pause' : 'Voice Briefing'}</span>
            </button>

            <button
              className="btn btn-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            <button
              className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5"
              onClick={generateAIPlan}
              disabled={generating}
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{items.length === 0 ? 'Generate List' : 'Re-Generate'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Error and Notification Banners */}
        {error && (
          <div className="p-3.5 rounded-[6px] bg-[rgba(249,102,53,0.1)] border border-[var(--coral)] text-xs text-[var(--coral)] flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {recentlyDeleted && (
          <div className="p-3 rounded-[6px] bg-[var(--cream)]/80 border border-[var(--rule)] text-xs text-[var(--green-900)] flex items-center justify-between">
            <span>Deleted &ldquo;{recentlyDeleted.name}&rdquo;</span>
            <button onClick={handleUndoDelete} className="font-bold underline text-[var(--green-900)]">
              Undo
            </button>
          </div>
        )}

        {source && (
          <div className="flex items-center gap-2 text-xs text-[var(--emerald-ink)] px-1 font-mono">
            <StatusDot status={source === 'ai' ? 'live' : 'fallback'} />
            <span>
              {source === 'ai'
                ? `Checklist prepared on-device based on ${trip.destination} weather & cabin limits`
                : 'Checklist tailored via offline travel rules'}
            </span>
          </div>
        )}

        {/* ── Complete State Celebration Banner ── */}
        {items.length > 0 && progress === 100 && (
          <div className="p-5 rounded-[12px] bg-[var(--polar)] border border-[var(--emerald-ink)]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[6px] bg-[var(--emerald)] text-[var(--green-900)] flex items-center justify-center font-bold">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Bag packed. Adventure unlocked.
                </h3>
                <p className="text-xs text-[var(--emerald-ink)]">
                  All {items.length} items are stowed under the {baggageLimit} kg limit. Have a wonderful trip!
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-[var(--green-900)] uppercase tracking-wider">
              100% READY
            </span>
          </div>
        )}

        {/* ── 2-Column Editorial Layout: Left Items | Right Luggage Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Items Area (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex items-center flex-1">
                <Search size={16} className="absolute left-3.5 text-[var(--ink-muted)] pointer-events-none shrink-0" />
                <input
                  type="text"
                  placeholder="Search gear, essentials, or clothing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-has-icon w-full text-xs"
                  style={{ paddingLeft: '44px' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="btn btn-primary text-xs font-bold px-3.5 py-2 flex items-center gap-1.5"
                  onClick={() => setShowAdd(true)}
                >
                  <Plus size={14} />
                  <span>Add Item</span>
                </button>

                <button
                  className="btn btn-secondary text-xs px-3 py-2"
                  onClick={() => setShowCategoryModal(true)}
                >
                  + Category
                </button>
              </div>
            </div>

            {/* Horizontal Category Scroller */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-[var(--green-900)] text-white'
                    : 'bg-white text-[var(--ink-muted)] border border-[var(--rule)] hover:border-[var(--green-900)]'
                }`}
                onClick={() => setActiveCategoryFilter('all')}
              >
                All ({items.length})
              </button>
              {allCategories.map((c) => {
                const count = items.filter((i) => i.category.toLowerCase() === c.id.toLowerCase()).length;
                return (
                  <button
                    key={c.id}
                    className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors shrink-0 cursor-pointer ${
                      activeCategoryFilter === c.id
                        ? 'bg-[var(--green-900)] text-white'
                        : 'bg-white text-[var(--ink-muted)] border border-[var(--rule)] hover:border-[var(--green-900)]'
                    }`}
                    onClick={() => setActiveCategoryFilter(c.id)}
                  >
                    {c.label} {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Items Table / Row List */}
            <div className="rounded-[12px] bg-white border border-[var(--rule)] overflow-hidden divide-y divide-[var(--rule)]">
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <PackPalIcon size={46} className="mx-auto mb-2 opacity-90" />
                  <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                    No items in this view
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)] max-w-sm mx-auto">
                    Click &ldquo;Generate List&rdquo; or add items manually to populate this section.
                  </p>
                  <button
                    className="btn btn-primary text-xs font-bold px-4 py-2 mt-2"
                    onClick={generateAIPlan}
                  >
                    Generate Packing List
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                      item.packed ? 'bg-[var(--polar)]/30 opacity-75' : 'hover:bg-[var(--paper)]/50'
                    }`}
                  >
                    {/* Left: Check + Title + Badges */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <button
                        className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          bouncingItemId === item.id ? 'stow-bounce' : ''
                        } ${
                          item.packed
                            ? 'bg-[var(--emerald-ink)] border-[var(--emerald-ink)] text-white shadow-sm'
                            : 'border-[var(--rule)] bg-white hover:border-[var(--green-900)]'
                        }`}
                        onClick={() => togglePacked(item.id)}
                        aria-label={`Mark ${item.name} as packed`}
                      >
                        {item.packed && <Check size={12} strokeWidth={3} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span
                            className={`text-xs font-semibold truncate max-w-[130px] sm:max-w-xs md:max-w-sm ${
                              item.packed ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--green-900)]'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.essential && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-[4px] font-bold bg-[var(--cream)] text-[var(--green-900)] border border-[var(--rule)] shrink-0">
                              Essential
                            </span>
                          )}
                          {item.owner && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-[4px] font-medium bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)] shrink-0">
                              {item.owner}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--ink-muted)] mt-0.5 truncate font-mono">
                          {item.category} · {formatWeight(calculateItemWeight(item))}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quantity Stepper + Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <div className="flex items-center bg-[var(--paper)] rounded-[4px] border border-[var(--rule)] p-0.5 font-mono text-xs">
                        <button
                          className="p-1 text-[var(--ink-muted)] hover:text-[var(--green-900)] cursor-pointer"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <span className="px-1.5 font-bold text-[var(--green-900)]">
                          {item.quantity}
                        </span>
                        <button
                          className="p-1 text-[var(--ink-muted)] hover:text-[var(--green-900)] cursor-pointer"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <ChevronUp size={12} />
                        </button>
                      </div>

                      <button
                        className="p-1.5 text-gray-400 hover:text-[var(--green-900)] rounded-[4px] transition-colors"
                        onClick={() => setEditingItem(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        className="p-1.5 text-gray-400 hover:text-[var(--coral)] rounded-[4px] transition-colors"
                        onClick={() => deleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar: Luggage Panel & Optimizer (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            {/* Luggage Weight Panel */}
            <div className="rounded-[12px] bg-white border border-[var(--rule)] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center border border-[var(--rule)]">
                    <Luggage size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--emerald-ink)] block">
                      SUITCASE GAUGE
                    </span>
                    <h3 className="text-sm font-bold text-[var(--green-900)]">{bagName}</h3>
                  </div>
                </div>
                <button
                  className="btn btn-ghost text-xs text-[var(--green-900)] hover:bg-[var(--polar)] p-1.5 rounded-[6px]"
                  onClick={() => setShowLuggageModal(true)}
                  title="Configure luggage specs"
                >
                  <Settings size={15} />
                </button>
              </div>

              {/* Analog Luggage Scale Gauge Metaphor */}
              <div className="py-2 flex justify-center">
                <LuggageScaleGauge
                  currentWeightKg={packedWeight}
                  maxWeightKg={baggageLimit}
                />
              </div>

              {/* Bag Dimensions Strip */}
              <div className="p-2.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] text-[11px] text-[var(--ink-muted)] font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <strong className="text-[var(--green-900)]">{bagLength} × {bagWidth} × {bagHeight} cm</strong>
                </div>
                <div className="flex justify-between">
                  <span>Est. Unpacked:</span>
                  <strong>{estimatedWeight.toFixed(1)} kg</strong>
                </div>
              </div>

              {/* Actions: AI Weight Check */}
              <div className="pt-2">
                <button
                  className="btn btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2"
                  onClick={optimizeBag}
                  disabled={optimizing}
                >
                  {optimizing ? <Loader2 size={14} className="animate-spin" /> : <Weight size={14} />}
                  <span>Check my bag</span>
                </button>
              </div>

              {/* Optimization Results */}
              {optimizeResults.length > 0 && (
                <div className="mt-3 p-3.5 rounded-[6px] bg-[var(--cream)]/70 border border-[var(--rule)] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[var(--green-900)]">
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase">
                      <Sparkles size={12} />
                      <span>RECOMMENDATIONS</span>
                    </span>
                    <button
                      onClick={() => setOptimizeResults([])}
                      className="text-[10px] text-[var(--ink-muted)] hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {optimizeResults.map((r) => (
                      <div
                        key={r.itemId}
                        className="p-2 rounded-[4px] bg-white border border-[var(--rule)] flex items-center justify-between gap-2"
                      >
                        <span className="text-[11px] text-[var(--ink)] leading-snug">{r.reason}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-mono font-bold uppercase shrink-0 ${
                            r.decision === 'remove'
                              ? 'bg-[var(--coral)]/20 text-[var(--coral)]'
                              : 'bg-[var(--polar)] text-[var(--green-900)]'
                          }`}
                        >
                          {r.decision}
                        </span>
                      </div>
                    ))}
                  </div>

                  {optimizeResults.some((r) => r.decision === 'remove') && (
                    <button
                      onClick={applyOptimization}
                      className="btn btn-primary text-xs font-bold w-full py-1.5 mt-1"
                    >
                      Apply Recommended Removals
                    </button>
                  )}
                </div>
              )}

              {/* Physical Airline Baggage Claim Tag */}
              <div className="pt-4 border-t border-[var(--rule)]">
                <span className="text-[10px] font-mono uppercase font-bold text-[var(--ink-muted)] block text-center mb-2 tracking-[0.14em]">
                  PHYSICAL BAGGAGE CLAIM TAG
                </span>
                <LuggageBaggageTag
                  destination={trip.destination}
                  route={routeMeta.route}
                  destinationCode={routeMeta.code}
                  passengerName={trip.members[0]?.name || 'TRAVELER'}
                  currentWeightKg={packedWeight}
                  maxWeightKg={baggageLimit}
                  bagType={bagName}
                />
              </div>
            </div>

            {/* Ask PackPal About Your Bag */}
            <div className="rounded-[12px] bg-white border border-[var(--rule)] p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-ink)] font-mono block">
                LUGGAGE ADVISOR
              </span>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Can I fit extra shoes?"
                  value={advisorQuery}
                  onChange={(e) => setAdvisorQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
                  className="input flex-1 text-xs py-1.5"
                />
                <button
                  className="btn btn-secondary text-xs px-3"
                  onClick={() => handleAskAdvisor()}
                  disabled={advisorLoading}
                >
                  {advisorLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>

              {advisorResponse && (
                <div className="p-2.5 rounded-[6px] bg-[var(--polar)] border border-[var(--emerald-ink)]/30 text-xs text-[var(--green-900)] flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-[var(--emerald-ink)] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{advisorResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Luggage Setup Modal ── */}
      {showLuggageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-[12px] p-5 sm:p-6 border border-[var(--rule)] space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
              <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Configure Luggage Allowance
              </h3>
              <button onClick={() => setShowLuggageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="label">Bag Type Preset</label>
              <div className="grid grid-cols-2 gap-2">
                {LUGGAGE_PRESETS.map((p) => (
                  <button
                    key={p.type}
                    type="button"
                    className={`p-2.5 rounded-[6px] text-left text-xs font-semibold border transition-colors cursor-pointer ${
                      bagType === p.type
                        ? 'border-[var(--green-900)] bg-[var(--polar)] text-[var(--green-900)]'
                        : 'border-[var(--rule)] text-[var(--ink)] hover:border-[var(--green-900)]'
                    }`}
                    onClick={() => {
                      setBagType(p.type);
                      setBagName(p.name);
                      setBagMaxWeight(p.maxWeightKg);
                      setBagLength(p.dims.l);
                      setBagWidth(p.dims.w);
                      setBagHeight(p.dims.h);
                    }}
                  >
                    <span className="block font-bold">{p.name}</span>
                    <span className="text-[10px] text-[var(--ink-muted)]">{p.maxWeightKg} kg · {p.dims.l}x{p.dims.w}x{p.dims.h} cm</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Bag Name</label>
                <input
                  type="text"
                  value={bagName}
                  onChange={(e) => setBagName(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="label">Max Weight Limit (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={bagMaxWeight}
                  onChange={(e) => setBagMaxWeight(Number(e.target.value))}
                  className="input w-full font-mono"
                />
              </div>

              <div>
                <label className="label">Dimensions (L × W × H in cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Length"
                    value={bagLength}
                    onChange={(e) => setBagLength(Number(e.target.value))}
                    className="input w-full text-center font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={bagWidth}
                    onChange={(e) => setBagWidth(Number(e.target.value))}
                    className="input w-full text-center font-mono"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={bagHeight}
                    onChange={(e) => setBagHeight(Number(e.target.value))}
                    className="input w-full text-center font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button
                className="btn btn-secondary text-xs px-3 py-1.5"
                onClick={() => setShowLuggageModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-1.5"
                onClick={handleSaveLuggage}
              >
                Save Luggage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Custom Category Modal ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-[12px] p-5 border border-[var(--rule)] space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
              <h3 className="text-sm font-bold text-[var(--green-900)]">
                Create Custom Category
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="label">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Photography, Scuba, Winter Gear"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="input w-full text-xs"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-1.5"
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Manual Item Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-[12px] p-5 sm:p-6 border border-[var(--rule)] space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
              <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Add Item to Suitcase
              </h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Waterproof Phone Pouch"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="input w-full capitalize"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Math.max(1, Number(e.target.value)))}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Assigned Traveler</label>
                  <select
                    value={newItemOwner}
                    onChange={(e) => setNewItemOwner(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Unassigned</option>
                    {trip.members.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Unit Weight (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newItemWeight}
                    onChange={(e) => setNewItemWeight(Number(e.target.value))}
                    className="input w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-1.5"
                onClick={addManualItem}
                disabled={!newItemName.trim()}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Item Modal ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-[12px] p-5 sm:p-6 border border-[var(--rule)] space-y-4 shadow-lg my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
              <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Edit Item
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="input w-full capitalize"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: Math.max(1, Number(e.target.value)) })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Assigned Traveler</label>
                  <select
                    value={editingItem.owner || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, owner: e.target.value || undefined })}
                    className="input w-full"
                  >
                    <option value="">Unassigned</option>
                    {trip.members.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Unit Weight (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingItem.weightEstimateKg}
                    onChange={(e) => setEditingItem({ ...editingItem, weightEstimateKg: Number(e.target.value) })}
                    className="input w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={() => setEditingItem(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs font-bold px-4 py-1.5"
                onClick={handleUpdateItem}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
