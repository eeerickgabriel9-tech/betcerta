import fs from 'fs';
import path from 'path';

export interface PixDeposit {
  id: string;
  amount: number;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl?: string;
  approvedBy?: 'owner' | 'mercadopago';
  approvedAt?: string;
}

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'depositsCache.json');

function loadDepositsFromDisk(): Map<string, PixDeposit> {
  const map = new Map<string, PixDeposit>();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const list: PixDeposit[] = JSON.parse(data);
      list.forEach(item => map.set(item.id, item));
    }
  } catch (err) {
    console.error('[PixService] Erro ao ler depositsCache.json:', err);
  }
  return map;
}

function saveDepositsToDisk(map: Map<string, PixDeposit>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(CACHE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PixService] Erro ao salvar depositsCache.json:', err);
  }
}

// Global singleton para Next.js HMR
const globalForPix = globalThis as unknown as {
  __betcerta_deposits__?: Map<string, PixDeposit>;
};

if (!globalForPix.__betcerta_deposits__) {
  globalForPix.__betcerta_deposits__ = loadDepositsFromDisk();
}

const deposits = globalForPix.__betcerta_deposits__;

export const PixService = {
  /**
   * Cria uma transação PIX oficial no Mercado Pago
   */
  async createPix(amount: number, userName: string, userEmail: string): Promise<PixDeposit> {
    const token =
      process.env.MERCADO_PAGO_ACCESS_TOKEN ||
      'APP_USR-4318026240287516-101611-0255b48f04d8256baeed73ebe27f5c9b-285185672';

    const idempotencyKey = `betcerta-pix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: 'Depósito BetCerta',
        statement_descriptor: 'BETCERTA',
        payment_method_id: 'pix',
        payer: {
          email: userEmail || 'cliente@betcerta.com',
          first_name: userName.split(' ')[0] || 'Cliente',
          last_name: userName.split(' ').slice(1).join(' ') || 'BetCerta',
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      console.error('[PixService] Erro ao criar PIX no Mercado Pago:', data);
      throw new Error(data.message || 'Falha ao gerar PIX com Mercado Pago');
    }

    const txData = data.point_of_interaction?.transaction_data;
    const qrCode = txData?.qr_code || '';
    const qrCodeBase64 = txData?.qr_code_base64 || '';
    const ticketUrl = txData?.ticket_url || '';

    const newDeposit: PixDeposit = {
      id: String(data.id),
      amount,
      userName: userName || 'Cliente BetCerta',
      userEmail: userEmail || 'cliente@betcerta.com',
      status: data.status === 'approved' ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      qrCode,
      qrCodeBase64,
      ticketUrl,
    };

    deposits.set(newDeposit.id, newDeposit);
    saveDepositsToDisk(deposits);

    return newDeposit;
  },

  /**
   * Consulta status do depósito (Verifica aprovação manual ou atualização no Mercado Pago)
   */
  async checkDepositStatus(id: string): Promise<PixDeposit | null> {
    const existing = deposits.get(id);
    if (!existing) return null;

    // Se já foi aprovado manualmente ou anteriormente, retorna aprovado
    if (existing.status === 'approved') {
      return existing;
    }

    // Consulta se o Mercado Pago já identificou o pagamento no banco
    try {
      const token =
        process.env.MERCADO_PAGO_ACCESS_TOKEN ||
        'APP_USR-4318026240287516-101611-0255b48f04d8256baeed73ebe27f5c9b-285185672';

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const mpData = await res.json();
        if (mpData.status === 'approved') {
          existing.status = 'approved';
          existing.approvedBy = 'mercadopago';
          existing.approvedAt = new Date().toISOString();
          deposits.set(id, existing);
          saveDepositsToDisk(deposits);
          return existing;
        }
      }
    } catch (err) {
      console.error('[PixService] Erro ao consultar status no MP:', err);
    }

    return existing;
  },

  /**
   * Aprovação manual pelo Dono com 1 clique no Painel Admin
   */
  approveDeposit(id: string): PixDeposit | null {
    const deposit = deposits.get(id);
    if (!deposit) return null;

    deposit.status = 'approved';
    deposit.approvedBy = 'owner';
    deposit.approvedAt = new Date().toISOString();
    deposits.set(id, deposit);
    saveDepositsToDisk(deposits);
    return deposit;
  },

  /**
   * Rejeita depósito
   */
  rejectDeposit(id: string): PixDeposit | null {
    const deposit = deposits.get(id);
    if (!deposit) return null;

    deposit.status = 'rejected';
    deposits.set(id, deposit);
    saveDepositsToDisk(deposits);
    return deposit;
  },

  /**
   * Lista todos os depósitos pendentes para o Painel Admin
   */
  getPendingDeposits(): PixDeposit[] {
    return Array.from(deposits.values())
      .filter(d => d.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Lista todos os depósitos (histórico completo)
   */
  getAllDeposits(): PixDeposit[] {
    return Array.from(deposits.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
