import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';

export async function GET() {
  try {
    const users = BetCertaDb.getAllUsers();
    const totalSaldo = users.reduce((acc, u) => acc + u.saldo, 0);

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      totalSaldo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar usuários';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, newSaldo } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'ID do usuário não informado' }, { status: 400 });
    }

    if (action === 'toggle_status') {
      const res = BetCertaDb.toggleUserStatus(userId);
      return NextResponse.json({ success: true, status: res.status });
    }

    if (action === 'adjust_balance' && typeof newSaldo === 'number') {
      const res = BetCertaDb.adminAdjustBalance(userId, newSaldo);
      return NextResponse.json({ success: res.success });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar ação';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
