import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, level } = body;

    if (!email || !level) {
      return NextResponse.json(
        { success: false, error: 'E-mail e nível VIP são obrigatórios.' },
        { status: 400 }
      );
    }

    const res = BetCertaDb.claimVipReward(email, Number(level));

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Parabéns! Você subiu para ${res.tierName} e ganhou R$ ${res.rewardAmount?.toFixed(2)} de Aposta Grátis!`,
      rewardAmount: res.rewardAmount,
      newSaldo: res.newSaldo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao resgatar recompensa VIP';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
