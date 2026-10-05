import React from 'react';
import { Wind } from 'lucide-react';

interface WeatherBarometerProps {
  condition?: string;
  source?: 'live' | 'fallback';
  className?: string;
}

export function WeatherBarometer({
  condition = 'Mild seasonal weather',
  source = 'live',
  className = '',
}: WeatherBarometerProps) {
  // Infer barometer zone and pressure from condition
  const condLower = condition.toLowerCase();

  let zone = 'FAIR';
  let angle = 20; // 0deg is straight up (CHANGE)
  let pressureHpa = 1018;
  let windSpeed = '12 km/h';
  let windDirection = 'NNW';

  if (condLower.includes('storm') || condLower.includes('thunder') || condLower.includes('gale')) {
    zone = 'STORMY';
    angle = -65;
    pressureHpa = 980;
    windSpeed = '38 km/h';
    windDirection = 'SW';
  } else if (condLower.includes('rain') || condLower.includes('shower') || condLower.includes('drizzle') || condLower.includes('monsoon')) {
    zone = 'RAIN';
    angle = -35;
    pressureHpa = 998;
    windSpeed = '24 km/h';
    windDirection = 'WNW';
  } else if (condLower.includes('cloud') || condLower.includes('overcast') || condLower.includes('fog') || condLower.includes('haze')) {
    zone = 'CHANGE';
    angle = 0;
    pressureHpa = 1012;
    windSpeed = '14 km/h';
    windDirection = 'NNE';
  } else if (condLower.includes('dry') || condLower.includes('arid') || condLower.includes('desert')) {
    zone = 'VERY DRY';
    angle = 60;
    pressureHpa = 1032;
    windSpeed = '8 km/h';
    windDirection = 'NE';
  } else {
    // Fair / Sun / Mild
    zone = 'FAIR';
    angle = 32;
    pressureHpa = 1020;
    windSpeed = '11 km/h';
    windDirection = 'NNW';
  }

  return (
    <div
      className={`relative rounded-[12px] bg-[#FAF7F0] border-2 border-[#D8CEBE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono select-none shadow-[0_2px_8px_rgba(12,65,55,0.04)] ${className}`}
    >
      {/* Left: Vintage Mechanical Aneroid Barometer Dial */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            {/* Outer Brass Bezel */}
            <circle cx="50" cy="50" r="48" fill="#F4EFE6" stroke="#B8A484" strokeWidth="4" />
            <circle cx="50" cy="50" r="44" fill="#FCFAF5" stroke="#DDD2BF" strokeWidth="1.5" />

            {/* Dial Tick Arcs */}
            <g stroke="#8A7D6B" strokeWidth="1" opacity="0.8">
              {/* Ticks from -80deg to +80deg */}
              {[-70, -50, -35, -20, 0, 20, 35, 50, 70].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="12"
                  x2="50"
                  y2={deg % 35 === 0 ? '18' : '15'}
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </g>

            {/* Zone Labels */}
            <text x="22" y="38" textAnchor="middle" className="text-[5.5px] fill-[#7D473A] font-bold">
              RAIN
            </text>
            <text x="50" y="27" textAnchor="middle" className="text-[5.5px] fill-[#5A4F40] font-bold">
              CHANGE
            </text>
            <text x="78" y="38" textAnchor="middle" className="text-[5.5px] fill-[#04624A] font-bold">
              FAIR
            </text>

            {/* Brass Center Hub */}
            <circle cx="50" cy="50" r="5" fill="#B8A484" stroke="#6E5D42" strokeWidth="1" />

            {/* Analog Barometer Needle */}
            <g
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '50px 50px',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <polygon points="48.5,50 50,15 51.5,50" fill="#0C4137" />
              <polygon points="49,50 50,57 51,50" fill="#0C4137" />
              <circle cx="50" cy="50" r="2.5" fill="#F4EFE6" />
            </g>
          </svg>
        </div>

        {/* Barometer Reading Data */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#04624A] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] inline-block" />
            <span>BAROMETRIC READING · {zone} {source === 'live' ? '· LIVE' : '· ESTIMATED'}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#0C4137]">{pressureHpa}</span>
            <span className="text-[11px] text-[#786E5E]">hPa (Millibars)</span>
          </div>
          <p className="text-[11px] text-[#554C3E] max-w-sm line-clamp-1 font-sans">
            {condition}
          </p>
        </div>
      </div>

      {/* Right: Wind Rose / Anemometer Vane */}
      <div className="flex items-center gap-3 sm:border-l sm:border-dashed sm:border-[#D8CEBE] sm:pl-4">
        <div className="w-8 h-8 rounded-full bg-white border border-[#DDD2BF] flex items-center justify-center text-[#0C4137]">
          <Wind size={15} />
        </div>
        <div className="text-xs">
          <span className="text-[9px] uppercase tracking-widest text-[#786E5E] block">
            WIND TRAIL
          </span>
          <span className="font-bold text-[#0C4137]">
            {windDirection} · {windSpeed}
          </span>
        </div>
      </div>
    </div>
  );
}
