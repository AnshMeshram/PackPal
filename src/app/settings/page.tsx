'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cpu,
  Shield,
  Database,
  Cloud,
  Volume2,
  Save,
  Compass,
  Luggage,
  Sparkles,
  Plus,
  X,
  Sliders,
} from 'lucide-react';
import { StatusDot } from '@/components/StatusDot';
import { PackPalIcon } from '@/components/PackPalIcon';
import {
  loadCustomSettings,
  saveCustomSettings,
  CustomSettings,
} from '@/lib/storage/settings';

const POPULAR_DIETARY = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Jain', 'No Seafood', 'Nut Allergy', 'Halal'];

export default function SettingsPage() {
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState<CustomSettings>(() => loadCustomSettings());
  const [userName, setUserName] = useState('Ansh');
  const [newRule, setNewRule] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newDietary, setNewDietary] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  // Live Service Diagnostics State
  const [checkingDiagnostics, setCheckingDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    gemma: { status: 'checking', label: 'Checking Ollama...' },
    serpapi: { status: 'checking', label: 'Checking SerpApi...' },
    mongodb: { status: 'checking', label: 'Checking MongoDB Atlas...' },
    elevenlabs: { status: 'checking', label: 'Checking ElevenLabs...' },
  });

  const runDiagnostics = useCallback(async () => {
    setCheckingDiagnostics(true);

    // 1. Check Weather / SerpApi
    try {
      const weatherRes = await fetch('/api/weather?destination=Goa');
      const wData = await weatherRes.json();
      setDiagnostics((prev) => ({
        ...prev,
        serpapi: {
          status: wData.weather?.source === 'live' ? 'online' : 'fallback',
          label: wData.weather?.source === 'live' ? 'Live Google Search Active' : 'Seasonal Fallback Mode (No API key)',
        },
      }));
    } catch {
      setDiagnostics((prev) => ({
        ...prev,
        serpapi: { status: 'fallback', label: 'Seasonal Fallback Active' },
      }));
    }

    // 2. Check Ollama / Gemma 2
    try {
      const gemmaRes = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [], baggageLimitKg: 7, tripContext: 'health-check' }),
      });
      const gData = await gemmaRes.json();
      setDiagnostics((prev) => ({
        ...prev,
        gemma: {
          status: gData.source === 'ai' ? 'online' : 'fallback',
          label: gData.source === 'ai' ? 'Gemma 2 Inference Active (Port 11434)' : 'Built-in Deterministic Rules Active',
        },
      }));
    } catch {
      setDiagnostics((prev) => ({
        ...prev,
        gemma: { status: 'fallback', label: 'Deterministic Heuristic Fallback Active' },
      }));
    }

    // 3. Local persistence & ElevenLabs status
    setDiagnostics((prev) => ({
      ...prev,
      mongodb: {
        status: 'online',
        label: 'Local Storage Engine (100% Offline-Ready)',
      },
      elevenlabs: {
        status: 'optional',
        label: 'Optional Voice Synthesis (Multilingual v2)',
      },
    }));

    setCheckingDiagnostics(false);
  }, []);

  useEffect(() => {
    document.title = 'Settings · PackPal';
    const loaded = loadCustomSettings();
    setSettings(loaded);

    const savedPrefs = localStorage.getItem('packpal_user_prefs');
    if (savedPrefs) {
      try {
        const p = JSON.parse(savedPrefs);
        if (p.userName) setUserName(p.userName);
      } catch {
        // ignore
      }
    }

    runDiagnostics();
  }, [runDiagnostics]);

  const handleSave = () => {
    saveCustomSettings(settings);
    localStorage.setItem(
      'packpal_user_prefs',
      JSON.stringify({
        userName,
        defaultStyle: settings.defaultTripType,
        defaultBaggage: settings.defaultBaggageLimitKg,
        currency: settings.currency,
        travelStyle: settings.travelStyle,
      })
    );
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const addPackingRule = () => {
    const text = newRule.trim();
    if (text && !settings.packingRules.includes(text)) {
      setSettings((prev) => ({ ...prev, packingRules: [...prev.packingRules, text] }));
      setNewRule('');
    }
  };

  const removePackingRule = (idx: number) => {
    setSettings((prev) => ({
      ...prev,
      packingRules: prev.packingRules.filter((_, i) => i !== idx),
    }));
  };

  const addActivity = () => {
    const text = newActivity.trim();
    if (text && !settings.favoriteActivities.includes(text)) {
      setSettings((prev) => ({ ...prev, favoriteActivities: [...prev.favoriteActivities, text] }));
      setNewActivity('');
    }
  };

  const removeActivity = (text: string) => {
    setSettings((prev) => ({
      ...prev,
      favoriteActivities: prev.favoriteActivities.filter((a) => a !== text),
    }));
  };

  const toggleDietary = (item: string) => {
    setSettings((prev) => {
      const exists = prev.dietaryPreferences.includes(item);
      return {
        ...prev,
        dietaryPreferences: exists
          ? prev.dietaryPreferences.filter((d) => d !== item)
          : [...prev.dietaryPreferences, item],
      };
    });
  };

  const addCustomDietary = () => {
    const text = newDietary.trim();
    if (text && !settings.dietaryPreferences.includes(text)) {
      setSettings((prev) => ({ ...prev, dietaryPreferences: [...prev.dietaryPreferences, text] }));
      setNewDietary('');
    }
  };

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-20">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-[var(--rule)] bg-[var(--paper)]/95 sticky top-0 z-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            className="btn btn-ghost btn-sm p-1.5 text-[var(--green-900)] hover:bg-[var(--polar)] rounded-[6px] shrink-0"
            onClick={() => router.push('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </button>
          <PackPalIcon size={30} />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Settings
            </h1>
            <p className="text-xs text-[var(--ink-muted)] truncate hidden sm:block">
              Preferences, custom packing rules, and local AI engine diagnostics
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary text-xs font-bold px-3.5 sm:px-4 py-2 flex items-center gap-1.5 shrink-0"
          onClick={handleSave}
        >
          <Save size={14} />
          <span className="hidden sm:inline">Save Preferences</span>
          <span className="sm:hidden">Save</span>
        </button>
      </header>

      {savedToast && (
        <div className="bg-[var(--emerald)] text-[var(--green-900)] font-bold text-xs py-2 px-6 text-center animate-fade-in">
          ✓ Settings updated and stored locally
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
        {/* ── Section 1: My Defaults ── */}
        <div className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--rule)]">
            <Compass size={18} className="text-[var(--emerald-ink)]" />
            <h2 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              My Defaults
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1">Lead Traveler Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input w-full text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1">Default Baggage Limit</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={settings.defaultBaggageLimitKg}
                  onChange={(e) => setSettings({ ...settings, defaultBaggageLimitKg: Number(e.target.value) || 7 })}
                  className="input w-full text-xs font-mono"
                />
                <span className="font-mono text-xs font-bold text-[var(--green-900)] uppercase">{settings.preferredUnit}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1">Preferred Unit</label>
              <select
                value={settings.preferredUnit}
                onChange={(e) => setSettings({ ...settings, preferredUnit: e.target.value as 'kg' | 'lbs' })}
                className="input w-full text-xs"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1">Preferred Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="input w-full text-xs"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee (Default)</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1">Default Trip Style</label>
              <select
                value={settings.defaultTripType}
                onChange={(e) => setSettings({ ...settings, defaultTripType: e.target.value })}
                className="input w-full text-xs"
              >
                <option value="vacation">Vacation</option>
                <option value="adventure">Adventure</option>
                <option value="backpacking">Backpacking</option>
                <option value="business">Business</option>
                <option value="conference">Conference</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1">Travel Persona</label>
              <input
                type="text"
                value={settings.travelStyle}
                onChange={(e) => setSettings({ ...settings, travelStyle: e.target.value })}
                placeholder="e.g. Relaxed Explorer"
                className="input w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: My Packing Rules (P5 Core) ── */}
        <div className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
            <div className="flex items-center gap-2">
              <Luggage size={18} className="text-[var(--emerald-ink)]" />
              <h2 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                My Packing Rules
              </h2>
            </div>
            <span className="text-[11px] text-[var(--ink-muted)] font-mono">
              Injected into Gemma 2 recommendations
            </span>
          </div>

          <p className="text-xs text-[var(--ink-muted)]">
            Personal rules PackPal will always remember when generating packing lists for you:
          </p>

          <div className="space-y-2">
            {settings.packingRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between text-xs gap-3 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald-ink)] shrink-0" />
                  <span className="font-medium text-[var(--green-900)]">{rule}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removePackingRule(idx)}
                  className="text-[var(--coral)] hover:opacity-80 p-1"
                  aria-label="Remove rule"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Rule Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPackingRule()}
              placeholder="e.g. Always remind me about sunscreen, or I always carry a sketchbook"
              className="input flex-1 text-xs"
            />
            <button
              type="button"
              onClick={addPackingRule}
              className="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        {/* ── Section 3: Favorite Activities & Dietary ── */}
        <div className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--rule)]">
            <Sparkles size={18} className="text-[var(--emerald-ink)]" />
            <h2 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              My Travel Style & Preferences
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[var(--ink)] block mb-1.5">Dietary Restrictions & Preferences</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {POPULAR_DIETARY.map((d) => {
                  const active = settings.dietaryPreferences.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDietary(d)}
                      className={`px-2.5 py-1 rounded-[6px] border text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[var(--green-900)] text-white border-[var(--green-900)]'
                          : 'bg-[var(--paper)] text-[var(--ink)] border-[var(--rule)] hover:border-[var(--green-900)]'
                      }`}
                    >
                      {active ? `✓ ${d}` : d}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDietary}
                  onChange={(e) => setNewDietary(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomDietary()}
                  placeholder="Add custom dietary note..."
                  className="input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={addCustomDietary}
                  className="btn btn-secondary text-xs px-3 py-2"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--rule)]">
              <label className="font-semibold text-[var(--ink)] block mb-1.5">Favorite Activities</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {settings.favoriteActivities.map((act) => (
                  <span
                    key={act}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--polar)] text-[var(--green-900)] border border-[var(--rule)] text-xs font-medium"
                  >
                    <span>{act}</span>
                    <button
                      type="button"
                      onClick={() => removeActivity(act)}
                      className="text-[var(--coral)] hover:opacity-80"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addActivity()}
                  placeholder="Add activity (e.g. Scuba Diving, Cafe Hopping)..."
                  className="input flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={addActivity}
                  className="btn btn-secondary text-xs px-3 py-2"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: App Guidance & AI Toggles ── */}
        <div className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--rule)]">
            <Sliders size={18} className="text-[var(--emerald-ink)]" />
            <h2 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Guidance & AI Controls
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] cursor-pointer hover:bg-[var(--polar)]/50 transition-colors">
              <div>
                <span className="font-bold text-[var(--green-900)] block">Weather Guidance</span>
                <span className="text-[11px] text-[var(--ink-muted)] block mt-0.5">
                  Fetch live weather forecast and packing suggestions via SerpApi Google search
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showWeatherGuidance}
                onChange={(e) => setSettings({ ...settings, showWeatherGuidance: e.target.checked })}
                className="w-4 h-4 accent-[var(--green-900)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] cursor-pointer hover:bg-[var(--polar)]/50 transition-colors">
              <div>
                <span className="font-bold text-[var(--green-900)] block">AI Recommendations</span>
                <span className="text-[11px] text-[var(--ink-muted)] block mt-0.5">
                  Enable Gemma 2 local inference for intelligent luggage coaching and destination suggestions
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showAiSuggestions}
                onChange={(e) => setSettings({ ...settings, showAiSuggestions: e.target.checked })}
                className="w-4 h-4 accent-[var(--green-900)]"
              />
            </label>
          </div>
        </div>

        {/* ── Section 5: Technology Diagnostics ── */}
        <div className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-[var(--emerald-ink)]" />
              <h2 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Technology Status Center
              </h2>
            </div>
            <button
              className="text-xs font-semibold text-[var(--emerald-ink)] hover:underline"
              onClick={runDiagnostics}
              disabled={checkingDiagnostics}
            >
              {checkingDiagnostics ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Gemma 2 */}
            <div className="p-3.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-[var(--polar)] flex items-center justify-center text-[var(--green-900)] shrink-0 mt-0.5 border border-[var(--rule)]">
                <Cpu size={16} />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[var(--green-900)] block">Gemma 2 (Ollama)</span>
                <span className="text-[11px] text-[var(--ink-muted)] block">{diagnostics.gemma.label}</span>
                <StatusDot
                  status={diagnostics.gemma.status === 'online' ? 'live' : 'fallback'}
                  label={diagnostics.gemma.status === 'online' ? 'Local Inference Active' : 'Deterministic Rules Active'}
                />
              </div>
            </div>

            {/* SerpApi */}
            <div className="p-3.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-[var(--polar)] flex items-center justify-center text-[var(--green-900)] shrink-0 mt-0.5 border border-[var(--rule)]">
                <Cloud size={16} />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[var(--green-900)] block">SerpApi Search & Images</span>
                <span className="text-[11px] text-[var(--ink-muted)] block">{diagnostics.serpapi.label}</span>
                <StatusDot
                  status={diagnostics.serpapi.status === 'online' ? 'live' : 'fallback'}
                  label={diagnostics.serpapi.status === 'online' ? 'Live SerpApi Connected' : 'Curated Registry Active'}
                />
              </div>
            </div>

            {/* Persistence */}
            <div className="p-3.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-[var(--polar)] flex items-center justify-center text-[var(--green-900)] shrink-0 mt-0.5 border border-[var(--rule)]">
                <Database size={16} />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[var(--green-900)] block">Data Persistence</span>
                <span className="text-[11px] text-[var(--ink-muted)] block">{diagnostics.mongodb.label}</span>
                <StatusDot
                  status="live"
                  label="Local Storage Engine (Offline-Ready)"
                />
              </div>
            </div>

            {/* ElevenLabs */}
            <div className="p-3.5 rounded-[6px] bg-[var(--paper)] border border-[var(--rule)] flex items-start gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-[var(--polar)] flex items-center justify-center text-[var(--green-900)] shrink-0 mt-0.5 border border-[var(--rule)]">
                <Volume2 size={16} />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[var(--green-900)] block">ElevenLabs Voice</span>
                <span className="text-[11px] text-[var(--ink-muted)] block">{diagnostics.elevenlabs.label}</span>
                <StatusDot
                  status="optional"
                  label="Optional Audio Synthesis"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 6: Open-Source AI Disclosure ── */}
        <div className="p-6 rounded-[12px] bg-[var(--polar)] border border-[var(--rule)] text-xs text-[var(--green-900)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Shield size={16} className="text-[var(--emerald-ink)]" />
            <span>Open Innovation & Local Privacy</span>
          </div>
          <p className="leading-relaxed text-[var(--ink)]">
            PackPal connects to <strong>Ollama</strong> running <strong>Gemma 2</strong> at <code>http://localhost:11434</code>.
            Because inference runs on your machine, your private trip dates, friend lists, and financial expenses are never sent
            to proprietary third-party LLMs.
          </p>
        </div>
      </div>
    </div>
  );
}
