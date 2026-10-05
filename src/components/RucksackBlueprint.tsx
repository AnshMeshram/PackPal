'use client';

import React, { useState } from 'react';
import { PackingItem } from '@/types';
import { calculateItemWeight } from '@/lib/packing/weights';
import { ShieldCheck, Info, Compass } from 'lucide-react';

interface RucksackBlueprintProps {
  items: PackingItem[];
  bagName?: string;
  maxWeightKg?: number;
}

interface PackZone {
  id: string;
  name: string;
  subtitle: string;
  idealPercent: string;
  color: string;
  bgColor: string;
  accentBorder: string;
  description: string;
}

const ZONES: PackZone[] = [
  {
    id: 'top',
    name: 'ZONE 4: PACK BRAIN / TOP LID',
    subtitle: 'Lightweight & Urgent Access',
    idealPercent: '10–15%',
    color: '#F59E0B',
    bgColor: '#1E293B',
    accentBorder: '#F59E0B',
    description: 'First aid, sunglasses, headlamp, passport, trail snacks, tickets.',
  },
  {
    id: 'outer',
    name: 'ZONE 3: EXTERNAL POCKETS & BUNGEE',
    subtitle: 'Medium Weight & Trail Gear',
    idealPercent: '15–20%',
    color: '#06B6D4',
    bgColor: '#1E293B',
    accentBorder: '#06B6D4',
    description: 'Water bottle, rain shell jacket, sandals, folded topographic maps.',
  },
  {
    id: 'core',
    name: 'ZONE 2: CORE SPINE / LUMBAR DECK',
    subtitle: 'Heaviest Items Flush Against Back',
    idealPercent: '45–55%',
    color: '#10B981',
    bgColor: '#1E293B',
    accentBorder: '#10B981',
    description: 'Heavy denim, outerwear, footwear, electronics, chargers, dense toiletries.',
  },
  {
    id: 'bottom',
    name: 'ZONE 1: BASE COMPARTMENT',
    subtitle: 'Soft Shock Absorbing Foundation',
    idealPercent: '15–25%',
    color: '#A78BFA',
    bgColor: '#1E293B',
    accentBorder: '#A78BFA',
    description: 'Sleeping bag, thermal base layers, camp slippers, extra wool socks.',
  },
];

