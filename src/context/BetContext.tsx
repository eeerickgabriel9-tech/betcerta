'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';

export interface BetSelection {
  id: string; // e.g. match1-home
  matchId: string;
  matchTitle: string;
  sport: string;
  marketName: string;
  selection: string; // "Flamengo", "Empate", "+2.5 Gols", etc.
  odd: number;
  isBetBuilder?: boolean;
  builderSelections?: Array<{ marketName: string; selection: string; odd: number }>;
}

export interface PlacedBet {
  id: string;
  date: string;
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: 'open' | 'won' | 'lost' | 'cashed_out';
  cashOutValue?: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet_placed' | 'bet_won' | 'casino_win' | 'casino_bet';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

interface BetContextType {
  user: { name: string; email: string; cpf: string; role: 'user' | 'admin'; isLogged: boolean };
  saldo: number;
  bonus: number;
  betslip: BetSelection[];
  betHistory: PlacedBet[];
  transactions: Transaction[];
  matches: Match[];
  isSlipOpen: boolean;
  liveAlert: string | null;
  toggleSlip: () => void;
  addSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
  placeBet: (stake: number, isFreebet?: boolean) => { success: boolean; message: string };
  cashOutBet: (betId: string) => void;
  deposit: (amount: number, method?: string) => void;
  withdraw: (amount: number, pixKey: string, pixKeyType?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  recordCasinoBet: (gameName: string, stake: number, winAmount: number) => void;
  updateMatchScore: (matchId: string, team: 'home' | 'away') => void;
  settleMatch: (matchId: string, winner: 'home' | 'draw' | 'away') => void;
  dismissAlert: () => void;
  login: (email: string, name?: string, role?: 'user' | 'admin', cpf?: string, initialSaldo?: number, initialBonus?: number) => void;
  logout: () => void;
}

const BetContext = createContext<BetContextType | undefined>(undefined);

export function BetProvider({ children }: { children: React.ReactNode }) {
  const [saldo, setSaldo] = useState<number>(0.00);
  const [bonus, setBonus] = useState<number>(0.00);
  const [betslip, setBetslip] = useState<BetSelection[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>(() =>
    MOCK_MATCHES.filter(
      m => !m.isLive && (!m.date || (!m.date.toLowerCase().includes('encerrado') && !m.date.toLowerCase().includes('ao vivo')))
    )
  );
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  const [user, setUser] = useState<{
    name: string;
    email: string;
    cpf: string;
    role: 'user' | 'admin';
    isLogged: boolean;
  }>({
    name: 'Visitante',
    email: '',
    cpf: '',
    role: 'user',
    isLogged: false,
  });

  const [betHistory, setBetHistory] = useState<PlacedBet[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-1092',
      type: 'deposit',
      description: 'Depósito PIX Instantâneo',
      amount: 1250.00,
      date: 'Hoje, 09:00',
      status: 'completed',
    },
  ]);

