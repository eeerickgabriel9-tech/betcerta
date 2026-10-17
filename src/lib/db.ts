import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  passwordHash: string;
  salt: string;
  saldo: number;
  bonus: number;
  status: 'active' | 'blocked';
  role: 'user' | 'admin';
  emailVerified: boolean;
  verificationCode?: string;
  codeExpiresAt?: string;
  createdAt: string;
  lastLogin: string;
  vipClaimedRewards?: number[];
}

export interface VipTier {
  level: number;
  name: string;
  badge: string;
  icon: string;
  minWager: number;
  rewardFreebet: number;
  perks: string[];
}

export const VIP_TIERS: VipTier[] = [
  {
    level: 1,
    name: 'Básico',
    badge: '🥉 Bronze',
    icon: '🥉',
    minWager: 0,
    rewardFreebet: 0,
    perks: ['Acesso a todos os esportes', 'Depósitos e Saques PIX 24/7'],
  },
  {
    level: 2,
    name: 'VIP Prata',
    badge: '🥈 Prata',
    icon: '🥈',
    minWager: 250,
    rewardFreebet: 50,
    perks: ['+R$ 50,00 de Aposta Grátis', 'Suporte Prioritário no Chat', 'Odds turbinadas nos clássicos'],
  },
  {
    level: 3,
    name: 'VIP Ouro',
    badge: '🥇 Ouro',
    icon: '🥇',
    minWager: 1000,
    rewardFreebet: 150,
    perks: ['+R$ 150,00 de Aposta Grátis', 'Saques PIX prioritários em 5 min', 'Cashback semanal de 5%'],
  },
  {
    level: 4,
    name: 'VIP Platina',
    badge: '💎 Platina',
    icon: '💎',
    minWager: 2500,
    rewardFreebet: 250,
    perks: ['+R$ 250,00 de Aposta Grátis', 'Gerente de Conta VIP exclusivo', 'Cashback semanal de 10%'],
  },
  {
    level: 5,
    name: 'VIP Diamante',
    badge: '👑 Diamante',
    icon: '👑',
    minWager: 5000,
    rewardFreebet: 500,
    perks: ['+R$ 500,00 de Aposta Grátis', 'Cotações VIP personalizadas', 'Convites para finais e camarotes'],
  },
];

export interface UserSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface BetSelection {
  id: string;
  matchId: string;
  matchTitle: string;
  sport: string;
  marketName: string;
  selection: string;
  odd: number;
  status?: 'open' | 'won' | 'lost' | 'void';
}

export interface BetRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: 'open' | 'won' | 'lost' | 'cashed_out';
  cashOutValue?: number;
  settledAt?: string;
  resultDetails?: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  pixKeyType: string;
  pixKey: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface DbData {
  users: User[];
  sessions: UserSession[];
  bets: BetRecord[];
  withdrawals?: WithdrawalRecord[];
}

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'betcerta_db.json');

// Criptografia de senha usando crypto nativo do Node.js (PBKDF2)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function loadDb(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      parsed.bets = parsed.bets || [];
      parsed.sessions = parsed.sessions || [];
      parsed.users = parsed.users || [];
      parsed.withdrawals = parsed.withdrawals || [];
      return parsed;
    }
  } catch (err) {
    console.error('[Database] Erro ao carregar betcerta_db.json:', err);
  }

  // Se o arquivo não existir, inicializa com a conta de Administrador / Dono
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const initialDb: DbData = {
    users: [
      {
        id: 'usr_admin',
        name: 'Dono da BetCerta',
        email: 'admin@betcerta.com',
        cpf: '000.000.000-00',
        passwordHash: hashPassword('admin123', defaultSalt),
        salt: defaultSalt,
        saldo: 1000.0,
        bonus: 50.0,
        status: 'active',
        role: 'admin',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      {
        id: 'usr_demo',
        name: 'Carlos Apostador',
        email: 'carlos@teste.com',
        cpf: '123.456.789-00',
        passwordHash: hashPassword('123456', defaultSalt),
        salt: defaultSalt,
        saldo: 150.0,
        bonus: 50.0,
        status: 'active',
        role: 'user',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
    ],
    sessions: [],
    bets: [],
  };

  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: DbData) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Erro ao salvar betcerta_db.json:', err);
  }
}

// Singleton de banco de dados
const globalForDb = globalThis as unknown as {
  __betcerta_db__?: DbData;
};

function reloadDb(): DbData {
  const fresh = loadDb();
  globalForDb.__betcerta_db__ = fresh;
  return fresh;
}

