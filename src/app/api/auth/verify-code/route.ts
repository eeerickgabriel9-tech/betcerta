import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';
import { EmailService } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, action } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'E-mail não informado.' }, { status: 400 });
    }

    // Ação: Reenviar código
    if (action === 'resend') {
      const resendResult = BetCertaDb.resendVerificationCode(email);
      if (!resendResult.success || !resendResult.verificationCode) {
        return NextResponse.json({ success: false, error: resendResult.error || 'Erro ao reenviar código.' }, { status: 400 });
      }

      const emailRes = await EmailService.sendVerificationCode(
        email,
        resendResult.userName || 'Jogador',
        resendResult.verificationCode
      );

      return NextResponse.json({
        success: true,
        message: emailRes.message,
        codePreview: emailRes.simulated ? resendResult.verificationCode : undefined,
        simulated: emailRes.simulated,
      });
    }

    // Ação Padrão: Validar código
    if (!code || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Digite o código completo de 6 dígitos.' },
        { status: 400 }
      );
    }

    const result = BetCertaDb.verifyEmailCode(email, code);

    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'E-mail validado com sucesso! Bem-vindo à BetCerta.',
    });

    if (result.token) {
      response.cookies.set('betcerta_token', result.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao validar código';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
