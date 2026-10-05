import React from 'react';
import Image from 'next/image';
import { VECTOR_ASSETS } from '@/lib/media/assetResolver';
import { Compass, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  ctaText?: string;
  onCta?: () => void;
  icon?: 'suitcase' | 'backpack' | 'compass' | 'map' | 'friends';
  className?: string;
}

export function EmptyState({
  title,
  description,
  ctaText,
  onCta,
  icon = 'backpack',
  className = '',
}: EmptyStateProps) {
  const getAsset = () => {
    switch (icon) {
      case 'backpack':
        return VECTOR_ASSETS.packpalIcon;
      case 'map':
        return VECTOR_ASSETS.map;
      case 'friends':
        return VECTOR_ASSETS.friends;
      case 'suitcase':
        return VECTOR_ASSETS.suitcase;
      default:
        return VECTOR_ASSETS.packpalIcon;
    }
  };

  return (
    <div
      className={`text-center py-14 px-8 max-w-lg mx-auto rounded-[12px] border border-[var(--rule)] bg-white ${className}`}
    >
      <div className="w-14 h-14 rounded-[12px] bg-[var(--polar)] text-[var(--green-900)] flex items-center justify-center mx-auto mb-4 border border-[var(--rule)] p-3">
        {icon === 'compass' ? (
          <Compass size={28} />
        ) : (
          <Image src={getAsset()} alt={title} width={32} height={32} />
        )}
      </div>

      <h2
        className="text-xl sm:text-2xl font-bold mb-2 text-[var(--green-900)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h2>

      <p className="text-xs sm:text-sm mb-6 max-w-sm mx-auto text-[var(--ink-muted)] leading-relaxed">
        {description}
      </p>

      {ctaText && onCta && (
        <button
          className="btn btn-primary px-6 py-2.5 flex items-center gap-2 mx-auto text-xs font-bold"
          onClick={onCta}
        >
          <Plus size={15} />
          <span>{ctaText}</span>
        </button>
      )}
    </div>
  );
}
