import React from 'react';
import Image from 'next/image';

interface PackPalIconProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Official PackPal Colorful Travel Backpack Brand Icon
 */
export function PackPalIcon({
  size = 32,
  className = '',
  priority = false,
}: PackPalIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/icon.png"
        alt="PackPal Icon"
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-contain select-none"
      />
    </div>
  );
}
