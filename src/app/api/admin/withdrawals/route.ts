import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const withdrawals = BetCertaDb.getWithdrawals({ status });
    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const totalPendingAmount = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    return NextResponse.json({
      success: true,
      withdrawals,
      stats: {
        pendingCount,
        totalPendingAmount: parseFloat(totalPendingAmount.toFixed(2)),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar saques';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, withdrawalId, reason } = body;

    if (!withdrawalId) {
      return NextResponse.json(
        { success: false, error: 'ID do saque obrigatório' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const res = BetCertaDb.approveWithdrawal(withdrawalId);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Saque aprovado e confirmado com sucesso!',
        withdrawal: res.withdrawal,
      });
    }

    if (action === 'reject') {
      const res = BetCertaDb.rejectWithdrawal(withdrawalId, reason || 'Dados bancários inconsistentes');
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Saque recusado e saldo estornado para o jogador!',
        withdrawal: res.withdrawal,
        refundedSaldo: res.refundedSaldo,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Ação inválida (use approve ou reject)' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar saque';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
