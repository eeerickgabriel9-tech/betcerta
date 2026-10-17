import { NextResponse } from 'next/server';
import { PixService } from '@/lib/pixService';

export async function GET() {
  try {
    const pending = PixService.getPendingDeposits();
    const all = PixService.getAllDeposits();

    return NextResponse.json({
      success: true,
      pending,
      all,
      countPending: pending.length,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao listar depósitos';
    console.error('[API /api/pix/admin GET] Erro:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do pagamento não informado' }, { status: 400 });
    }

    if (action === 'approve') {
      const deposit = PixService.approveDeposit(id);
      if (!deposit) {
        return NextResponse.json({ success: false, error: 'Depósito não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, deposit, message: 'Depósito aprovado com sucesso!' });
    }

    if (action === 'reject') {
      const deposit = PixService.rejectDeposit(id);
      return NextResponse.json({ success: true, deposit, message: 'Depósito rejeitado.' });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao processar ação';
    console.error('[API /api/pix/admin POST] Erro:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
