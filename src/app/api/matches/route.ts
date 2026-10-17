import { NextResponse } from 'next/server';
import { getLiveAndUpcomingMatches } from '@/lib/oddsEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const liveOnly = searchParams.get('live') === 'true';
  const apiKey = searchParams.get('apiKey') || process.env.THE_ODDS_API_KEY;

  const result = await getLiveAndUpcomingMatches(apiKey);
  let matches = result.matches;

  if (sport && sport !== 'todos') {
    matches = matches.filter(m => m.sport === sport);
  }

  if (liveOnly) {
    matches = matches.filter(m => m.isLive);
  }

  return NextResponse.json({
    success: true,
    source: result.source,
    quotaRemaining: result.quotaRemaining,
    total: matches.length,
    matches,
  });
}
