import { NextRequest, NextResponse } from 'next/server';
import { searchDestinationInfo } from '@/lib/serpapi';
import { generatePackingRecommendations } from '@/lib/ollama';
import { generateSpeechAudio } from '@/lib/elevenlabs';
import { logError } from '@/lib/sentry';
import { TripDetails } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trip: TripDetails = body.trip;
    const includeAudio: boolean = !!body.includeAudio;
    const baggageLimitKg: number | undefined = body.baggageLimitKg;
    const packingRules: string[] | undefined = body.packingRules;
    const travelStyle: string | undefined = body.travelStyle;

    if (!trip || !trip.destination) {
      return NextResponse.json({ error: 'Trip destination is required.' }, { status: 400 });
    }

    // 1. Fetch live destination info & weather via SerpApi
    const destinationInfo = await searchDestinationInfo(trip.destination);

    // 2. Generate packing items via Ollama/Gemma or fallback business logic
    const { items, source } = await generatePackingRecommendations(
      trip,
      destinationInfo,
      baggageLimitKg,
      packingRules,
      travelStyle
    );

    // 3. Optionally synthesize ElevenLabs voice summary
    let audioBase64: string | null = null;
    if (includeAudio) {
      try {
        const summaryText = `Here is your packing list for ${trip.destination}. We included ${items.length} items tailored for ${trip.durationDays} days of ${trip.tripType} travel.`;
        const audioBuffer = await generateSpeechAudio(summaryText);
        if (audioBuffer) {
          audioBase64 = Buffer.from(audioBuffer).toString('base64');
        }
      } catch (audioErr) {
        logError(audioErr, { context: 'ElevenLabs in /api/pack' });
      }
    }

    // 4. Try MongoDB persistence (optional, graceful degradation)
    try {
      const { getDatabase } = await import('@/lib/mongodb');
      const db = await getDatabase();
      await db.collection('packing_lists').insertOne({
        title: `Trip to ${trip.destination}`,
        tripDetails: {
          ...trip,
          weather: {
            condition: destinationInfo.weatherForecast || 'Standard',
            temperatureRange: 'Seasonal',
          },
        },
        items,
        source,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch {
      // MongoDB offline — fine, we still return results
    }

    return NextResponse.json({
      items,
      destinationInfo,
      audioBase64,
      source,
      status: 'success',
    });
  } catch (err) {
    logError(err, { endpoint: '/api/pack' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
