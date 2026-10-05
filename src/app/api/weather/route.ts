import { NextRequest, NextResponse } from 'next/server';
import { searchDestinationInfo } from '@/lib/serpapi';
import { logError } from '@/lib/sentry';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get('destination');

    if (!destination) {
      return NextResponse.json({ error: 'destination query parameter is required.' }, { status: 400 });
    }

    const info = await searchDestinationInfo(destination);

    return NextResponse.json({
      weather: {
        condition: info.weatherForecast || 'Standard conditions',
        temperatureRange: 'Seasonal',
        source: process.env.SERPAPI_API_KEY ? 'live' : 'fallback',
      },
      destinationInfo: info,
      status: 'success',
    });
  } catch (err) {
    logError(err, { endpoint: '/api/weather' });
    return NextResponse.json({ error: 'Failed to fetch weather information.' }, { status: 500 });
  }
}
