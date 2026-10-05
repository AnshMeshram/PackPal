/**
 * Destination definitions, curated travel photography, accents, and defaults.
 * Avoids hardcoding image URLs across components.
 */

export interface DestinationProfile {
  id: string;
  name: string;
  country: string;
  coverImage: string;
  accent: string;
  keywords: string[];
  climateDefault: string;
  popularActivities: string[];
}

export const DESTINATIONS: Record<string, DestinationProfile> = {
  goa: {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    accent: '#06D6A0',
    keywords: ['beach', 'sea', 'coastal', 'party', 'tropical', 'shack'],
    climateDefault: 'Warm tropical sunshine with sea breeze',
    popularActivities: ['Beach', 'Hiking', 'Sightseeing', 'Nightlife', 'Water Sports'],
  },
  paris: {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    accent: '#2BBAA5',
    keywords: ['museum', 'art', 'cafe', 'city', 'cultural', 'europe'],
    climateDefault: 'Temperate European seasons with occasional showers',
    popularActivities: ['Museum', 'City Tour', 'Fine Dining', 'Photography'],
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    accent: '#F96635',
    keywords: ['city', 'technology', 'ramen', 'temple', 'transit', 'shopping'],
    climateDefault: 'Mild temperate urban climate',
    popularActivities: ['Shopping', 'City Tour', 'Fine Dining', 'Photography'],
  },
  bali: {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    accent: '#06D6A0',
    keywords: ['surf', 'yoga', 'temple', 'jungle', 'beach', 'resort'],
    climateDefault: 'Warm tropical days with occasional monsoon drizzle',
    popularActivities: ['Beach', 'Hiking', 'Yoga', 'Sightseeing', 'Water Sports'],
  },
  manali: {
    id: 'manali',
    name: 'Manali',
    country: 'India',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    accent: '#93D3AE',
    keywords: ['mountain', 'snow', 'himalayas', 'trek', 'river', 'valley'],
    climateDefault: 'Crisp mountain air with cool nights and alpine wind',
    popularActivities: ['Mountain Hiking', 'Photography', 'Adventure', 'Sightseeing'],
  },
  ladakh: {
    id: 'ladakh',
    name: 'Ladakh',
    country: 'India',
    coverImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    accent: '#F9A822',
    keywords: ['high altitude', 'monastery', 'lake', 'pass', 'road trip'],
    climateDefault: 'Dry cold desert climate with intense sun and chilly winds',
    popularActivities: ['Photography', 'Mountain Hiking', 'Sightseeing', 'Road Trip'],
  },
  london: {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    accent: '#0C4137',
    keywords: ['history', 'theatre', 'pub', 'museum', 'royal', 'thames'],
    climateDefault: 'Cool temperate weather with overcast skies',
    popularActivities: ['Museum', 'City Tour', 'Fine Dining', 'Shopping'],
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain Highlands',
    country: 'Global',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    accent: '#0C4137',
    keywords: ['hiking', 'trek', 'alpine', 'peak', 'trail', 'nature'],
    climateDefault: 'Variable mountain weather with rapid elevation cooling',
    popularActivities: ['Mountain Hiking', 'Camping', 'Photography'],
  },
  beach: {
    id: 'beach',
    name: 'Coastal Haven',
    country: 'Global',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    accent: '#06D6A0',
    keywords: ['beach', 'ocean', 'coastal', 'sand', 'surf', 'island'],
    climateDefault: 'Sunny marine conditions with tropical warmth',
    popularActivities: ['Beach', 'Swimming', 'Water Sports', 'Sunset Walk'],
  },
  default: {
    id: 'default',
    name: 'World Explorer',
    country: 'Global',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    accent: '#0C4137',
    keywords: ['travel', 'explore', 'vacation', 'journey', 'trip'],
    climateDefault: 'Standard seasonal weather',
    popularActivities: ['City Tour', 'Sightseeing', 'Photography', 'Dining'],
  },
};

/**
 * Resolves the best matching cover image and profile for any destination query.
 */
