import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';
import { AutonomousSettlementEngine } from '@/lib/autonomousSettlementEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const status = searchParams.get('status') || undefined;

    // Executa liquidação autônoma de qualquer jogo encerrado antes de listar
    await AutonomousSettlementEngine.runAutoSettle().catch(() => {});

    const bets = BetCertaDb.getBets({ userId, status });
    const stats = BetCertaDb.getBetStats();

    return NextResponse.json({
      success: true,
      bets,
      stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar apostas';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, selections, stake, totalOdds, potentialReturn, isFreebet } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Faça login para realizar apostas.' }, { status: 401 });
    }

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma seleção no bilhete.' }, { status: 400 });
    }

    if (!stake || stake <= 0) {
      return NextResponse.json({ success: false, error: 'Valor da aposta deve ser maior que zero.' }, { status: 400 });
    }

    const result = BetCertaDb.placeBet({
      userId,
      selections,
      stake,
      totalOdds,
      potentialReturn,
      isFreebet: Boolean(isFreebet),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      bet: result.bet,
      newSaldo: result.newSaldo,
      newBonus: result.newBonus,
      message: isFreebet ? '🎉 Aposta Grátis confirmada! Boa sorte!' : 'Aposta confirmada com sucesso! Boa sorte!',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar aposta';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
