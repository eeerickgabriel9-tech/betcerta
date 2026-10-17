import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matchId, homeTeam, awayTeam, homeScore, awayScore, winner } = body;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'ID da partida não informado.' }, { status: 400 });
    }

    const calculatedWinner: 'home' | 'draw' | 'away' =
      winner ||
      (homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw');

    const result = BetCertaDb.settleMatch(matchId, {
      homeTeam: homeTeam || 'Mandante',
      awayTeam: awayTeam || 'Visitante',
      homeScore: typeof homeScore === 'number' ? homeScore : 0,
      awayScore: typeof awayScore === 'number' ? awayScore : 0,
      winner: calculatedWinner,
    });

    const stats = BetCertaDb.getBetStats();

    return NextResponse.json({
      success: true,
      message: `Partida liquidada com sucesso! ${result.wonCount} Green(s) e ${result.lostCount} Red(s).`,
      report: result,
      globalStats: stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao liquidar partida';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
