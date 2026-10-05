'use client';

import React, { useState } from 'react';
import { Compass as CompassIcon, Mountain, MapPin, Gauge } from 'lucide-react';

interface AltimeterCompassProps {
  headingDeg?: number;
  cardinal?: string;
  elevationMeters?: number;
  coordinates?: string;
  locationName?: string;
  pressureHpa?: number;
}

export function AltimeterCompass({
  headingDeg = 348,
  cardinal = 'NNW',
  elevationMeters = 2050,
  coordinates = '32.24° N, 77.19° E',
  locationName = 'Manali Waypoint',
  pressureHpa = 1018,
}: AltimeterCompassProps) {
  const [unit, setUnit] = useState<'m' | 'ft'>('m');

  const elevationDisplay = unit === 'm'
    ? `${elevationMeters.toLocaleString()} m`
    : `${Math.round(elevationMeters * 3.28084).toLocaleString()} ft`;

  // Determine altitude band
  const altitudeBand = elevationMeters > 2500
    ? 'HIGH ALPINE ZONE'
    : elevationMeters > 1000
    ? 'SUB-ALPINE FOOTHILLS'
    : elevationMeters > 200
    ? 'TEMPERATE UPLANDS'
    : 'COASTAL SEA LEVEL';

  // Altimeter dial needle rotation (scaled 0-5000m -> 0-360deg)
  const altimeterAngle = Math.min(360, (elevationMeters / 4000) * 360);

  return (
    <div className="rounded-[12px] bg-[#14231E] border-2 border-[#8E784B] text-[#EDE8D0] p-4 sm:p-5 shadow-lg relative overflow-hidden font-sans">
      {/* Brass Screws at 4 corners */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#C2A368] border border-[#523F1C] flex items-center justify-center opacity-80 shadow-xs">
        <div className="w-1.5 h-[1px] bg-[#523F1C] rotate-45" />
      </div>
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#C2A368] border border-[#523F1C] flex items-center justify-center opacity-80 shadow-xs">
        <div className="w-1.5 h-[1px] bg-[#523F1C] -rotate-45" />
      </div>
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#C2A368] border border-[#523F1C] flex items-center justify-center opacity-80 shadow-xs">
        <div className="w-1.5 h-[1px] bg-[#523F1C] rotate-12" />
      </div>
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#C2A368] border border-[#523F1C] flex items-center justify-center opacity-80 shadow-xs">
        <div className="w-1.5 h-[1px] bg-[#523F1C] -rotate-12" />
      </div>

      {/* Header Plaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#354B43] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#253D35] border border-[#C2A368]/50 flex items-center justify-center text-[#D8B978]">
            <CompassIcon size={14} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-[#D8B978] block">
              EXPEDITION INSTRUMENT CLUSTER · SPEC 1928-ALT
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#E1DBC5]">
              <MapPin size={11} className="text-[#C2A368]" />
              <span className="font-semibold">{locationName}</span>
              <span className="text-[#889E95] font-mono text-[11px]">({coordinates})</span>
            </div>
          </div>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-[#0C1915] p-1 rounded border border-[#354B43]">
          <button
            type="button"
            onClick={() => setUnit('m')}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
              unit === 'm' ? 'bg-[#C2A368] text-[#14231E]' : 'text-[#889E95] hover:text-[#EDE8D0]'
            }`}
          >
            METRIC [m]
          </button>
          <button
            type="button"
            onClick={() => setUnit('ft')}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors ${
              unit === 'ft' ? 'bg-[#C2A368] text-[#14231E]' : 'text-[#889E95] hover:text-[#EDE8D0]'
            }`}
          >
            IMPERIAL [ft]
          </button>
        </div>
      </div>

      {/* Dual Gauges Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Gauge 1: 360° Sighting Compass */}
        <div className="flex flex-col items-center p-3 rounded-[10px] bg-[#0E1A16] border border-[#2B423A]">
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#D8B978] mb-2 px-1">
            <span className="font-bold tracking-wider">MAGNETIC SIGHTING COMPASS</span>
            <span className="text-[#889E95]">D-287</span>
          </div>

          {/* Compass Dial */}
          <div className="relative w-36 h-36 rounded-full border-4 border-[#C2A368] bg-[#FAF7EE] shadow-inner flex items-center justify-center p-1">
            {/* Outer tick ring */}
            <div className="absolute inset-1 rounded-full border border-dashed border-[#8E784B]/40" />

            {/* Cardinal points */}
            <span className="absolute top-1 text-[11px] font-bold font-mono text-[#C0392B]">N</span>
            <span className="absolute bottom-1 text-[10px] font-bold font-mono text-[#2C3E50]">S</span>
            <span className="absolute right-1.5 text-[10px] font-bold font-mono text-[#2C3E50]">E</span>
            <span className="absolute left-1.5 text-[10px] font-bold font-mono text-[#2C3E50]">W</span>

            {/* Intercardinals */}
            <span className="absolute top-4 right-4 text-[7px] font-mono text-[#7F8C8D]">NE</span>
            <span className="absolute bottom-4 right-4 text-[7px] font-mono text-[#7F8C8D]">SE</span>
            <span className="absolute bottom-4 left-4 text-[7px] font-mono text-[#7F8C8D]">SW</span>
            <span className="absolute top-4 left-4 text-[7px] font-mono text-[#7F8C8D]">NW</span>

            {/* Compass Sighting Crosshair */}
            <div className="absolute inset-4 rounded-full border border-[#BDC3C7]/60 pointer-events-none" />
            <div className="absolute top-0 bottom-0 w-[1px] bg-[#BDC3C7]/40 pointer-events-none" />
            <div className="absolute left-0 right-0 h-[1px] bg-[#BDC3C7]/40 pointer-events-none" />

            {/* Rotating Magnetic Needle */}
            <div
              className="absolute w-2.5 h-28 pointer-events-none transition-transform duration-700 ease-out flex flex-col items-center justify-between"
              style={{ transform: `rotate(${headingDeg}deg)` }}
            >
              {/* North Pointer (Red) */}
              <div
                className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[48px] border-b-[#C0392B] drop-shadow-sm"
              />
              {/* South Counter-weight (Gunmetal) */}
              <div
                className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[48px] border-t-[#2C3E50] drop-shadow-sm"
              />
            </div>

            {/* Center Brass Cap / Pivot */}
            <div className="w-4 h-4 rounded-full bg-[#C2A368] border border-[#523F1C] z-10 shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#14231E]" />
            </div>
          </div>

          {/* Compass Readout */}
          <div className="mt-3 text-center">
            <span className="font-mono text-sm font-bold text-[#EDE8D0] tracking-wide">
              {headingDeg}° {cardinal}
            </span>
            <span className="text-[10px] font-mono text-[#889E95] block mt-0.5">
              TRUE BEARING · MAG VAR 1.2°E
            </span>
          </div>
        </div>

        {/* Gauge 2: Mechanical Gear Altimeter */}
        <div className="flex flex-col items-center p-3 rounded-[10px] bg-[#0E1A16] border border-[#2B423A]">
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#D8B978] mb-2 px-1">
            <span className="font-bold tracking-wider">ANEROID ALTIMETER</span>
            <span className="text-[#889E95]">ALT-18</span>
          </div>

          {/* Altimeter Dial */}
          <div className="relative w-36 h-36 rounded-full border-4 border-[#C2A368] bg-[#FAF7EE] shadow-inner flex items-center justify-center p-1">
            {/* Elevation ring markers */}
            <div className="absolute inset-1 rounded-full border border-dashed border-[#8E784B]/40" />

            <span className="absolute top-1 text-[9px] font-bold font-mono text-[#2C3E50]">0m</span>
            <span className="absolute right-1 text-[9px] font-bold font-mono text-[#2C3E50]">1k</span>
            <span className="absolute bottom-1 text-[9px] font-bold font-mono text-[#2C3E50]">2k</span>
            <span className="absolute left-1 text-[9px] font-bold font-mono text-[#2C3E50]">3k</span>

            {/* Center Mountain Silhouette & Sub-pressure */}
            <div className="absolute flex flex-col items-center pointer-events-none mt-6 opacity-75">
              <Mountain size={16} className="text-[#8E784B]" />
              <span className="text-[7.5px] font-mono font-bold text-[#523F1C] tracking-tighter mt-0.5">
                {pressureHpa} hPa
              </span>
            </div>

            {/* Altimeter Needle */}
            <div
              className="absolute w-2 h-26 pointer-events-none transition-transform duration-700 ease-out flex flex-col items-center"
              style={{ transform: `rotate(${altimeterAngle}deg)` }}
            >
              {/* Needle Point */}
              <div className="w-[2px] h-14 bg-[#14231E] rounded-t shadow-sm" />
              {/* Counter-weight */}
              <div className="w-[3px] h-5 bg-[#C0392B] rounded-b mt-3" />
            </div>

            {/* Center Brass Hub */}
            <div className="w-4 h-4 rounded-full bg-[#C2A368] border border-[#523F1C] z-10 shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#14231E]" />
            </div>
          </div>

          {/* Altimeter Readout */}
          <div className="mt-3 text-center">
            <span className="font-mono text-sm font-bold text-[#D8B978] tracking-wide">
              {elevationDisplay}
            </span>
            <span className="text-[10px] font-mono text-[#889E95] block mt-0.5 uppercase tracking-wider">
              {altitudeBand}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Technical Footnote */}
      <div className="mt-4 pt-3 border-t border-[#354B43] flex flex-wrap items-center justify-between text-[10px] font-mono text-[#889E95]">
        <div className="flex items-center gap-1.5">
          <Gauge size={12} className="text-[#C2A368]" />
          <span>CALIBRATED TO STANDARD ATMOSPHERE (ISA 1013.25 HPA)</span>
        </div>
        <span className="text-[#D8B978]">MECHANICAL GEAR-LINKAGE ZERO DRIFT</span>
      </div>
    </div>
  );
}
