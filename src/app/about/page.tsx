'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Cpu, Shield, CloudSun, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 page-enter min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-16">
      <title>About · PackPal</title>

      {/* Header */}
      <header className="px-6 py-4 border-b border-[var(--rule)] bg-[var(--paper)] sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-ghost btn-sm p-1.5 text-[var(--green-900)] hover:bg-[var(--polar)] rounded-[6px]"
            onClick={() => router.push('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              How PackPal works
            </h1>
            <p className="text-xs text-[var(--ink-muted)]">
              Architecture, local intelligence, and data privacy disclosures
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Core Philosophy */}
        <section className="space-y-3">
          <div className="text-[11px] font-bold tracking-widest text-[var(--green-900)] uppercase">
            01 — PHILOSOPHY
          </div>
          <h2 className="text-2xl font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Smart travel planning, without handing your whole trip to a black box.
          </h2>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            Most travel planning apps require you to upload your personal itineraries, private flight details, and expense records to closed cloud servers. PackPal is architected from the ground up to place open-source local AI directly on your machine.
          </p>
        </section>

        {/* Local AI Architecture */}
        <section className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-[var(--emerald-ink)]" />
            <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Local Inference with Gemma 2 & Ollama
            </h3>
          </div>
          <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
            PackPal connects directly to an Ollama daemon running Google&apos;s open-source <strong>Gemma 2</strong> model locally at <code className="px-1.5 py-0.5 rounded bg-[var(--polar)] text-[var(--green-900)] font-mono text-[11px]">http://localhost:11434</code>.
          </p>

          <div className="p-3.5 rounded-[6px] bg-[var(--polar)] border border-[var(--rule)] text-xs text-[var(--green-900)] space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-[var(--emerald-ink)]" />
              <span>What runs locally on your machine:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[var(--ink)]">
              <li>Personalized packing checklist generation</li>
              <li>Luggage weight optimization recommendations (Keep, Remove, Swap)</li>
              <li>Natural language expense interpretation and category tagging</li>
              <li>Natural language trip duration and activity change detection</li>
              <li>All financial balance arithmetic and greedy debt minimization (pure TypeScript integer paise)</li>
            </ul>
          </div>
        </section>

        {/* External Services Disclosure */}
        <section className="p-6 rounded-[12px] bg-white border border-[var(--rule)] space-y-4">
          <div className="flex items-center gap-2">
            <CloudSun size={18} className="text-[var(--green-900)]" />
            <h3 className="text-base font-bold text-[var(--green-900)]" style={{ fontFamily: 'var(--font-heading)' }}>
              External Service Boundaries (Honest Disclosures)
            </h3>
          </div>
          <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
            We believe in complete transparency. We do not make false claims like &ldquo;no data ever leaves your device&rdquo;. The following two external services are utilized when configured:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-[6px] bg-[var(--cream)]/40 border border-[var(--rule)] text-xs space-y-1">
              <div className="font-bold text-[var(--green-900)]">SerpApi (Live Destination Weather)</div>
              <p className="text-[var(--ink-muted)]">
                Fetches public live Google weather and forecast results for your destination. Only the destination name (e.g., &ldquo;Goa&rdquo;) is transmitted server-side. No traveler names, dates, or personal details are ever sent to SerpApi.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[var(--cream)]/40 border border-[var(--rule)] text-xs space-y-1">
              <div className="font-bold text-[var(--green-900)]">MongoDB Atlas (Optional Cloud Persistence)</div>
              <p className="text-[var(--ink-muted)]">
                If configured, trip records are synchronized to your designated MongoDB database. If offline or unconfigured, PackPal immediately falls back to your browser&apos;s local storage with zero data loss.
              </p>
            </div>
          </div>
        </section>

        {/* Fallback Guarantee */}
        <section className="p-4 rounded-[6px] border border-[var(--rule)] bg-[var(--polar)] text-xs text-[var(--green-900)] flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-[var(--emerald-ink)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Full Offline & Graceful Fallback:</strong> If Ollama, SerpApi, or MongoDB are offline, PackPal activates its built-in TypeScript travel engine and local device storage automatically.
          </p>
        </section>
      </main>
    </div>
  );
}
