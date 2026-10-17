import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';
import { PixService } from '@/lib/pixService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get('email');
    const authHeader = req.headers.get('Authorization');
    let token = authHeader?.replace('Bearer ', '') || null;

    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/betcerta_token=([^;]+)/);
      if (match) token = match[1];
    }

    let user = null;
    if (token) {
      user = BetCertaDb.getUserByToken(token);
      if (user) {
        email = user.email;
      }
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado.' },
        { status: 401 }
      );
    }

    // Coleta dados e estatísticas do banco
    const profileData = BetCertaDb.getUserProfileStats(email);

    // Se o usuário não estiver autenticado por token mas passou o e-mail
    if (!user && profileData.user) {
      user = profileData.user;
    }

    // Verifica se há depósitos pendentes deste usuário no PixService
    const allPending = PixService.getPendingDeposits();
    const userPendingDeposit = allPending.find(
      d =>
        d.userEmail?.toLowerCase() === email?.toLowerCase() ||
        (user?.name && d.userName?.toLowerCase() === user.name.toLowerCase())
    ) || null;

    // Busca histórico de depósitos do usuário
    const allDeposits = PixService.getAllDeposits();
    const userDeposits = allDeposits
      .filter(
        d =>
          d.userEmail?.toLowerCase() === email?.toLowerCase() ||
          (user?.name && d.userName?.toLowerCase() === user.name.toLowerCase())
      )
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      user: user || {
        name: 'Apostador VIP',
        email,
        cpf: '***.456.789-**',
        saldo: 0,
        bonus: 0,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      stats: profileData.stats,
      vipInfo: profileData.vipInfo,
      recentBets: profileData.recentBets,
      recentWithdrawals: profileData.recentWithdrawals,
      userDeposits,
      pendingDeposit: userPendingDeposit,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao obter dados do perfil';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
