'use client';

import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { updateTrip } from '@/lib/storage/local';

interface FieldNotesProps {
  tripId: string;
  notes?: string[];
  onNotesChange?: () => void;
  className?: string;
}

export function FieldNotes({
  tripId,
  notes = [],
  onNotesChange,
  className = '',
}: FieldNotesProps) {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    const text = newNote.trim();
    if (!text) return;

    const updated = [...notes, text];
    updateTrip(tripId, { fieldNotes: updated });
    setNewNote('');
    if (onNotesChange) onNotesChange();
  };

  const handleDeleteNote = (idxToRemove: number) => {
    const updated = notes.filter((_, idx) => idx !== idxToRemove);
    updateTrip(tripId, { fieldNotes: updated });
    if (onNotesChange) onNotesChange();
  };

  return (
    <div
      className={`relative rounded-[12px] border border-[#DDD3C2] p-5 shadow-[0_2px_8px_rgba(12,65,55,0.04)] ${className}`}
      style={{
        backgroundColor: '#FEFBF3',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(216, 206, 190, 0.4) 28px)',
        backgroundAttachment: 'local',
      }}
    >
      {/* Decorative Washi Tape Accent on Top Edge */}
      <div
        className="absolute -top-2.5 left-8 w-20 h-5 bg-[#E6DBC9]/80 border border-[#D5C7B3] shadow-sm transform -rotate-1 rounded-sm pointer-events-none"
        style={{ backdropFilter: 'blur(1px)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5DAC8] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[4px] bg-[#EFE6D5] text-[#0C4137] flex items-center justify-center border border-[#DDD3C2]">
            <Pencil size={14} className="text-[#0C4137]" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#04624A] block">
              EXPEDITION MARGINALIA
            </span>
            <h3
              className="text-base font-bold text-[#0C4137]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Field Notes & Reminders
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#786E5E]">
          {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Notes List */}
      <div className="space-y-2 mb-4">
        {notes.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs italic text-[#877C6B]" style={{ fontFamily: 'var(--font-heading)' }}>
              &ldquo;No marginalia recorded yet. Scribble down spare wool socks, trail permits, or bazaar tips.&rdquo;
            </p>
          </div>
        ) : (
          notes.map((note, idx) => (
            <div
              key={idx}
              className="group flex items-start justify-between gap-3 p-2 rounded-[6px] hover:bg-black/[0.02] transition-colors"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-[#04624A] font-bold text-xs select-none mt-0.5">•</span>
                <p className="text-xs text-[#2A2520] font-sans leading-relaxed break-words">
                  {note}
                </p>
              </div>

              <button
                onClick={() => handleDeleteNote(idx)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#877C6B] hover:text-[var(--coral)] transition-opacity shrink-0 cursor-pointer"
                title="Cross out note"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input Row styled like a lined field journal */}
      <div className="flex gap-2 pt-2 border-t border-[#E5DAC8]">
        <input
          type="text"
          placeholder="Scribble a field note (e.g. Check battery pack before morning trek)…"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          className="input flex-1 text-xs bg-white/90 border-[#D8CEBE] focus:border-[#0C4137]"
        />
        <button
          onClick={handleAddNote}
          disabled={!newNote.trim()}
          className="btn btn-primary text-xs font-bold px-3.5 py-1.5 flex items-center gap-1 shrink-0"
        >
          <Plus size={13} />
          <span>Jot Note</span>
        </button>
      </div>
    </div>
  );
}
