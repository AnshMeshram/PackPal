/**
 * Media Asset Resolver
 * Clean provider abstraction layer supporting local assets, direct URLs,
 * and future optional CDN media providers (ImageKit, Cloudinary).
 */

export type MediaSource = 'local' | 'remote' | 'imagekit' | 'cloudinary';

export interface MediaAssetOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'avif' | 'webp' | 'jpg' | 'png';
}

/**
 * Resolves a media path or URL into a final deliverable image URL.
 */
export function resolveMediaUrl(
  src: string,
  options?: MediaAssetOptions
): string {
  if (!src) return '/media/vectors/suitcase.svg';

  // 1. Direct remote URL (Unsplash or external)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    if (src.includes('images.unsplash.com') && options) {
      const url = new URL(src);
      if (options.width) url.searchParams.set('w', options.width.toString());
      if (options.quality) url.searchParams.set('q', options.quality.toString());
      if (options.format && options.format !== 'auto') url.searchParams.set('fm', options.format);
      return url.toString();
    }
    return src;
  }

  // 2. Local public asset
  if (src.startsWith('/')) {
    return src;
  }

  return `/${src}`;
}

/**
 * Vector illustrations catalog
 */
export const VECTOR_ASSETS = {
  logo: '/vectors/packpal-logo.svg',
  logoMark: '/vectors/packpal-logo-mark.svg',
  logoLight: '/vectors/packpal-logo-light.svg',
  packpalIcon: '/icon.png',
  packpalIconSvg: '/vectors/packpal-backpack.svg',
  suitcase: '/media/vectors/suitcase.svg',
  passport: '/media/vectors/passport.svg',
  backpack: '/icon.png',
  beach: '/media/vectors/beach.svg',
  hiking: '/media/vectors/hiking.svg',
  camera: '/media/vectors/camera.svg',
  weather: '/media/vectors/weather.svg',
  friends: '/media/vectors/friends.svg',
  map: '/media/vectors/map.svg',
  wallet: '/media/vectors/wallet.svg',
} as const;
