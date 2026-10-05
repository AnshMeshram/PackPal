'use client';

import React, { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { AlertOctagon, Printer, X, ShieldAlert, Phone, HeartPulse, Radio } from 'lucide-react';

interface OfflineSOSCardProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export function OfflineSOSCard({ trip, isOpen, onClose }: OfflineSOSCardProps) {
  const [bloodGroup, setBloodGroup] = useState<string>('O+ POS');
  const [iceName, setIceName] = useState<string>('Emergency Contact');
  const [icePhone, setIcePhone] = useState<string>('+91 98765 43210');
  const [allergies, setAllergies] = useState<string>('None recorded / Penicillin check');
  const [policyNo, setPolicyNo] = useState<string>('TRAV-INS-89104');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-sos-active');
    } else {
      document.body.classList.remove('print-sos-active');
    }
    return () => {
      document.body.classList.remove('print-sos-active');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FCFAF2] text-[#1C201E] rounded-[10px] border-4 border-[#C0392B] p-5 sm:p-7 shadow-2xl my-auto font-sans overflow-hidden">
        {/* Brass Lanyard Corner Grommet */}
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-[#8E784B] bg-[#E5D7B7] flex items-center justify-center shadow-inner pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FCFAF2] border border-[#8E784B]" />
        </div>

        {/* Hazard Striping Bar at Top */}
        <div className="h-3 w-full bg-repeating-linear-gradient flex mb-4 rounded-sm overflow-hidden"
             style={{
               backgroundImage: 'repeating-linear-gradient(-45deg, #C0392B, #C0392B 10px, #1C201E 10px, #1C201E 20px)'
             }}
        />

        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b-2 border-[#C0392B] pb-3 mb-4">
          <div className="flex items-center gap-2 pl-6 sm:pl-7">
            <AlertOctagon size={20} className="text-[#C0392B]" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C0392B] block">
                ZERO-SIGNAL DISASTER & FIELD SURVIVAL CARD
              </span>
              <h2 className="text-lg font-bold text-[#1C201E]" style={{ fontFamily: 'var(--font-heading)' }}>
                Offline Expedition SOS Index
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-[#1C201E] text-white text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[#35433E] cursor-pointer"
            >
              <Printer size={13} />
              <span>Print SOS Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#666] hover:text-[#111] hover:bg-black/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-4 text-xs">
          {/* Traveler & Expedition Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded bg-[#F2EDE0] border border-[#DDD3BF] font-mono text-[11px]">
            <div>
              <span className="text-[9px] text-[#777] uppercase block">DESTINATION WAYPOINT</span>
              <strong className="text-[#1C201E] text-xs">{trip.destination.toUpperCase()}</strong>
            </div>
            <div>
              <span className="text-[9px] text-[#777] uppercase block">TRAVEL DATES</span>
              <span className="text-[#1C201E]">{trip.startDate} → {trip.endDate}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#777] uppercase block">PRIMARY TRAVELER</span>
              <strong className="text-[#C0392B]">{trip.members[0]?.name || 'TRAVELER'}</strong>
            </div>
          </div>

          {/* Section 1: Emergency Contact & Medical ID */}
          <div className="border border-[#DDD3BF] rounded p-3 bg-white space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C0392B] border-b border-[#EEE] pb-1.5">
              <HeartPulse size={14} />
              <span className="font-mono uppercase tracking-wider">FIELD MEDICAL & ICE (IN CASE OF EMERGENCY)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <label className="text-[9px] font-mono text-[#777] uppercase block">BLOOD GROUP</label>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full font-mono font-bold text-[#C0392B] bg-[#FDEDEC] px-2 py-1 rounded border border-[#F5B7B1]"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-[#777] uppercase block">INSURANCE POLICY #</label>
                <input
                  type="text"
                  value={policyNo}
                  onChange={(e) => setPolicyNo(e.target.value)}
                  className="w-full font-mono font-semibold text-[#1C201E] bg-[#F2EDE0] px-2 py-1 rounded border border-[#DDD3BF]"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-[#777] uppercase block">ICE CONTACT</label>
                <input
                  type="text"
                  value={iceName}
                  onChange={(e) => setIceName(e.target.value)}
                  className="w-full font-mono text-[#1C201E] bg-[#F2EDE0] px-2 py-1 rounded border border-[#DDD3BF]"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono text-[#777] uppercase block">ICE PHONE</label>
                <input
                  type="text"
                  value={icePhone}
                  onChange={(e) => setIcePhone(e.target.value)}
                  className="w-full font-mono font-bold text-[#1C201E] bg-[#F2EDE0] px-2 py-1 rounded border border-[#DDD3BF]"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-[#777] uppercase block">CRITICAL ALLERGIES / CONDITIONS</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full font-mono text-xs text-[#1C201E] bg-[#F2EDE0] px-2 py-1 rounded border border-[#DDD3BF]"
              />
            </div>
          </div>

          {/* Section 2: Universal Ground-to-Air Visual Distress Signals & Morse Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ground-to-Air Signals */}
            <div className="border border-[#DDD3BF] rounded p-3 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C201E] border-b border-[#EEE] pb-1">
                <Radio size={13} className="text-[#C0392B]" />
                <span className="font-mono uppercase text-[10px] tracking-wider">GROUND-TO-AIR RESCUE CODE</span>
              </div>
              <p className="text-[10px] text-[#666] leading-tight">
                Stamp in snow, arrange rocks, or lay bright fabric:
              </p>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                <div className="p-1 rounded bg-[#F2EDE0] flex items-center gap-2">
                  <span className="font-bold text-base text-[#C0392B]">V</span>
                  <span className="text-[10px]">Require Assist</span>
                </div>
                <div className="p-1 rounded bg-[#F2EDE0] flex items-center gap-2">
                  <span className="font-bold text-base text-[#C0392B]">X</span>
                  <span className="text-[10px]">Require Medical</span>
                </div>
                <div className="p-1 rounded bg-[#F2EDE0] flex items-center gap-2">
                  <span className="font-bold text-base text-[#C0392B]">N</span>
                  <span className="text-[10px]">No / Negative</span>
                </div>
                <div className="p-1 rounded bg-[#F2EDE0] flex items-center gap-2">
                  <span className="font-bold text-base text-[#C0392B]">Y</span>
                  <span className="text-[10px]">Yes / Affirmative</span>
                </div>
              </div>
            </div>

            {/* Morse Code SOS & Radio Frequency */}
            <div className="border border-[#DDD3BF] rounded p-3 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C201E] border-b border-[#EEE] pb-1">
                <ShieldAlert size={13} className="text-[#C0392B]" />
                <span className="font-mono uppercase text-[10px] tracking-wider">UNIVERSAL DISTRESS AUDIO</span>
              </div>
              <div className="p-2 rounded bg-[#FDEDEC] border border-[#F5B7B1] text-center font-mono">
                <span className="text-[10px] text-[#777] block">INTERNATIONAL S.O.S</span>
                <span className="text-xl font-bold tracking-[0.3em] text-[#C0392B]">... --- ...</span>
                <span className="text-[9px] text-[#555] block mt-0.5">3 short · 3 long · 3 short</span>
              </div>
              <div className="text-[10px] font-mono text-[#555] space-y-0.5">
                <div>• VHF Distress: <strong>Channel 16 (156.8 MHz)</strong></div>
                <div>• Aviation Guard: <strong>121.500 MHz</strong></div>
              </div>
            </div>
          </div>

          {/* Section 3: Priority Emergency Dial Codes */}
          <div className="border border-[#DDD3BF] rounded p-3 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C201E] border-b border-[#EEE] pb-1.5 mb-2">
              <Phone size={13} className="text-[#C0392B]" />
              <span className="font-mono uppercase text-[10px] tracking-wider">STANDARD EMERGENCY DIRECTORY</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-[#F2EDE0] border border-[#DDD3BF]">
                <span className="text-[9px] text-[#777] uppercase block">UNIVERSAL / POLICE</span>
                <strong className="text-sm text-[#1C201E]">112 / 100</strong>
              </div>
              <div className="p-2 rounded bg-[#F2EDE0] border border-[#DDD3BF]">
                <span className="text-[9px] text-[#777] uppercase block">MEDICAL AMBULANCE</span>
                <strong className="text-sm text-[#1C201E]">102 / 108</strong>
              </div>
              <div className="p-2 rounded bg-[#F2EDE0] border border-[#DDD3BF]">
                <span className="text-[9px] text-[#777] uppercase block">FIRE RESCUE</span>
                <strong className="text-sm text-[#1C201E]">101</strong>
              </div>
              <div className="p-2 rounded bg-[#F2EDE0] border border-[#DDD3BF]">
                <span className="text-[9px] text-[#777] uppercase block">MOUNTAIN DISPATCH</span>
                <strong className="text-sm text-[#C0392B]">1077 / 1070</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Zero-Signal Offline Guarantee */}
        <div className="mt-4 pt-3 border-t border-[#DDD3BF] flex flex-wrap items-center justify-between text-[10px] font-mono text-[#666]">
          <span>LAMINATED CARD SPEC · RETAINS VALUE WITH ZERO CELL SERVICE</span>
          <span className="font-bold text-[#C0392B]">ALWAYS KEEP IN PACK TOP BRAIN POCKET</span>
        </div>
      </div>
    </div>
  );
}