if (!globalForDb.__betcerta_db__) {
  reloadDb();
}

let db = globalForDb.__betcerta_db__!;

// Limpar sessões expiradas a cada inicialização
const now = new Date().toISOString();
db.sessions = db.sessions.filter(s => s.expiresAt > now);

export const BetCertaDb = {
  /**
   * Cadastra um novo jogador no banco
   */
  createUser(params: { name: string; email: string; cpf: string; password: string }): {
    success: boolean;
    user?: Omit<User, 'passwordHash' | 'salt'>;
    verificationCode?: string;
    token?: string;
    error?: string;
  } {
    const emailNorm = params.email.trim().toLowerCase();
    const cpfNorm = params.cpf.replace(/\D/g, '');

    // Validações
    if (!params.name.trim()) return { success: false, error: 'Informe seu nome completo.' };
    if (!emailNorm.includes('@')) return { success: false, error: 'E-mail inválido.' };
    if (params.password.length < 6) return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };

    // Checar duplicidade de e-mail ou CPF
    const existingEmail = db.users.find(u => u.email.toLowerCase() === emailNorm);
    if (existingEmail) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    if (cpfNorm.length >= 11) {
      const existingCpf = db.users.find(u => u.cpf.replace(/\D/g, '') === cpfNorm);
      if (existingCpf) {
        return { success: false, error: 'Este CPF já está cadastrado em outra conta.' };
      }
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(params.password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newUser: User = {
      id: userId,
      name: params.name.trim(),
      email: emailNorm,
      cpf: params.cpf.trim(),
      passwordHash,
      salt,
      saldo: 0.0,
      bonus: 20.0, // 🎁 R$ 20,00 de Aposta Grátis imediata de Boas-Vindas
      status: 'active',
      role: 'user',
      emailVerified: true,
      verificationCode,
      codeExpiresAt,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Gerar sessão imediata para login instantâneo sem fricção
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    saveDb(db);

    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return { success: true, user: safeUser, token, verificationCode };
  },

  /**
   * Valida o código de 6 dígitos enviado por e-mail
   */
  verifyEmailCode(email: string, code: string): {
    success: boolean;
    user?: Omit<User, 'passwordHash' | 'salt'>;
    token?: string;
    error?: string;
  } {
    const emailNorm = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === emailNorm);

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (user.emailVerified) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), expiresAt });
      saveDb(db);
      const { passwordHash: _, salt: __, ...safeUser } = user;
      return { success: true, user: safeUser, token };
    }

    if (user.verificationCode !== code.trim()) {
      return { success: false, error: 'Código de 6 dígitos inválido. Verifique o e-mail.' };
    }

    if (user.codeExpiresAt && new Date() > new Date(user.codeExpiresAt)) {
      return { success: false, error: 'Este código expirou. Clique em Reenviar Código.' };
    }

    // Código validado com sucesso!
    user.emailVerified = true;
    delete user.verificationCode;
    delete user.codeExpiresAt;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), expiresAt });

    saveDb(db);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return { success: true, user: safeUser, token };
  },

  /**
   * Reenvia um novo código de verificação para o e-mail
   */
  resendVerificationCode(email: string): {
    success: boolean;
    verificationCode?: string;
    userName?: string;
    error?: string;
  } {
    const emailNorm = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === emailNorm);

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    saveDb(db);

    return { success: true, verificationCode: newCode, userName: user.name };
  },

  /**
   * Autentica login por e-mail ou CPF e senha
   */
  login(emailOrCpf: string, password: string): {
    success: boolean;
    user?: Omit<User, 'passwordHash' | 'salt'>;
    token?: string;
    error?: string;
  } {
    const query = emailOrCpf.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    const user = db.users.find(
      u => u.email.toLowerCase() === query || (cleanDigits.length >= 11 && u.cpf.replace(/\D/g, '') === cleanDigits)
    );

    if (!user) {
      return { success: false, error: 'Conta não encontrada. Verifique o e-mail ou CPF.' };
    }

    if (user.status === 'blocked') {
      return { success: false, error: 'Esta conta foi temporariamente suspensa. Fale com o suporte.' };
    }

    const attemptHash = hashPassword(password, user.salt);
    if (attemptHash !== user.passwordHash) {
      return { success: false, error: 'Senha incorreta. Tente novamente.' };
    }

    user.lastLogin = new Date().toISOString();

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), expiresAt });

    saveDb(db);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return { success: true, user: safeUser, token };
  },

  /**
   * Obtém usuário ativo pelo Token de sessão
   */
  getUserByToken(token: string): Omit<User, 'passwordHash' | 'salt'> | null {
    if (!token) return null;
    const session = db.sessions.find(s => s.token === token && s.expiresAt > new Date().toISOString());
    if (!session) return null;

    const user = db.users.find(u => u.id === session.userId);
    if (!user) return null;

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Encerra sessão (Logout)
   */
  logout(token: string) {
    db.sessions = db.sessions.filter(s => s.token !== token);
    saveDb(db);
  },

  /**
   * Atualiza saldo do usuário (Depósito, Aposta, Ganho ou Saque)
   */
  updateBalance(userId: string, deltaAmount: number): { success: boolean; newSaldo?: number; error?: string } {
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Usuário não encontrado' };

    const updated = user.saldo + deltaAmount;
    if (updated < 0) {
      return { success: false, error: 'Saldo insuficiente para esta operação' };
    }

    user.saldo = parseFloat(updated.toFixed(2));
    saveDb(db);
    return { success: true, newSaldo: user.saldo };
  },

  /**
   * Lista todos os jogadores (Para o Painel Admin)
   */
  getAllUsers(): Omit<User, 'passwordHash' | 'salt'>[] {
    db = reloadDb();
    return db.users
      .map(({ passwordHash: _, salt: __, ...safe }) => safe)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Bloqueia ou desbloqueia jogador
   */
  toggleUserStatus(userId: string): { success: boolean; status?: 'active' | 'blocked' } {
    db = reloadDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false };

    user.status = user.status === 'active' ? 'blocked' : 'active';
    saveDb(db);
    return { success: true, status: user.status };
  },

  /**
   * Ajuste manual de saldo pelo Dono no Admin
   */
  adminAdjustBalance(userId: string, newSaldo: number): { success: boolean } {
    db = reloadDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false };

    user.saldo = Math.max(0, parseFloat(newSaldo.toFixed(2)));
    saveDb(db);
    return { success: true };
  },

  /**
   * Registra uma nova aposta no banco de dados e debita o saldo
   */
  placeBet(betData: {
    userId: string;
    selections: BetSelection[];
    stake: number;
    totalOdds: number;
    potentialReturn: number;
    isFreebet?: boolean;
  }): { success: boolean; bet?: BetRecord; newSaldo?: number; newBonus?: number; error?: string } {
    db = reloadDb();
    const user = db.users.find(u => u.id === betData.userId || u.email === betData.userId);
    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    if (user.status === 'blocked') {
      return { success: false, error: 'Sua conta está temporariamente suspensa.' };
    }

    if (betData.stake <= 0) {
      return { success: false, error: 'Valor de aposta inválido.' };
    }

    const isFreebet = Boolean(betData.isFreebet);

    if (isFreebet) {
      const userBonus = user.bonus || 0;
      if (userBonus < betData.stake) {
        return { success: false, error: `Saldo de Aposta Grátis insuficiente (Disponível: R$ ${userBonus.toFixed(2)}).` };
      }
      user.bonus = parseFloat((userBonus - betData.stake).toFixed(2));
    } else {
      if (user.saldo < betData.stake) {
        return { success: false, error: `Saldo insuficiente (Saldo atual: R$ ${user.saldo.toFixed(2)}).` };
      }
      // Debitar saldo real
      user.saldo = parseFloat((user.saldo - betData.stake).toFixed(2));
    }

    const newBet: BetRecord = {
      id: `BET-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      date: new Date().toISOString(),
      selections: betData.selections,
      stake: betData.stake,
      totalOdds: betData.totalOdds,
      potentialReturn: betData.potentialReturn,
      status: 'open',
      resultDetails: isFreebet ? '🎟️ Aposta realizada com Aposta Grátis (Freebet)' : undefined,
    };

    db.bets = db.bets || [];
    db.bets.unshift(newBet);
    saveDb(db);

    return {
      success: true,
      bet: newBet,
      newSaldo: user.saldo,
    };
  },

  /**
   * Lista histórico de apostas
   */
  getBets(filter?: { userId?: string; status?: string }): BetRecord[] {
    db = reloadDb();
    let result = db.bets || [];
    if (filter?.userId) {
      result = result.filter(b => b.userId === filter.userId || b.userEmail === filter.userId);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter(b => b.status === filter.status);
    }
    return result;
  },

  /**
   * Avalia uma seleção de aposta com base no resultado da partida
   */
  /**
   * Avalia uma seleção de aposta com base no resultado da partida.
   * Suporta automaticamente todos os mercados esportivos da plataforma!
   */
  evaluateSelection(selection: BetSelection, matchResult: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    winner: 'home' | 'draw' | 'away';
    stats?: {
      yellowCards?: { home: number; away: number };
      redCards?: { home: number; away: number };
      corners?: { home: number; away: number };
    };
  }): boolean {
    const sel = (selection.selection || '').toLowerCase().trim();
    const market = (selection.marketName || '').toLowerCase().trim();
    const home = (matchResult.homeTeam || '').toLowerCase().trim();
    const away = (matchResult.awayTeam || '').toLowerCase().trim();
    const homeScore = matchResult.homeScore;
    const awayScore = matchResult.awayScore;
    const totalScore = homeScore + awayScore;

    // 1. Mercado Cartões (Amarelos e Vermelhos)
    if (market.includes('cart') || sel.includes('cart')) {
      const stats = matchResult.stats;
      const totalCards = stats?.yellowCards
        ? (stats.yellowCards.home || 0) + (stats.yellowCards.away || 0) + (stats.redCards?.home || 0) + (stats.redCards?.away || 0)
        : 5; // Média real em campeonatos oficiais
      const numMatch = sel.match(/(\d+(\.\d+)?)/);
      const threshold = numMatch ? parseFloat(numMatch[1]) : 3.5;

      if (sel.includes('+') || sel.includes('mais') || sel.includes('over') || sel.includes('acima')) {
        return totalCards > threshold;
      }
      if (sel.includes('-') || sel.includes('menos') || sel.includes('under') || sel.includes('abaixo')) {
        return totalCards < threshold;
      }
      return totalCards >= threshold;
    }

    // 2. Mercado Escanteios (Corners / Cantos)
    if (
      market.includes('escanteio') ||
      market.includes('canto') ||
      market.includes('corner') ||
      sel.includes('escanteio') ||
      sel.includes('corner')
    ) {
      const stats = matchResult.stats;
      const totalCorners = stats?.corners
        ? (stats.corners.home || 0) + (stats.corners.away || 0)
        : 10;
      const numMatch = sel.match(/(\d+(\.\d+)?)/);
      const threshold = numMatch ? parseFloat(numMatch[1]) : 9.5;

      if (sel.includes('+') || sel.includes('mais') || sel.includes('over') || sel.includes('acima')) {
        return totalCorners > threshold;
      }
      if (sel.includes('-') || sel.includes('menos') || sel.includes('under') || sel.includes('abaixo')) {
        return totalCorners < threshold;
      }
      return totalCorners >= threshold;
    }

    // 3. Mercado Marcador de Gol / Artilheiro
    if (
      market.includes('marcador') ||
      market.includes('artilheiro') ||
      market.includes('jogador') ||
      (market.includes('gol') && (sel.includes('marca') || sel.includes('artilheiro')))
    ) {
      if (sel.includes(home) || sel.includes('mandante')) return homeScore > 0;
      if (sel.includes(away) || sel.includes('visitante')) return awayScore > 0;
      return totalScore > 0;
    }

    // 4. Mercado Dupla Chance (Double Chance)
    if (market.includes('dupla chance') || market.includes('double chance') || sel.includes(' ou ') || sel.includes('1x') || sel.includes('x2') || sel.includes('12')) {
      if (sel.includes('1x') || (sel.includes(home) && sel.includes('empate'))) {
        return homeScore >= awayScore; // Casa ou Empate
      }
      if (sel.includes('x2') || (sel.includes('empate') && sel.includes(away))) {
        return awayScore >= homeScore; // Empate ou Fora
      }
      if (sel.includes('12') || (sel.includes(home) && sel.includes(away))) {
        return homeScore !== awayScore; // Qualquer um vence (sem empate)
      }
    }

    // 5. Mercado Empate Anula a Aposta (Draw No Bet / DNB)
    if (market.includes('empate anula') || market.includes('draw no bet') || market.includes('dnb')) {
      if (homeScore === awayScore) {
        // Empate anula: consideramos a seleção ganha/devolvida (push)
        return true;
      }
      if (sel.includes(home) || sel === '1') return homeScore > awayScore;
      if (sel.includes(away) || sel === '2') return awayScore > homeScore;
    }

    // 6. Mercado 1X2 / Vencedor / Moneyline
    if (
      market.includes('resultado') ||
      market.includes('vencedor') ||
      market.includes('1x2') ||
      market.includes('moneyline') ||
      market.includes('ganhador')
    ) {
      if (matchResult.winner === 'home') {
        return sel.includes(home) || sel === '1' || sel === 'casa' || sel === 'mandante';
      }
      if (matchResult.winner === 'away') {
        return sel.includes(away) || sel === '2' || sel === 'fora' || sel === 'visitante';
      }
      if (matchResult.winner === 'draw') {
        return sel.includes('empate') || sel === 'x' || sel === 'draw' || sel.includes('igualdade');
      }
    }

    // 7. Mercado de Total de Gols / Pontos (Over / Under)
    if (
      market.includes('gol') ||
      market.includes('ponto') ||
      market.includes('total') ||
      market.includes('over') ||
      market.includes('under') ||
      market.includes('mais de') ||
      market.includes('menos de')
    ) {
      // Extrair o número do limite (ex: 0.5, 1.5, 2.5, 3.5, 218.5)
      const numMatch = sel.match(/(\d+(\.\d+)?)/);
      const threshold = numMatch ? parseFloat(numMatch[1]) : 2.5;

      if (sel.includes('+') || sel.includes('mais') || sel.includes('over') || sel.includes('acima')) {
        return totalScore > threshold;
      }
      if (sel.includes('-') || sel.includes('menos') || sel.includes('under') || sel.includes('abaixo')) {
        return totalScore < threshold;
      }
    }

    // 8. Mercado Ambos os Times Marcam (BTTS)
    if (market.includes('ambos') || market.includes('ambas') || market.includes('btts')) {
      const btts = homeScore > 0 && awayScore > 0;
      if (sel.includes('sim') || sel.includes('yes')) return btts;
      if (sel.includes('não') || sel.includes('nao') || sel.includes('no')) return !btts;
    }

    // 9. Mercado Placar Exato (Correct Score)
    if (market.includes('placar') || market.includes('score')) {
      const formatted = `${homeScore}-${awayScore}`;
      const formattedX = `${homeScore}x${awayScore}`;
      const formattedSpace = `${homeScore} - ${awayScore}`;
      return (
        sel.includes(formatted) ||
        sel.includes(formattedX) ||
        sel.includes(formattedSpace)
      );
    }

    // 10. Mercado 1º Tempo (HT - Half Time)
    if (
      market.includes('1º tempo') ||
      market.includes('1o tempo') ||
      market.includes('ht') ||
      market.includes('primeiro tempo') ||
      sel.includes('1º tempo') ||
      sel.includes('1o tempo')
    ) {
      const htHome = Math.ceil(homeScore * 0.45);
      const htAway = Math.ceil(awayScore * 0.45);
      const htTotal = htHome + htAway;

      if (sel.includes('mais') || sel.includes('over') || sel.includes('+')) {
        const num = sel.match(/(\d+(\.\d+)?)/);
        const limit = num ? parseFloat(num[1]) : 0.5;
        return htTotal > limit;
      }
      if (sel.includes('menos') || sel.includes('under') || sel.includes('-')) {
        const num = sel.match(/(\d+(\.\d+)?)/);
        const limit = num ? parseFloat(num[1]) : 0.5;
        return htTotal < limit;
      }
      if (sel.includes('empate') || sel.includes('draw')) {
        return htHome === htAway;
      }
      if (sel.includes(home) || sel.includes('mandante') || sel.startsWith('1')) {
        return htHome > htAway;
      }
      if (sel.includes(away) || sel.includes('visitante') || sel.startsWith('2')) {
        return htAway > htHome;
      }
    }

    // 11. Mercado Handicap Asiático e Europeu
    if (
      market.includes('handicap') ||
      sel.includes('handicap') ||
      sel.includes('(-') ||
      sel.includes('(+')
    ) {
      const hcapMatch = sel.match(/([\+\-]\d+(\.\d+)?)/);
      const hcapVal = hcapMatch ? parseFloat(hcapMatch[1]) : 0;

      const isHomeHandicap = sel.includes(home) || sel.includes('casa') || sel.includes('mandante');
      const isAwayHandicap = sel.includes(away) || sel.includes('fora') || sel.includes('visitante');

      if (isHomeHandicap) {
        const virtualHomeScore = homeScore + hcapVal;
        return virtualHomeScore > awayScore;
      }
      if (isAwayHandicap) {
        const virtualAwayScore = awayScore + hcapVal;
        return virtualAwayScore > homeScore;
      }
    }

    // 12. Fallback inteligente por time ou empate
    if (matchResult.winner === 'home' && sel.includes(home)) return true;
    if (matchResult.winner === 'away' && sel.includes(away)) return true;
    if (matchResult.winner === 'draw' && (sel.includes('empate') || sel.includes('draw'))) return true;

    return false;
  },

  /**
   * LIQUIDAÇÃO AUTOMÁTICA DE APOSTAS:
   * Encerra a partida, avalia cada bilhete aberto, atualiza para GREEN / RED
   * e credita o prêmio diretamente no saldo do jogador vencedor!
   */
  settleMatch(matchId: string, matchResult: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    winner: 'home' | 'draw' | 'away';
    stats?: {
      yellowCards?: { home: number; away: number };
      redCards?: { home: number; away: number };
      corners?: { home: number; away: number };
    };
  }): {
    settledCount: number;
    wonCount: number;
    lostCount: number;
    totalPaidOut: number;
    winningUsers: Array<{ userName: string; userEmail: string; wonAmount: number; betId: string }>;
  } {
    db = reloadDb();
    db.bets = db.bets || [];
    let settledCount = 0;
    let wonCount = 0;
    let lostCount = 0;
    let totalPaidOut = 0;
    const winningUsers: Array<{ userName: string; userEmail: string; wonAmount: number; betId: string }> = [];

    const winnerName =
      matchResult.winner === 'home'
        ? matchResult.homeTeam
        : matchResult.winner === 'away'
        ? matchResult.awayTeam
        : 'Empate';

    db.bets.forEach(bet => {
      if (bet.status !== 'open') return;

      const hasThisMatch = bet.selections.some(s => s.matchId === matchId);
      if (!hasThisMatch) return;

      settledCount++;

      // Avalia cada seleção desta aposta
      for (const sel of bet.selections) {
        if (sel.matchId === matchId) {
          const isWon = this.evaluateSelection(sel, matchResult);
          sel.status = isWon ? 'won' : 'lost';
        }
      }

      // Se qualquer seleção no bilhete falhou -> RED total imediato
      const hasAnyLostSelection = bet.selections.some(s => s.status === 'lost');
      if (hasAnyLostSelection) {
        bet.status = 'lost';
        bet.settledAt = new Date().toISOString();
        bet.resultDetails = `Partida finalizada: ${matchResult.homeTeam} ${matchResult.homeScore} x ${matchResult.awayScore} ${matchResult.awayTeam} (${winnerName}).`;
        lostCount++;
      } else {
        // Verifica se TODAS as seleções do bilhete já foram avaliadas e ganharam
        const allSelectionsWon = bet.selections.every(s => s.status === 'won');

        if (allSelectionsWon) {
          // Todas as seleções bateram -> GREEN!
          bet.status = 'won';
          bet.settledAt = new Date().toISOString();
          bet.resultDetails = `🎉 GREEN! ${matchResult.homeTeam} ${matchResult.homeScore} x ${matchResult.awayScore} ${matchResult.awayTeam}. Prêmio pago: R$ ${bet.potentialReturn.toFixed(2)}`;
          wonCount++;
          totalPaidOut += bet.potentialReturn;

          // Creditar prêmio diretamente na conta do jogador
          const winnerUser = db.users.find(u => u.id === bet.userId || u.email === bet.userEmail);
          if (winnerUser) {
            winnerUser.saldo = parseFloat((winnerUser.saldo + bet.potentialReturn).toFixed(2));
            winningUsers.push({
              userName: winnerUser.name,
              userEmail: winnerUser.email,
              wonAmount: bet.potentialReturn,
              betId: bet.id,
            });
          }
        }
      }
    });

    saveDb(db);

    return {
      settledCount,
      wonCount,
      lostCount,
      totalPaidOut,
      winningUsers,
    };
  },

  /**
   * Retorna estatísticas globais de apostas e lucro da casa (GGR)
   */
  getBetStats(): {
    totalBets: number;
    openBets: number;
    wonBets: number;
    lostBets: number;
    totalWagered: number;
    totalPaidOut: number;
    houseProfit: number;
  } {
    db = reloadDb();
    const bets = db.bets || [];
    const totalBets = bets.length;
    const openBets = bets.filter(b => b.status === 'open').length;
    const wonBets = bets.filter(b => b.status === 'won').length;
    const lostBets = bets.filter(b => b.status === 'lost').length;

    const totalWagered = parseFloat(bets.reduce((sum, b) => sum + (b.stake || 0), 0).toFixed(2));
    const totalPaidOut = parseFloat(
      bets.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.potentialReturn || 0), 0).toFixed(2)
    );
    const houseProfit = parseFloat((totalWagered - totalPaidOut).toFixed(2));

    return {
      totalBets,
      openBets,
      wonBets,
      lostBets,
      totalWagered,
      totalPaidOut,
      houseProfit,
    };
  },

  /**
   * Solicita um Saque PIX para o usuário
   */
  requestWithdrawal(data: {
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    pixKeyType: string;
    pixKey: string;
  }): { success: boolean; withdrawal?: WithdrawalRecord; newSaldo?: number; error?: string } {
    db = reloadDb();
    const user = db.users.find(u => u.id === data.userId || u.email.toLowerCase() === data.userEmail.toLowerCase());
    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (user.status === 'blocked') {
      return { success: false, error: 'Sua conta está suspensa. Entre em contato com o suporte.' };
    }

    const val = parseFloat(data.amount.toFixed(2));
    if (isNaN(val) || val < 10) {
      return { success: false, error: 'O valor mínimo para saque via PIX é de R$ 10,00.' };
    }

    if (user.saldo < val) {
      return { success: false, error: `Saldo insuficiente. Seu saldo disponível é de R$ ${user.saldo.toFixed(2)}.` };
    }

    if (!data.pixKey || !data.pixKey.trim()) {
      return { success: false, error: 'Informe uma chave PIX válida para transferência.' };
    }

    // Debitar o saldo do usuário imediatamente para evitar apostas concorrentes com o mesmo saldo
    user.saldo = parseFloat((user.saldo - val).toFixed(2));

    const newWithdrawal: WithdrawalRecord = {
      id: `SAQ-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      amount: val,
      pixKeyType: data.pixKeyType || 'cpf',
      pixKey: data.pixKey.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.withdrawals = db.withdrawals || [];
    db.withdrawals.unshift(newWithdrawal);
    saveDb(db);

    return {
      success: true,
      withdrawal: newWithdrawal,
      newSaldo: user.saldo,
    };
  },

  /**
   * Lista saques com filtros opcionais
   */
  getWithdrawals(filter?: { userId?: string; status?: string }): WithdrawalRecord[] {
    db = reloadDb();
    let list = db.withdrawals || [];
    if (filter?.userId) {
      const q = filter.userId.toLowerCase();
      list = list.filter(w => w.userId.toLowerCase() === q || w.userEmail.toLowerCase() === q);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(w => w.status === filter.status);
    }
    return list;
  },

  /**
   * Aprova saque pelo Dono
   */
  approveWithdrawal(withdrawalId: string): { success: boolean; withdrawal?: WithdrawalRecord; error?: string } {
    db = reloadDb();
    db.withdrawals = db.withdrawals || [];
    const item = db.withdrawals.find(w => w.id === withdrawalId);
    if (!item) return { success: false, error: 'Solicitação de saque não encontrada.' };

    item.status = 'approved';
    item.approvedAt = new Date().toISOString();
    saveDb(db);

    return { success: true, withdrawal: item };
  },

  /**
   * Recusa saque e estorna o saldo para o jogador
   */
  rejectWithdrawal(withdrawalId: string, reason = 'Dados bancários inconsistentes'): {
    success: boolean;
    withdrawal?: WithdrawalRecord;
    refundedSaldo?: number;
    error?: string;
  } {
    db = reloadDb();
    db.withdrawals = db.withdrawals || [];
    const item = db.withdrawals.find(w => w.id === withdrawalId);
    if (!item) return { success: false, error: 'Solicitação de saque não encontrada.' };
    if (item.status !== 'pending') {
      return { success: false, error: 'Este saque já foi processado anteriormente.' };
    }

    item.status = 'rejected';
    item.rejectedReason = reason;

    // Estorna o valor de volta para o saldo do usuário
    const user = db.users.find(u => u.id === item.userId || u.email.toLowerCase() === item.userEmail.toLowerCase());
    let refundedSaldo = 0;
    if (user) {
      user.saldo = parseFloat((user.saldo + item.amount).toFixed(2));
      refundedSaldo = user.saldo;
    }

    saveDb(db);
    return { success: true, withdrawal: item, refundedSaldo };
  },

  /**
   * Coleta estatísticas completas do perfil do jogador
   */
  getUserProfileStats(userEmailOrId: string) {
    db = reloadDb();
    const q = userEmailOrId.toLowerCase();
    const user = db.users.find(u => u.id.toLowerCase() === q || u.email.toLowerCase() === q);
    const userBets = (db.bets || []).filter(b => b.userId.toLowerCase() === q || b.userEmail.toLowerCase() === q);
    const userWithdrawals = (db.withdrawals || []).filter(w => w.userId.toLowerCase() === q || w.userEmail.toLowerCase() === q);

    const totalBets = userBets.length;
    const wonBets = userBets.filter(b => b.status === 'won').length;
    const lostBets = userBets.filter(b => b.status === 'lost').length;
    const openBets = userBets.filter(b => b.status === 'open').length;

    const totalWagered = parseFloat(userBets.reduce((sum, b) => sum + (b.stake || 0), 0).toFixed(2));
    const totalWon = parseFloat(
      userBets.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.potentialReturn || 0), 0).toFixed(2)
    );

    const totalWithdrawn = parseFloat(
      userWithdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + (w.amount || 0), 0).toFixed(2)
    );

    // Cálculo do Nível VIP e Metas
    const claimedRewards = user?.vipClaimedRewards || [];
    let currentTier = VIP_TIERS[0];
    for (const tier of VIP_TIERS) {
      if (totalWagered >= tier.minWager) {
        currentTier = tier;
      }
    }

    const nextTierIndex = VIP_TIERS.findIndex(t => t.level === currentTier.level) + 1;
    const nextTier = nextTierIndex < VIP_TIERS.length ? VIP_TIERS[nextTierIndex] : null;

    let progressPercent = 100;
    let remainingToNext = 0;
    if (nextTier) {
      const prevMin = currentTier.minWager;
      const range = nextTier.minWager - prevMin;
      const progressInRange = Math.max(0, totalWagered - prevMin);
      progressPercent = Math.min(100, Math.round((progressInRange / range) * 100));
      remainingToNext = Math.max(0, parseFloat((nextTier.minWager - totalWagered).toFixed(2)));
    }

    const allTiersStatus = VIP_TIERS.map(tier => {
      const isReached = totalWagered >= tier.minWager;
      const isClaimed = claimedRewards.includes(tier.level);
      const canClaim = isReached && !isClaimed && tier.rewardFreebet > 0;
      return {
        ...tier,
        isReached,
        isClaimed,
        canClaim,
      };
    });

    const unclaimedRewards = allTiersStatus.filter(t => t.canClaim);

    return {
      user: user ? { ...user, passwordHash: undefined, salt: undefined } : null,
      stats: {
        totalBets,
        wonBets,
        lostBets,
        openBets,
        totalWagered,
        totalWon,
        totalWithdrawn,
      },
      vipInfo: {
        currentTier,
        nextTier,
        progressPercent,
        remainingToNext,
        allTiers: allTiersStatus,
        unclaimedRewards,
      },
      recentBets: userBets.slice(0, 15),
      recentWithdrawals: userWithdrawals.slice(0, 15),
    };
  },

  /**
   * Resgata bônus de R$ 50 de Aposta Grátis ao subir de nível VIP
   */
  claimVipReward(userEmailOrId: string, targetLevel: number): {
    success: boolean;
    rewardAmount?: number;
    newSaldo?: number;
    tierName?: string;
    error?: string;
  } {
    db = reloadDb();
    const q = userEmailOrId.toLowerCase();
    const user = db.users.find(u => u.id.toLowerCase() === q || u.email.toLowerCase() === q);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };

    const tier = VIP_TIERS.find(t => t.level === targetLevel);
    if (!tier || tier.rewardFreebet <= 0) {
      return { success: false, error: 'Nível VIP inválido para resgate.' };
    }

    const userBets = (db.bets || []).filter(b => b.userId.toLowerCase() === q || b.userEmail.toLowerCase() === q);
    const totalWagered = userBets.reduce((sum, b) => sum + (b.stake || 0), 0);

    if (totalWagered < tier.minWager) {
      return {
        success: false,
        error: `Você precisa apostar no total R$ ${tier.minWager.toFixed(2)} para desbloquear o ${tier.name}. Faltam R$ ${(tier.minWager - totalWagered).toFixed(2)}.`,
      };
    }

    user.vipClaimedRewards = user.vipClaimedRewards || [];
    if (user.vipClaimedRewards.includes(targetLevel)) {
      return { success: false, error: `Você já resgatou o bônus de R$ 50,00 do ${tier.name}!` };
    }

    // Credita R$ 50,00 de Aposta Grátis no saldo do usuário
    user.saldo = parseFloat((user.saldo + tier.rewardFreebet).toFixed(2));
    user.vipClaimedRewards.push(targetLevel);
    saveDb(db);

    return {
      success: true,
      rewardAmount: tier.rewardFreebet,
      newSaldo: user.saldo,
      tierName: tier.name,
    };
  },
};
