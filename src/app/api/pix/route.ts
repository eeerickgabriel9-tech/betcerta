import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valor de depósito inválido.' },
        { status: 400 }
      );
    }

    const txId = `PIX-${Math.floor(100000 + Math.random() * 900000)}`;
    const copyPaste = `00020126580014br.gov.bcb.pix0136betcerta-${txId}520400005303986540${Number(amount).toFixed(2)}5802BR5925BETCERTA ENTRETENIMENTO6009SAO PAULO62070503***6304`;

    return NextResponse.json({
      success: true,
      txId,
      amount,
      copyPaste,
      expiresInSeconds: 900,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar PIX: ' + err.message },
      { status: 500 }
    );
  }
}