export function resolveDestination(destinationStr?: string): DestinationProfile {
  if (!destinationStr) return DESTINATIONS.default;

  const normalized = destinationStr.toLowerCase().trim();

  // 1. Direct match on ID
  for (const [key, profile] of Object.entries(DESTINATIONS)) {
    if (normalized.includes(key)) return profile;
  }

  // 2. Keyword match
  for (const profile of Object.values(DESTINATIONS)) {
    if (profile.keywords.some((kw) => normalized.includes(kw))) {
      return profile;
    }
  }

  // 3. Fallback
  return {
    ...DESTINATIONS.default,
    name: destinationStr,
  };
}

export interface DestinationRouteMeta {
  code: string;
  origin: string;
  destination: string;
  route: string;
  mood: string;
  coordinates: string;
  elevation: string;
}

const ROUTE_LOOKUP: Record<string, Partial<DestinationRouteMeta>> = {
  goa: {
    code: 'GOI',
    origin: 'BOM',
    destination: 'GOI',
    route: 'BOM ➔ GOI',
    mood: 'Coastal breeze, palm groves & emerald tides',
    coordinates: '15.2993° N, 74.1240° E',
    elevation: '8 m',
  },
  paris: {
    code: 'CDG',
    origin: 'LHR',
    destination: 'CDG',
    route: 'LHR ➔ CDG',
    mood: 'Cobblestones, river Seine & boulevard afternoons',
    coordinates: '48.8566° N, 2.3522° E',
    elevation: '35 m',
  },
  tokyo: {
    code: 'HND',
    origin: 'SFO',
    destination: 'HND',
    route: 'SFO ➔ HND',
    mood: 'Neon alleys, shinkansen rails & quiet shrines',
    coordinates: '35.6762° N, 139.6503° E',
    elevation: '40 m',
  },
  bali: {
    code: 'DPS',
    origin: 'SIN',
    destination: 'DPS',
    route: 'SIN ➔ DPS',
    mood: 'Volcanic peaks, terraced paddies & ocean surf',
    coordinates: '8.3405° S, 115.0920° E',
    elevation: '12 m',
  },
  manali: {
    code: 'KUU',
    origin: 'DEL',
    destination: 'KUU',
    route: 'DEL ➔ KUU',
    mood: 'Alpine pine forests, river valleys & crisp mountain air',
    coordinates: '32.2396° N, 77.1887° E',
    elevation: '2,050 m',
  },
  ladakh: {
    code: 'IXL',
    origin: 'DEL',
    destination: 'IXL',
    route: 'DEL ➔ IXL',
    mood: 'High Himalayan passes, monasteries & azure skies',
    coordinates: '34.1526° N, 77.5771° E',
    elevation: '3,500 m',
  },
  london: {
    code: 'LHR',
    origin: 'JFK',
    destination: 'LHR',
    route: 'JFK ➔ LHR',
    mood: 'Thames mist, heritage brick & rain-washed streets',
    coordinates: '51.5074° N, 0.1278° W',
    elevation: '11 m',
  },
};

export function getDestinationRouteMeta(destinationStr?: string): DestinationRouteMeta {
  if (!destinationStr) {
    return {
      code: 'PKP',
      origin: 'EXP',
      destination: 'PKP',
      route: 'ORIGIN ➔ DEST',
      mood: 'Curated journey, open roads & expedition log',
      coordinates: '28.6139° N, 77.2090° E',
      elevation: '216 m',
    };
  }

  const normalized = destinationStr.toLowerCase().trim();
  for (const [key, meta] of Object.entries(ROUTE_LOOKUP)) {
    if (normalized.includes(key)) {
      return {
        code: meta.code || 'PKP',
        origin: meta.origin || 'DEL',
        destination: meta.destination || meta.code || 'PKP',
        route: meta.route || `DEL ➔ ${meta.code || 'PKP'}`,
        mood: meta.mood || 'Curated journey & expedition log',
        coordinates: meta.coordinates || '28.6139° N, 77.2090° E',
        elevation: meta.elevation || 'Sea Level',
      };
    }
  }

  // Generic fallback code from string
  const cleanCode = destinationStr.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'PKP';
  return {
    code: cleanCode,
    origin: 'DEL',
    destination: cleanCode,
    route: `DEL ➔ ${cleanCode}`,
    mood: `Curated journey, open horizons & expedition log`,
    coordinates: '28.6139° N, 77.2090° E',
    elevation: 'Terrain Varied',
  };
}

