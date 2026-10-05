import { resolveDestination } from '@/lib/destinations';

export interface DestinationImageResult {
  url: string;
  title: string;
  source: 'serpapi' | 'local';
}

// In-memory server cache to avoid repeated SerpApi calls for the same destination
const imageCache = new Map<string, DestinationImageResult>();

export async function getDestinationImage(destination: string): Promise<DestinationImageResult> {
  const normalized = destination.trim().toLowerCase();
  if (!normalized) {
    const fallback = resolveDestination('default');
    return { url: fallback.coverImage, title: fallback.name, source: 'local' };
  }

  // 1. Check memory cache
  const cached = imageCache.get(normalized);
  if (cached) {
    return cached;
  }

  // 2. Try SerpApi Google Images if key is configured
  const apiKey = process.env.SERPAPI_API_KEY;
  if (apiKey) {
    try {
      const hasCountry = /india|france|japan|indonesia|usa|united states|uk|united kingdom|italy|spain|germany|thailand|vietnam|australia/i.test(normalized);
      const query = hasCountry
        ? `${destination} travel landmark scenery`
        : `${destination} India travel landmark scenery`;

      const params = new URLSearchParams({
        engine: 'google_images',
        q: query,
        api_key: apiKey,
        num: '5',
      });

      const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        const images = data.images_results || [];

        // Pick first usable, non-tiny, non-ad image
        const candidate = images.find((img: { original?: string; thumbnail?: string; is_product?: boolean }) => {
          if (img.is_product) return false;
          const url = img.original || img.thumbnail;
          return url && typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'));
        });

        if (candidate) {
          const result: DestinationImageResult = {
            url: candidate.original || candidate.thumbnail,
            title: candidate.title || destination,
            source: 'serpapi',
          };
          imageCache.set(normalized, result);
          return result;
        }
      }
    } catch {
      // SerpApi timed out or failed; seamlessly fall through to local fallback
    }
  }

  // 3. Fallback to existing curated destination registry
  const profile = resolveDestination(destination);
  const result: DestinationImageResult = {
    url: profile.coverImage,
    title: profile.name,
    source: 'local',
  };
  imageCache.set(normalized, result);
  return result;
}