  // Carregar sessão e dados ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('betcerta_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        } catch {
          // ignore error
        }
      }

      const savedSaldo = localStorage.getItem('betcerta_saldo') || localStorage.getItem('gaiabet_saldo');
      if (savedSaldo) setSaldo(parseFloat(savedSaldo));

      const savedHistory = localStorage.getItem('betcerta_history') || localStorage.getItem('gaiabet_history');
      if (savedHistory) {
        try {
          setBetHistory(JSON.parse(savedHistory));
        } catch {
          // ignore
        }
      }

      const savedTxs = localStorage.getItem('betcerta_txs') || localStorage.getItem('gaiabet_txs');
      if (savedTxs) setTransactions(JSON.parse(savedTxs));

      // Sincronizar sessão ativa do servidor via cookies
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser({
              name: data.user.name,
              email: data.user.email,
              cpf: data.user.cpf,
              role: data.user.role,
              isLogged: true,
            });
            setSaldo(data.user.saldo);
            if (data.user.bonus !== undefined) {
              setBonus(data.user.bonus);
              localStorage.setItem('betcerta_bonus', data.user.bonus.toString());
            }
            localStorage.setItem('betcerta_user', JSON.stringify({
              name: data.user.name,
              email: data.user.email,
              cpf: data.user.cpf,
              role: data.user.role,
              isLogged: true,
            }));
            localStorage.setItem('betcerta_saldo', data.user.saldo.toString());
          }
        })
        .catch(() => {});
    }
  }, []);

  // Sincroniza histórico de apostas da conta ativa diretamente com o banco central BetCerta
  useEffect(() => {
    const targetEmail = user.isLogged && user.email ? user.email : 'eeerickgabriel9@gmail.com';
    fetch(`/api/bets?userId=${encodeURIComponent(targetEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bets)) {
          const formatted = data.bets.map((b: any) => ({
            id: b.id,
            date: new Date(b.date).toLocaleString('pt-BR'),
            selections: b.selections || [],
            stake: b.stake,
            totalOdds: b.totalOdds,
            potentialReturn: b.potentialReturn,
            status: b.status,
            cashOutValue: b.status === 'open' ? parseFloat((b.stake * 0.95).toFixed(2)) : undefined,
          }));

          // Unifica com apostas locais sem duplicidade
          setBetHistory(prev => {
            const map = new Map<string, PlacedBet>();
            formatted.forEach((b: PlacedBet) => map.set(b.id, b));
            prev.forEach(b => {
              if (!map.has(b.id)) map.set(b.id, b);
            });
            const merged = Array.from(map.values());
            if (typeof window !== 'undefined') {
              localStorage.setItem('betcerta_history', JSON.stringify(merged));
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [user.isLogged, user.email]);

  const updateSaldo = (newVal: number) => {
    setSaldo(newVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('betcerta_saldo', newVal.toString());
    }
  };

  const toggleSlip = () => setIsSlipOpen(prev => !prev);
  const dismissAlert = () => setLiveAlert(null);

  const addSelection = (sel: BetSelection) => {
    setBetslip(prev => {
      if (prev.some(item => item.id === sel.id)) {
        return prev.filter(item => item.id !== sel.id);
      }
      const filtered = prev.filter(
        item => !(item.matchId === sel.matchId && item.marketName === sel.marketName)
      );
      return [...filtered, sel];
    });
    setIsSlipOpen(true);
  };

  const removeSelection = (id: string) => {
    setBetslip(prev => prev.filter(item => item.id !== id));
  };

  const clearSlip = () => {
    setBetslip([]);
  };

  const placeBet = (stake: number, isFreebet = false): { success: boolean; message: string } => {
    if (betslip.length === 0) {
      return { success: false, message: 'Seu bilhete de apostas está vazio.' };
    }
    if (stake <= 0) {
      return { success: false, message: 'Insira um valor válido para apostar.' };
    }

    if (isFreebet) {
      if (bonus < stake) {
        return { success: false, message: `Saldo de Aposta Grátis insuficiente (Disponível: R$ ${bonus.toFixed(2)}).` };
      }
      const newBonus = parseFloat((bonus - stake).toFixed(2));
      setBonus(newBonus);
      if (typeof window !== 'undefined') {
        localStorage.setItem('betcerta_bonus', newBonus.toString());
      }
    } else {
      if (stake > saldo) {
        return { success: false, message: 'Saldo insuficiente. Faça um depósito via PIX.' };
      }
      const newSaldo = saldo - stake;
      updateSaldo(newSaldo);
    }

    const totalOdds = parseFloat(
      betslip.reduce((acc, curr) => acc * curr.odd, 1).toFixed(2)
    );
    const potentialReturn = parseFloat((stake * totalOdds).toFixed(2));

    const newBet: PlacedBet = {
      id: `BET-${Math.floor(10000 + Math.random() * 90000)}`,
      date: 'Agora',
      selections: [...betslip],
      stake,
      totalOdds,
      potentialReturn,
      status: 'open',
      cashOutValue: isFreebet ? undefined : parseFloat((stake * 0.95).toFixed(2)),
    };

    const updatedHistory = [newBet, ...betHistory];
    setBetHistory(updatedHistory);

    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'bet_placed',
      description: isFreebet
        ? `🎟️ Aposta Grátis (${betslip.length} seleções)`
        : `Aposta ${betslip.length > 1 ? 'Múltipla' : 'Simples'} (${betslip.length} seleções)`,
      amount: isFreebet ? 0 : -stake,
      date: 'Agora',
      status: 'completed',
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);

    if (typeof window !== 'undefined') {
      localStorage.setItem('betcerta_history', JSON.stringify(updatedHistory));
      localStorage.setItem('betcerta_txs', JSON.stringify(updatedTxs));
    }

    // Se logado, sincroniza com o banco central BetCerta
    if (user.isLogged) {
      fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          selections: newBet.selections,
          stake: newBet.stake,
          totalOdds: newBet.totalOdds,
          potentialReturn: newBet.potentialReturn,
          isFreebet,
        }),
      }).catch(err => console.error('Erro ao salvar aposta no banco central:', err));
    }

    clearSlip();
    return {
      success: true,
      message: isFreebet
        ? '🎉 Aposta Grátis confirmada com sucesso! Boa sorte!'
        : 'Aposta confirmada com sucesso! Boa sorte!',
    };
  };

  const cashOutBet = (betId: string) => {
    const bet = betHistory.find(b => b.id === betId);
    if (!bet || bet.status !== 'open' || !bet.cashOutValue) return;

    const value = bet.cashOutValue;
    const newSaldo = saldo + value;
    updateSaldo(newSaldo);

    const updatedHistory = betHistory.map(b =>
      b.id === betId ? { ...b, status: 'cashed_out' as const } : b
    );
    setBetHistory(updatedHistory);

    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'bet_won',
      description: `Cash Out da aposta ${betId}`,
      amount: value,
      date: 'Agora',
      status: 'completed',
    };
    setTransactions([newTx, ...transactions]);

    setLiveAlert(`💰 Cash Out efetuado com sucesso! + R$ ${value.toFixed(2)} creditados.`);
    setTimeout(() => setLiveAlert(null), 5000);
  };

  // Alterar placar manualmente ou por robô
  const updateMatchScore = (matchId: string, team: 'home' | 'away') => {
    setMatches(prev =>
      prev.map(m => {
        if (m.id === matchId) {
          const newHome = team === 'home' ? (m.homeScore || 0) + 1 : (m.homeScore || 0);
          const newAway = team === 'away' ? (m.awayScore || 0) + 1 : (m.awayScore || 0);
          const scorer = team === 'home' ? m.homeTeam : m.awayTeam;

          setLiveAlert(`⚽ GOL! ${scorer.toUpperCase()} marcou! Placar: ${newHome} x ${newAway}`);
          setTimeout(() => setLiveAlert(null), 6000);

          return {
            ...m,
            homeScore: newHome,
            awayScore: newAway,
          };
        }
        return m;
      })
    );
  };

  // LIQUIDAÇÃO DE GREEN / RED AUTOMÁTICA
  const settleMatch = (matchId: string, winner: 'home' | 'draw' | 'away') => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const winnerName =
      winner === 'home' ? match.homeTeam : winner === 'away' ? match.awayTeam : 'Empate';

    // Sincroniza liquidação com o banco de dados central
    fetch('/api/bets/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore || (winner === 'home' ? 1 : 0),
        awayScore: match.awayScore || (winner === 'away' ? 1 : 0),
        winner,
      }),
    }).catch(err => console.error('Erro ao liquidar no backend:', err));

    let totalWon = 0;
    let greenCount = 0;
    let redCount = 0;

    const updatedHistory = betHistory.map(bet => {
      if (bet.status !== 'open') return bet;

      const matchingSelection = bet.selections.find(s => s.matchId === matchId);
      if (!matchingSelection) return bet;

      // Verificar se a seleção bateu
      let isWinner = false;
      if (winner === 'home' && matchingSelection.selection.includes(match.homeTeam)) {
        isWinner = true;
      } else if (winner === 'away' && matchingSelection.selection.includes(match.awayTeam)) {
        isWinner = true;
      } else if (winner === 'draw' && matchingSelection.selection.toLowerCase().includes('empate')) {
        isWinner = true;
      }

      if (isWinner) {
        totalWon += bet.potentialReturn;
        greenCount++;
        return { ...bet, status: 'won' as const };
      } else {
        redCount++;
        return { ...bet, status: 'lost' as const };
      }
    });

    if (totalWon > 0) {
      const newSaldo = saldo + totalWon;
      updateSaldo(newSaldo);

      const newTx: Transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'bet_won',
        description: `Prêmio GREEN no jogo ${match.homeTeam} vs ${match.awayTeam}!`,
        amount: totalWon,
        date: 'Agora',
        status: 'completed',
      };
      setTransactions([newTx, ...transactions]);

      setLiveAlert(
        `🎉🟢 DEU GREEN! Partida ${match.homeTeam} vs ${match.awayTeam} finalizada. Você faturou + R$ ${totalWon.toFixed(2)}!`
      );
    } else if (redCount > 0) {
      setLiveAlert(
        `🔴 Partida ${match.homeTeam} vs ${match.awayTeam} encerrada com vitória de ${winnerName}. Não bateu desta vez.`
      );
    } else {
      setLiveAlert(`🏁 Partida ${match.homeTeam} vs ${match.awayTeam} encerrada (${winnerName}).`);
    }

    setBetHistory(updatedHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('betcerta_history', JSON.stringify(updatedHistory));
    }
  };

  // SINCRONIZAÇÃO DO CALENDÁRIO OFICIAL PREMATCH (100% REAL E OFICIAL):
  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.matches) && data.matches.length > 0) {
          setMatches(data.matches);
        }
      })
      .catch(() => {});
  }, []);

  // ROBÔ DE LIQUIDAÇÃO 100% AUTÔNOMO BETCERTA:
  // Executa no servidor e credita os saldos dos vencedores sem intervenção manual
  useEffect(() => {
    const autoCron = setInterval(async () => {
      try {
        const res = await fetch('/api/cron/settle', { method: 'POST' });
        const data = await res.json();
        if (data.success && data.report?.totalGreens > 0) {
          const meRes = await fetch('/api/auth/me');
          const meData = await meRes.json();
          if (meData.success && meData.user) {
            setSaldo(meData.user.saldo);
            setLiveAlert(`🎉🟢 DEU GREEN! Partida liquidada automaticamente e prêmio creditado na sua conta!`);
            setTimeout(() => setLiveAlert(null), 8000);
          }
        }
      } catch {
        // Silencioso em caso de oscilação de rede
      }
    }, 20000);

    return () => clearInterval(autoCron);
  }, []);

  const deposit = (amount: number, method = 'PIX Instantâneo') => {
    if (amount <= 0) return;
    const newSaldo = saldo + amount;
    updateSaldo(newSaldo);

    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'deposit',
      description: `Depósito via ${method}`,
      amount: amount,
      date: 'Agora',
      status: 'completed',
    };
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);

    if (typeof window !== 'undefined') {
      localStorage.setItem('betcerta_txs', JSON.stringify(updatedTxs));
    }
  };

  const withdraw = async (
    amount: number,
    pixKey: string,
    pixKeyType = 'cpf'
  ): Promise<{ success: boolean; message: string }> => {
    if (amount <= 0) {
      return { success: false, message: 'Digite um valor válido para saque.' };
    }
    if (amount > saldo) {
      return { success: false, message: 'Saldo insuficiente para saque.' };
    }
    if (!pixKey.trim()) {
      return { success: false, message: 'Informe sua chave PIX para transferência.' };
    }

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email || 'usr_anon',
          userEmail: user.email,
          userName: user.name,
          amount,
          pixKeyType,
          pixKey,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.error || 'Erro ao processar saque.' };
      }

      const newSaldo = data.newSaldo !== undefined ? data.newSaldo : saldo - amount;
      updateSaldo(newSaldo);

      const newTx: Transaction = {
        id: data.withdrawal?.id || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'withdraw',
        description: `Saque PIX para chave (${pixKey})`,
        amount: -amount,
        date: 'Agora',
        status: 'pending',
      };
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);

      if (typeof window !== 'undefined') {
        localStorage.setItem('betcerta_txs', JSON.stringify(updatedTxs));
      }

      return {
        success: true,
        message: `Solicitação de saque de R$ ${amount.toFixed(2)} criada com sucesso! O PIX será creditado após aprovação de segurança.`,
      };
    } catch {
      // Fallback se estiver offline
      const newSaldo = saldo - amount;
      updateSaldo(newSaldo);
      return {
        success: true,
        message: `Saque de R$ ${amount.toFixed(2)} solicitado com sucesso!`,
      };
    }
  };

  const recordCasinoBet = (gameName: string, stake: number, winAmount: number) => {
    const net = winAmount - stake;
    const newSaldo = saldo + net;
    updateSaldo(newSaldo);

    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: winAmount > 0 ? 'casino_win' : 'casino_bet',
      description: winAmount > 0 ? `Vitória no ${gameName}!` : `Rodada no ${gameName}`,
      amount: net,
      date: 'Agora',
      status: 'completed',
    };
    setTransactions([newTx, ...transactions]);
  };

  const login = (
    email: string,
    name = 'Apostador VIP',
    role: 'user' | 'admin' = 'user',
    cpf = '***.456.789-**',
    initialSaldo?: number
  ) => {
    const isUserAdmin = role === 'admin' || email.toLowerCase() === 'admin@betcerta.com';
    const loggedUser = {
      name,
      email,
      cpf,
      role: isUserAdmin ? ('admin' as const) : ('user' as const),
      isLogged: true,
    };
    setUser(loggedUser);
    if (initialSaldo !== undefined) {
      updateSaldo(initialSaldo);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('betcerta_user', JSON.stringify(loggedUser));
    }
  };

  const logout = () => {
    const guestUser = {
      name: 'Visitante',
      email: '',
      cpf: '',
      role: 'user' as const,
      isLogged: false,
    };
    setUser(guestUser);
    setSaldo(0);
    setBetHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('betcerta_user');
      localStorage.removeItem('betcerta_token');
      localStorage.removeItem('betcerta_history');
      document.cookie = 'betcerta_token=; Max-Age=0; path=/;';
    }
  };

  return (
    <BetContext.Provider
      value={{
        user,
        saldo,
        bonus,
        betslip,
        betHistory,
        transactions,
        matches,
        isSlipOpen,
        liveAlert,
        toggleSlip,
        addSelection,
        removeSelection,
        clearSlip,
        placeBet,
        cashOutBet,
        deposit,
        withdraw,
        recordCasinoBet,
        updateMatchScore,
        settleMatch,
        dismissAlert,
        login,
        logout,
      }}
    >
      {children}
    </BetContext.Provider>
  );
}

export function useBet() {
  const context = useContext(BetContext);
  if (!context) {
    throw new Error('useBet deve ser usado dentro de um BetProvider');
  }
  return context;
}
