import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';
import { EmailService } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = BetCertaDb.createUser(body);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json({ success: false, error: result.error || 'Erro ao criar conta.' }, { status: 400 });
    }

    // Cria a resposta de sucesso com login instantâneo e Aposta Grátis ativa
    const response = NextResponse.json({
      success: true,
      token: result.token,
      user: result.user,
      bonus: result.user.bonus,
      message: '🎉 Parabéns! Sua conta foi criada e você ganhou R$ 20,00 em Aposta Grátis!',
    });

    // Definir cookie de sessão para login imediato sem nenhuma barreira
    response.cookies.set({
      name: 'betcerta_token',
      value: result.token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
    });

    // Enviar e-mail de boas-vindas em segundo plano (sem bloquear a navegação do usuário)
    if (result.verificationCode) {
      EmailService.sendVerificationCode(result.user.email, result.user.name, result.verificationCode).catch(() => {});
    }

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar cadastro';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
