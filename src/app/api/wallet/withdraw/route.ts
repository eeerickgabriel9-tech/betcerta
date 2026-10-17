import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, amount, pixKeyType, pixKey } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado.' },
        { status: 401 }
      );
    }

    const result = BetCertaDb.requestWithdrawal({
      userId: userId || userEmail,
      userEmail,
      userName: userName || 'Cliente BetCerta',
      amount: Number(amount),
      pixKeyType: pixKeyType || 'cpf',
      pixKey: pixKey || '',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Solicitação de saque de R$ ${Number(amount).toFixed(2)} criada com sucesso! Processamento via PIX em andamento.`,
      withdrawal: result.withdrawal,
      newSaldo: result.newSaldo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar saque';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || searchParams.get('email');
    const status = searchParams.get('status') || undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de usuário não fornecido.' },
        { status: 400 }
      );
    }

    const withdrawals = BetCertaDb.getWithdrawals({ userId, status });
    return NextResponse.json({ success: true, withdrawals });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar saques';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
