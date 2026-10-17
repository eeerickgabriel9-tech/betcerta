import { NextResponse } from 'next/server';
import { BetCertaDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailOrCpf, password } = body;

    if (!emailOrCpf || !password) {
      return NextResponse.json(
        { success: false, error: 'Preencha seu e-mail/CPF e sua senha.' },
        { status: 400 }
      );
    }

    const result = BetCertaDb.login(emailOrCpf, password);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
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
    const msg = err instanceof Error ? err.message : 'Erro ao processar login';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
