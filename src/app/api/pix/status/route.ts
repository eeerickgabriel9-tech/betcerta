import { NextResponse } from 'next/server';
import { PixService } from '@/lib/pixService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do pagamento não informado' }, { status: 400 });
    }

    const deposit = await PixService.checkDepositStatus(id);

    if (!deposit) {
      return NextResponse.json({ success: false, error: 'Depósito não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deposit,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar status';
    console.error('[API /api/pix/status] Erro:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
