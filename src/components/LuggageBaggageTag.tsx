import React from 'react';

interface LuggageBaggageTagProps {
  destination: string;
  route: string;
  destinationCode: string;
  passengerName?: string;
  currentWeightKg: number;
  maxWeightKg: number;
  bagType?: string;
  className?: string;
}

export function LuggageBaggageTag({
  destination,
  route,
  destinationCode,
  passengerName = 'EXPLORER',
  currentWeightKg,
  maxWeightKg = 7,
  bagType = 'Cabin Trolley',
  className = '',
}: LuggageBaggageTagProps) {
  const isOver = currentWeightKg > maxWeightKg;

  return (
    <div className={`relative mx-auto max-w-[280px] w-full select-none font-mono ${className}`}>
      {/* Hanging Twine Loop String */}
      <div className="flex justify-center -mb-2 relative z-10">
        <div className="w-5 h-7 border-t-2 border-l-2 border-r-2 border-[#A89F91] rounded-t-full opacity-80" />
      </div>

      {/* Main Tag Body with Chamfered Shoulders */}
      <div
        className="relative bg-[#FAF6EE] text-[#0C4137] border-2 border-[#D8CEBE] shadow-[0_4px_12px_rgba(12,65,55,0.08)] rounded-[12px] pt-3 overflow-hidden"
        style={{
          clipPath: 'polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px, 100% 100%, 0% 100%, 0% 14px)',
        }}
      >
        {/* Reinforced Brass Grommet Hole */}
        <div className="flex justify-center mb-2">
          <div className="w-5 h-5 rounded-full bg-[#E5DDD0] border-2 border-[#8C7E6A] flex items-center justify-center shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#3B342C]" />
          </div>
        </div>

        {/* Tag Header Stamp */}
        <div className="text-center px-4 pb-2 border-b border-dashed border-[#D8CEBE]">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#736859] block">
            PACKPAL AIRWAYS · CABIN BAGGAGE
          </span>
          <span className="text-[10px] font-bold tracking-widest text-[#0C4137]">
            TAG #{destinationCode}-2026
          </span>
        </div>

        {/* Giant Airport IATA Stamped Code */}
        <div className="py-3 px-4 text-center bg-white/60">
          <span className="text-[10px] font-bold text-[#736859] tracking-[0.16em] uppercase block">
            FINAL DESTINATION
          </span>
          <div className="text-4xl font-extrabold tracking-tighter text-[#0C4137] my-0.5 leading-none">
            {destinationCode}
          </div>
          <span className="text-xs font-bold text-[#0C4137] uppercase tracking-wider block truncate">
            {destination}
          </span>
          <span className="text-[10px] font-semibold text-[#06D6A0] tracking-widest uppercase block mt-0.5">
            WAYPOINT: {route}
          </span>
        </div>

        {/* Passenger & Baggage Specs */}
        <div className="px-4 py-2.5 border-t border-b border-dashed border-[#D8CEBE] text-[10px] space-y-1">
          <div className="flex justify-between">
            <span className="text-[#736859] uppercase">PASSENGER:</span>
            <strong className="text-[#0C4137] truncate max-w-[130px]">{passengerName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#736859] uppercase">PIECE TYPE:</span>
            <span className="text-[#0C4137] font-semibold">{bagType}</span>
          </div>
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-[#736859] uppercase">CABIN ALLOWANCE:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                isOver ? 'bg-[var(--coral)]/20 text-[var(--coral)]' : 'bg-[#EBF7F2] text-[#04624A]'
              }`}
            >
              {currentWeightKg.toFixed(1)} / {maxWeightKg} KG
            </span>
          </div>
        </div>

        {/* Perforated Tear Line with Concave Side Notches */}
        <div className="relative py-2 px-4 bg-[#F2EDE2] border-t border-dashed border-[#C5BBA9] flex items-center justify-between text-[8px] text-[#736859]">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--paper)] border border-[#D8CEBE]" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--paper)] border border-[#D8CEBE]" />

          <span className="font-bold tracking-wider">TEAR STUB</span>
          <span className="tracking-widest">CLAIM CHECK NO. 849-01</span>
        </div>

        {/* Vintage Barcode Strip at Bottom */}
        <div className="px-5 py-2.5 bg-white flex flex-col items-center gap-1 border-t border-[#D8CEBE]">
          <div className="flex items-center gap-[2px] h-6 opacity-75" aria-hidden="true">
            <span className="w-[2px] h-full bg-[#0C4137]" />
            <span className="w-[1px] h-full bg-[#0C4137]" />
            <span className="w-[3px] h-full bg-[#0C4137]" />
            <span className="w-[1px] h-full bg-[#0C4137]" />
            <span className="w-[2px] h-full bg-[#0C4137]" />
            <span className="w-[4px] h-full bg-[#0C4137]" />
            <span className="w-[1px] h-full bg-[#0C4137]" />
            <span className="w-[2.5px] h-full bg-[#0C4137]" />
            <span className="w-[1px] h-full bg-[#0C4137]" />
            <span className="w-[3px] h-full bg-[#0C4137]" />
            <span className="w-[2px] h-full bg-[#0C4137]" />
            <span className="w-[1px] h-full bg-[#0C4137]" />
            <span className="w-[3.5px] h-full bg-[#0C4137]" />
            <span className="w-[1px] h-full bg-[#0C4137]" />
            <span className="w-[2px] h-full bg-[#0C4137]" />
          </div>
          <span className="text-[8px] font-mono tracking-widest text-[#736859]">
            *PKP-{destinationCode}-CABIN*
          </span>
        </div>
      </div>
    </div>
  );
}
