import nodemailer from 'nodemailer';

export interface SendOtpResult {
  success: boolean;
  code: string;
  simulated: boolean;
  message: string;
  error?: string;
}

export const EmailService = {
  /**
   * Envia o código OTP de validação de 6 dígitos para o e-mail do jogador
   */
  async sendVerificationCode(toEmail: string, userName: string, code: string): Promise<SendOtpResult> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `"BetCerta Brasil" <${smtpUser}>` : '"BetCerta Brasil" <suporte@betcerta.com>');

    const htmlContent = `
      <div style="background-color: #080c16; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #f59e0b;">
          <h1 style="margin: 0; color: #f59e0b; font-size: 28px; letter-spacing: 1px;">⚡ Bet<span style="color: #ffffff;">Certa</span></h1>
          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">A melhor plataforma de apostas esportivas do Brasil</p>
        </div>

        <div style="padding: 30px 25px; text-align: center;">
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Ativação de Conta</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
            Olá, <strong>${userName}</strong>! Para concluir o seu cadastro na BetCerta e ter acesso a depósitos e saques instantâneos via PIX, confirme seu e-mail com o código abaixo:
          </p>

          <div style="background: #0f172a; border: 2px dashed #f59e0b; border-radius: 10px; padding: 18px; margin: 25px auto; max-width: 280px;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #10b981; font-family: monospace;">
              ${code}
            </span>
          </div>

          <p style="color: #64748b; font-size: 13px; margin: 15px 0 0;">
            ⏱️ Este código é válido por <strong>15 minutos</strong>. Não compartilhe este código com ninguém.
          </p>
        </div>

        <div style="background: #050811; padding: 20px; text-align: center; border-top: 1px solid #1e293b; color: #64748b; font-size: 12px;">
          <p style="margin: 0;">© 2026 BetCerta Brasil. Todos os direitos reservados.</p>
          <p style="margin: 5px 0 0;">Se você não solicitou este cadastro, desconsidere este e-mail.</p>
        </div>
      </div>
    `;

    // Se as credenciais de SMTP estiverem configuradas no .env.local, envia de verdade
    if (smtpUser && smtpPass) {
      try {
        const isGmail = smtpHost === 'smtp.gmail.com' || smtpUser.includes('@gmail.com');
        
        const transportConfig = isGmail
          ? {
              service: 'gmail',
              auth: {
                user: smtpUser,
                pass: smtpPass.replace(/\s+/g, ''), // Remove espaços que o Google gera na senha de app
              },
            }
          : {
              host: smtpHost || 'smtp.gmail.com',
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            };

        const transporter = nodemailer.createTransport(transportConfig);

        const info = await transporter.sendMail({
          from: smtpFrom,
          to: toEmail,
          subject: `${code} é o seu código de validação BetCerta ⚡`,
          html: htmlContent,
        });

        console.log(`[EmailService] E-mail de validação enviado com sucesso para ${toEmail}! MessageId: ${info.messageId}`);
        return {
          success: true,
          code,
          simulated: false,
          message: `Código enviado com sucesso para seu e-mail (${toEmail}). Verifique sua caixa de entrada e spam!`,
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[EmailService] Erro ao enviar e-mail via SMTP:', errorMsg);
        return {
          success: false,
          code,
          simulated: false,
          message: `Falha no envio de e-mail via SMTP: ${errorMsg}`,
          error: errorMsg,
        };
      }
    }

    // Modo de Desenvolvimento / Simulação (Quando SMTP ainda não foi preenchido no .env.local)
    console.log('\n========================================');
    console.log(`✉️ [CÓDIGO DE VALIDAÇÃO BETCERTA - SIMULAÇÃO]`);
    console.log(`Para: ${toEmail} (${userName})`);
    console.log(`Código: ${code}`);
    console.log('Configure SMTP_USER e SMTP_PASS no .env.local para envio real!');
    console.log('========================================\n');

    return {
      success: true,
      code,
      simulated: true,
      message: `Modo Simulação: Código gerado: ${code}. Configure o SMTP para receber na sua caixa de entrada!`,
    };
  },
};
