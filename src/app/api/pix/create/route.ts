import { NextResponse } from 'next/server';
import { PixService } from '@/lib/pixService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, userName, userEmail } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { success: false, error: 'O valor mínimo para depósito é de R$ 1,00' },
        { status: 400 }
      );
    }

    const deposit = await PixService.createPix(
      numAmount,
      userName || 'Cliente BetCerta',
      userEmail || 'cliente@betcerta.com'
    );

    return NextResponse.json({
      success: true,
      deposit,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erro interno ao gerar PIX';
    console.error('[API /api/pix/create] Erro:', err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