export function RucksackBlueprint({
  items,
  bagName = 'Expedition Rucksack',
  maxWeightKg = 7,
}: RucksackBlueprintProps) {
  const [selectedZone, setSelectedZone] = useState<string>('core');

  // Categorize packed items into 4 zones based on category and name keywords
  const zoneItems: Record<string, PackingItem[]> = {
    top: [],
    outer: [],
    core: [],
    bottom: [],
  };

  items.forEach((item) => {
    const cat = (item.category || '').toLowerCase();
    const name = item.name.toLowerCase();

    if (
      cat === 'documents' ||
      cat === 'health' ||
      name.includes('passport') ||
      name.includes('med') ||
      name.includes('glasses') ||
      name.includes('sunscreen') ||
      name.includes('headlamp') ||
      name.includes('first aid')
    ) {
      zoneItems.top.push(item);
    } else if (
      cat === 'beach' ||
      name.includes('jacket') ||
      name.includes('rain') ||
      name.includes('umbrella') ||
      name.includes('water') ||
      name.includes('bottle') ||
      name.includes('towel') ||
      name.includes('map')
    ) {
      zoneItems.outer.push(item);
    } else if (
      cat === 'electronics' ||
      cat === 'gear' ||
      name.includes('laptop') ||
      name.includes('shoe') ||
      name.includes('boot') ||
      name.includes('jean') ||
      name.includes('pant') ||
      name.includes('charger') ||
      name.includes('camera')
    ) {
      zoneItems.core.push(item);
    } else {
      // Bottom / soft clothing / underwear / base layer
      zoneItems.bottom.push(item);
    }
  });

  // Calculate weights per zone
  const getZoneWeight = (zoneKey: string) => {
    return zoneItems[zoneKey].reduce(
      (sum, item) => sum + calculateItemWeight(item),
      0
    );
  };


  const totalCalculatedWeight =
    getZoneWeight('top') +
    getZoneWeight('outer') +
    getZoneWeight('core') +
    getZoneWeight('bottom');

  const corePercent =
    totalCalculatedWeight > 0
      ? Math.round((getZoneWeight('core') / totalCalculatedWeight) * 100)
      : 50;

  const isErgonomic = corePercent >= 40 && corePercent <= 65;

  return (
    <div className="rounded-[14px] bg-[#0A192F] border-2 border-[#1E3A8A] p-4 sm:p-5 text-[#E2E8F0] shadow-xl relative overflow-hidden font-mono text-xs">
      {/* Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #60A5FA 1px, transparent 1px), radial-gradient(circle, #60A5FA 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Blueprint Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-[#1E3A8A]">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#60A5FA] block">
            TECHNICAL RUCKSACK SCHEMATIC · DRAFT DWG-40
          </span>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {bagName.toUpperCase()} · 4-ZONE WEIGHT ANATOMY
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border ${
              isErgonomic
                ? 'bg-[#064E3B] text-[#34D399] border-[#059669]'
                : 'bg-[#78350F] text-[#FBBF24] border-[#D97706]'
            }`}
          >
            <ShieldCheck size={12} />
            <span>
              {isErgonomic
                ? 'ERGONOMIC CENTER OF GRAVITY (T8-L2)'
                : 'FRONT HEAVY · ADJUST SPINE LOAD'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Blueprint Cross-Section Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Cutaway Backpack Representation */}
        <div className="md:col-span-5 bg-[#071324] border border-[#1E3A8A] rounded-[10px] p-3 flex flex-col items-center">
          <span className="text-[9px] text-[#64748B] uppercase tracking-wider mb-2 font-bold">
            CROSS-SECTION ELEVATION
          </span>

          {/* Graphical Cutaway Pack Frame */}
          <div className="w-full max-w-[210px] border-2 border-[#38BDF8] rounded-t-[32px] rounded-b-[18px] p-1.5 space-y-1.5 bg-[#0B1E38]/80 shadow-inner">
            {ZONES.map((zone) => {
              const count = zoneItems[zone.id].length;
              const weight = getZoneWeight(zone.id);
              const isSelected = selectedZone === zone.id;

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full text-left p-2 rounded transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-white ring-1 ring-white/50 bg-[#1E293B]'
                      : 'border-white/10 hover:border-white/30 bg-[#0F172A]/70'
                  }`}
                  style={{
                    borderLeftColor: zone.accentBorder,
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold truncate"
                      style={{ color: zone.color }}
                    >
                      {zone.name.split(':')[1]?.trim() || zone.name}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] font-bold">
                      {weight.toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#64748B] mt-0.5">
                    <span>{count} items</span>
                    <span>Target: {zone.idealPercent}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dimension Footnotes */}
          <div className="mt-3 text-[9px] text-[#64748B] text-center space-y-0.5">
            <div>ALLOWANCE LIMIT: {maxWeightKg} KG MAX</div>
            <div>TORSO FIT: ADJUSTABLE 46–54 CM</div>
          </div>
        </div>

        {/* Right Detail Inspection Panel */}
        <div className="md:col-span-7 bg-[#071324] border border-[#1E3A8A] rounded-[10px] p-4 flex flex-col justify-between min-h-[260px]">
          {(() => {
            const activeZone = ZONES.find((z) => z.id === selectedZone) || ZONES[0];
            const activeList = zoneItems[activeZone.id] || [];
            const activeWeight = getZoneWeight(activeZone.id);

            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-[#1E3A8A] pb-2">
                  <div>
                    <span
                      className="text-xs font-bold block"
                      style={{ color: activeZone.color }}
                    >
                      {activeZone.name}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {activeZone.subtitle}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">
                      {activeWeight.toFixed(2)} kg
                    </span>
                    <span className="text-[9px] text-[#64748B]">
                      {activeList.length} items logged
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0A192F] border border-[#1E3A8A]/50 text-[10px] text-[#94A3B8] leading-relaxed flex items-start gap-2">
                  <Info size={13} className="text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Field Packing Logic: </strong>
                    {activeZone.description}
                  </div>
                </div>

                {/* Items in this zone */}
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#64748B] block mb-1.5">
                    ASSIGNED TRAVEL GEAR IN THIS ZONE:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {activeList.length === 0 ? (
                      <p className="text-[10px] text-[#64748B] italic py-2">
                        No items assigned to this zone yet. Add gear to your packing checklist.
                      </p>
                    ) : (
                      activeList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-1 px-2 rounded bg-[#0F172A] border border-[#1E293B] text-[10px]"
                        >
                          <span className="truncate text-white">
                            {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                          </span>
                          <span className="text-[#94A3B8] font-mono shrink-0 ml-2">
                            {calculateItemWeight(item).toFixed(2)} kg
                          </span>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Footer Mechanical Alignment Tip */}
          <div className="mt-4 pt-2 border-t border-[#1E3A8A] flex items-center justify-between text-[9px] text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <Compass size={11} className="text-[#60A5FA]" />
              <span>SPINE DRAFT: ISO-11228 MANUAL LOAD ERGONOMICS</span>
            </div>
            <span className="text-[#38BDF8]">BLUEPRINT VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
