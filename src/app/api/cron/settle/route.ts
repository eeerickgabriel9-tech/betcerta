import { NextResponse } from 'next/server';
import { AutonomousSettlementEngine } from '@/lib/autonomousSettlementEngine';
import { BetCertaDb } from '@/lib/db';

export async function GET() {
  try {
    const stats = BetCertaDb.getBetStats();
    return NextResponse.json({
      success: true,
      service: 'Robô de Liquidação Autônoma BetCerta 24/7',
      status: 'active',
      stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro no serviço de liquidação';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { matchId } = body;

    let report;
    if (matchId) {
      report = await AutonomousSettlementEngine.forceSettleMatchAuto(matchId);
    } else {
      report = await AutonomousSettlementEngine.runAutoSettle();
    }

    const stats = BetCertaDb.getBetStats();

    return NextResponse.json({
      success: true,
      service: 'Robô de Liquidação Autônoma BetCerta 24/7',
      report,
      stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao executar liquidação autônoma';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
