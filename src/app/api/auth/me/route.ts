import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';
import { AutonomousSettlementEngine } from '@/lib/autonomousSettlementEngine';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    let token = authHeader?.replace('Bearer ', '') || null;

    if (!token) {
      // Tentar pegar do cookie
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/betcerta_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    // Liquida automaticamente qualquer aposta encerrada para refletir saldo imediato
    await AutonomousSettlementEngine.runAutoSettle().catch(() => {});

    const user = BetCertaDb.getUserByToken(token);

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao recuperar sessão';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
