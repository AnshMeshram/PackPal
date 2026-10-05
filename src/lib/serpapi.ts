export interface DestinationSearchResult {
  title: string;
  snippet: string;
  weatherForecast?: string;
  recommendedPlaces?: string[];
}

export async function searchDestinationInfo(destination: string): Promise<DestinationSearchResult> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    return {
      title: `${destination} Travel Guide`,
      snippet: `General travel information for ${destination}. Weather typically varies by season.`,
      weatherForecast: 'Moderate conditions expected',
      recommendedPlaces: ['City Center', 'Key Landmarks', 'Local Markets'],
    };
  }

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${destination} travel weather forecast packing tips`,
      api_key: apiKey,
    });

    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`SerpApi error: ${response.statusText}`);
    }

    const data = await response.json();
    const organicResults = data.organic_results || [];
    const topSnippet = organicResults[0]?.snippet || `Travel info for ${destination}`;
    const weatherSnippet = data.answer_box?.snippet || data.knowledge_graph?.description || '';

    return {
      title: data.knowledge_graph?.title || destination,
      snippet: topSnippet,
      weatherForecast: weatherSnippet || 'Check local seasonal forecasts before packing.',
      recommendedPlaces: organicResults.slice(0, 3).map((r: { title: string }) => r.title),
    };
  } catch (error) {
    console.error('Failed to fetch from SerpApi:', error);
    return {
      title: destination,
      snippet: `Fallback guide for ${destination}`,
      weatherForecast: 'Variable weather',
      recommendedPlaces: [],
    };
  }
}
