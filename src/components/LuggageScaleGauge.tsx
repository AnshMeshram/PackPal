'use client';

import React from 'react';

interface LuggageScaleGaugeProps {
  currentWeightKg: number;
  maxWeightKg: number;
  className?: string;
}

export function LuggageScaleGauge({
  currentWeightKg,
  maxWeightKg = 7,
  className = '',
}: LuggageScaleGaugeProps) {
  // Scale range goes up to either 10kg or maxWeightKg * 1.35
  const scaleMax = Math.max(10, Math.ceil(maxWeightKg * 1.35));
  const clampedWeight = Math.min(scaleMax, Math.max(0, currentWeightKg));

  // Angular sweep: from -110deg (at 0kg) to +110deg (at scaleMax)
  const startAngle = -110;
  const endAngle = 110;
  const totalSweep = endAngle - startAngle;

  // Current angle for needle
  const weightRatio = clampedWeight / scaleMax;
  const needleAngle = startAngle + weightRatio * totalSweep;

  // Limit angle marker
  const limitRatio = maxWeightKg / scaleMax;
  const limitAngle = startAngle + limitRatio * totalSweep;

  const isOver = currentWeightKg > maxWeightKg;
  const isWarning = !isOver && currentWeightKg >= maxWeightKg * 0.85;

  // Arc drawing helpers
  const cx = 110;
  const cy = 100;
  const radius = 72;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    // Angle in degrees where 0deg is top (12 o'clock)
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgArc = describeArc(cx, cy, radius, startAngle, endAngle);
  const activeArc = describeArc(cx, cy, radius, startAngle, needleAngle);

  // Generate tick marks (e.g. every 1kg or 2kg)
  const ticks = [];
  const tickStep = scaleMax <= 12 ? 2 : 5;
  for (let w = 0; w <= scaleMax; w += tickStep) {
    const angle = startAngle + (w / scaleMax) * totalSweep;
    const ptInner = polarToCartesian(cx, cy, radius - 7, angle);
    const ptOuter = polarToCartesian(cx, cy, radius + 2, angle);
    const ptText = polarToCartesian(cx, cy, radius - 16, angle);
    ticks.push({ weight: w, ptInner, ptOuter, ptText });
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* SVG Analog Dial */}
      <svg
        viewBox="0 0 220 145"
        className="w-full max-w-[240px] overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <defs>
          <linearGradient id="gaugeTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06D6A0" />
            <stop offset="65%" stopColor="#2BBAA5" />
            <stop offset="85%" stopColor="#F9A822" />
            <stop offset="100%" stopColor="#F96635" />
          </linearGradient>

          <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0C4137" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Background Arc Track */}
        <path
          d={bgArc}
          fill="none"
          stroke="var(--polar)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Active Arc Track */}
        {clampedWeight > 0.05 && (
          <path
            d={activeArc}
            fill="none"
            stroke={isOver ? 'var(--coral)' : isWarning ? 'var(--amber)' : 'var(--emerald-ink)'}
            strokeWidth="10"
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}

        {/* Limit Marker Notch */}
        {(() => {
          const ptLimit1 = polarToCartesian(cx, cy, radius - 9, limitAngle);
          const ptLimit2 = polarToCartesian(cx, cy, radius + 9, limitAngle);
          return (
            <line
              x1={ptLimit1.x}
              y1={ptLimit1.y}
              x2={ptLimit2.x}
              y2={ptLimit2.y}
              stroke="#0C4137"
              strokeWidth="2.5"
              strokeDasharray="2 1"
            />
          );
        })()}

        {/* Ticks and numeric marks */}
        {ticks.map((t) => (
          <g key={t.weight}>
            <line
              x1={t.ptInner.x}
              y1={t.ptInner.y}
              x2={t.ptOuter.x}
              y2={t.ptOuter.y}
              stroke="var(--rule)"
              strokeWidth="1.5"
            />
            <text
              x={t.ptText.x}
              y={t.ptText.y + 3.5}
              textAnchor="middle"
              className="font-mono text-[9px] font-bold fill-[var(--ink-muted)] pointer-events-none"
            >
              {t.weight}k
            </text>
          </g>
        ))}

        {/* Center Needle */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          filter="url(#gaugeShadow)"
        >
          {/* Needle blade */}
          <polygon
            points={`${cx - 2.5},${cy} ${cx},${cy - radius + 5} ${cx + 2.5},${cy}`}
            fill={isOver ? 'var(--coral)' : '#0C4137'}
          />
          {/* Needle counter-balance tail */}
          <polygon
            points={`${cx - 1.5},${cy} ${cx},${cy + 10} ${cx + 1.5},${cy}`}
            fill="#0C4137"
          />
        </g>

        {/* Pivot Center Cap */}
        <circle cx={cx} cy={cy} r="6" fill="#0C4137" />
        <circle cx={cx} cy={cy} r="2.5" fill="var(--paper)" />
      </svg>

      {/* Readout Typography underneath */}
      <div className="text-center -mt-5 space-y-1">
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={`font-mono text-3xl font-bold tracking-tight ${
              isOver ? 'text-[var(--coral)]' : 'text-[var(--green-900)]'
            }`}
          >
            {currentWeightKg.toFixed(1)}
          </span>
          <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">
            / {maxWeightKg} KG
          </span>
        </div>

        {/* Analog Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider">
          {isOver ? (
            <span className="text-[var(--coral)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)] inline-block animate-pulse" />
              OVERWEIGHT (+{(currentWeightKg - maxWeightKg).toFixed(1)} KG)
            </span>
          ) : isWarning ? (
            <span className="text-[var(--amber)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] inline-block" />
              NEAR LIMIT ({(maxWeightKg - currentWeightKg).toFixed(1)} KG LEFT)
            </span>
          ) : (
            <span className="text-[var(--emerald-ink)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] inline-block" />
              CABIN APPROVED ({(maxWeightKg - currentWeightKg).toFixed(1)} KG LEFT)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
