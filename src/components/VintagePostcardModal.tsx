'use client';

import React, { useState, useEffect } from 'react';
import { Trip } from '@/types';
import { getDestinationRouteMeta } from '@/lib/destinations';
import { Printer, Copy, Check, X, Mail } from 'lucide-react';
import { PackPalIcon } from './PackPalIcon';

interface VintagePostcardModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export function VintagePostcardModal({ trip, isOpen, onClose }: VintagePostcardModalProps) {
  const routeMeta = getDestinationRouteMeta(trip.destination);
  const [friendName, setFriendName] = useState('My Dearest Friend');
  const [friendAddress, setFriendAddress] = useState('14 Elmwood Terrace, New Delhi');
  const [message, setMessage] = useState(
    `Writing to you from ${trip.destination}! The mountain air is brisk, the trails are open, and our backpacks are packed light. Thought of you as we crossed the valley pass today. Hope you are well — can't wait to catch up over hot chai when I return!`
  );
  const [senderName, setSenderName] = useState(trip.members[0]?.name || 'Your Traveling Friend');
  const [stampTheme, setStampTheme] = useState<'mountain' | 'coastal' | 'classic'>('mountain');
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-postcard-active');
    } else {
      document.body.classList.remove('print-postcard-active');
    }
    return () => {
      document.body.classList.remove('print-postcard-active');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `Postcard from ${trip.destination} 🏔️\n\nDear ${friendName},\n\n${message}\n\nWarmly,\n${senderName}\n\n[Dispatched via PackPal]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FAF6EE] text-[#1E2522] rounded-[10px] p-5 sm:p-8 shadow-2xl my-auto font-sans overflow-hidden border-2 border-[#D1C7B7]">
        {/* Airmail Chevron Perimeter Border */}
        <div
          className="absolute inset-0 pointer-events-none border-[10px] border-solid"
          style={{
            borderImage:
              'repeating-linear-gradient(45deg, #C0392B 0, #C0392B 15px, #FAF6EE 15px, #FAF6EE 25px, #2980B9 25px, #2980B9 40px, #FAF6EE 40px, #FAF6EE 50px) 10',
          }}
        />

        {/* Modal Toolbar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D6CDBC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#1B4332] text-[#D8B978] flex items-center justify-center shadow-xs">
              <Mail size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#C0392B] uppercase block">
                BUILD FOR A FRIEND · HACKTOBERFEST 2026
              </span>
              <h2 className="text-lg font-bold text-[#14231E]" style={{ fontFamily: 'var(--font-heading)' }}>
                Airmail Travel Postcard
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-white border border-[#D6CDBC] text-[#14231E] text-xs font-mono font-semibold flex items-center gap-1.5 hover:bg-[#F2EDE0] cursor-pointer"
            >
              {copied ? <Check size={13} className="text-[#27AE60]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded bg-[#14231E] text-white text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[#2C3E50] cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Postcard</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#666] hover:text-[#111] hover:bg-black/10 cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Postcard Physical Body */}
        <div className="relative z-10 bg-[#FCFBF7] rounded-[6px] border border-[#DDD5C5] p-5 sm:p-7 shadow-md">
          {/* Postcard Masthead */}
          <div className="text-center pb-4 mb-4 border-b border-[#D6CDBC]">
            <h1
              className="text-2xl font-bold tracking-[0.35em] text-[#2C3E50] uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              POST CARD
            </h1>
            <span className="text-[9px] font-mono tracking-[0.2em] text-[#7F8C8D] uppercase block mt-0.5">
              CARTE POSTALE · PACKPAL EXPEDITION DISPATCH
            </span>
          </div>

          {/* Divided Back: Left (Letter) | Right (Address & Stamps) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Handwritten Letter */}
            <div className="md:col-span-7 space-y-3 pr-0 md:pr-4 md:border-r border-[#D6CDBC]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#777]">Dear</span>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="font-bold text-sm text-[#14231E] bg-transparent border-b border-[#D6CDBC] focus:border-[#C0392B] focus:outline-none flex-1 pb-0.5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                />
              </div>

              {/* Lined Note Body */}
              <div className="relative">
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm text-[#1E3A5F] leading-relaxed bg-transparent resize-none focus:outline-none font-serif italic p-1 border-b border-dashed border-[#D6CDBC]"
                  style={{
                    lineHeight: '1.75rem',
                    backgroundImage: 'linear-gradient(transparent, transparent 1.65rem, #E2DACB 1.65rem, #E2DACB 1.75rem)',
                    backgroundSize: '100% 1.75rem',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-xs font-mono text-[#777]">Always,</span>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="font-bold text-sm text-[#14231E] bg-transparent border-b border-[#D6CDBC] focus:border-[#C0392B] focus:outline-none w-44 pb-0.5 text-right italic"
                  style={{ fontFamily: 'var(--font-heading)' }}
                />
              </div>
            </div>

            {/* Right Column: Postage Stamp, Cancellation, Airmail Label, Recipient Lines */}
            <div className="md:col-span-5 space-y-4">
              {/* Postage Stamp & Postal Cancellation Box */}
              <div className="flex items-start justify-between gap-3">
                {/* Par Avion Blue Sticker */}
                <div className="px-2.5 py-1 rounded-sm bg-[#1E3A8A] text-white border border-[#3B82F6] shadow-sm transform -rotate-3 text-center shrink-0">
                  <span className="text-[7.5px] font-mono font-bold tracking-[0.2em] block">
                    PAR AVION
                  </span>
                  <span className="text-[7px] font-mono tracking-wider block opacity-90">
                    BY AIR MAIL
                  </span>
                </div>

                {/* Postage Stamp & Cancellation Group */}
                <div className="relative flex items-center">
                  {/* Wavy Ink Postmark */}
                  <div className="absolute -left-12 top-2 pointer-events-none flex flex-col items-center opacity-80 z-20">
                    <div className="w-12 h-12 rounded-full border border-dashed border-[#2C3E50] flex flex-col items-center justify-center p-0.5 text-center">
                      <span className="text-[6.5px] font-mono font-bold text-[#2C3E50]">{routeMeta.code}</span>
                      <span className="text-[6px] font-mono text-[#2C3E50]">{trip.startDate}</span>
                    </div>
                    {/* Wavy lines */}
                    <div className="w-14 h-3 flex flex-col justify-between mt-0.5">
                      <div className="h-[1px] bg-[#2C3E50] w-full" />
                      <div className="h-[1px] bg-[#2C3E50] w-full" />
                      <div className="h-[1px] bg-[#2C3E50] w-full" />
                    </div>
                  </div>

                  {/* Commemorative Stamp */}
                  <div
                    className="w-20 h-24 rounded-sm border-2 border-dashed p-1 shadow-md flex flex-col items-center justify-between text-center relative z-10 transition-colors"
                    style={{
                      borderColor: stampTheme === 'coastal' ? '#2980B9' : stampTheme === 'classic' ? '#C0392B' : '#8E784B',
                      backgroundColor: stampTheme === 'coastal' ? '#F0F8FF' : stampTheme === 'classic' ? '#FFF9F9' : '#FFFDF9',
                    }}
                  >
                    <div
                      className="flex items-center justify-between w-full text-[7px] font-mono font-bold"
                      style={{
                        color: stampTheme === 'coastal' ? '#2980B9' : stampTheme === 'classic' ? '#C0392B' : '#8E784B',
                      }}
                    >
                      <span>INDIA</span>
                      <span>₹25</span>
                    </div>

                    <div
                      className="w-9 h-9 rounded-full border flex items-center justify-center my-0.5"
                      style={{
                        backgroundColor: stampTheme === 'coastal' ? '#E0F2FE' : stampTheme === 'classic' ? '#FEE2E2' : '#E5F5EC',
                        borderColor: stampTheme === 'coastal' ? '#0284C7' : stampTheme === 'classic' ? '#EF4444' : '#27AE60',
                      }}
                    >
                      <PackPalIcon size={24} />
                    </div>

                    <div className="text-[7px] font-mono font-bold text-[#14231E] uppercase truncate w-full">
                      {trip.destination}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Address Lines */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#888] block">
                  DELIVERY ADDRESS:
                </span>
                <div className="space-y-2 font-mono text-xs">
                  <div className="border-b border-[#D6CDBC] pb-1 flex items-center gap-1.5">
                    <span className="text-[#888] text-[10px]">NAME:</span>
                    <span className="font-bold text-[#14231E]">{friendName}</span>
                  </div>
                  <div className="border-b border-[#D6CDBC] pb-1 flex items-center gap-1.5">
                    <span className="text-[#888] text-[10px]">STREET:</span>
                    <input
                      type="text"
                      value={friendAddress}
                      onChange={(e) => setFriendAddress(e.target.value)}
                      className="bg-transparent text-xs text-[#14231E] focus:outline-none flex-1"
                    />
                  </div>
                  <div className="border-b border-[#D6CDBC] pb-1 flex items-center gap-1.5">
                    <span className="text-[#888] text-[10px]">ROUTING:</span>
                    <span className="text-[11px] text-[#555]">{routeMeta.route} VIA PACKPAL POST</span>
                  </div>
                </div>

                {/* Stamp Style Picker */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-mono text-[#888]">STAMP:</span>
                  {(['mountain', 'coastal', 'classic'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStampTheme(t)}
                      className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                        stampTheme === t ? 'bg-[#14231E] text-white' : 'bg-[#EFEAE0] text-[#666] hover:bg-[#DDD5C5]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#777]">
          <span>PRINT OR EXPORT AS HIGH-RESOLUTION TRAVEL MEMORY</span>
          <span className="text-[#C0392B] font-bold">SENT WITH CARE VIA PACKPAL AIRMAIL</span>
        </div>
      </div>
    </div>
  );
}
