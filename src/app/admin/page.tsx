'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBet } from '@/context/BetContext';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import styles from './admin.module.css';

export default function AdminPage() {
  const { betHistory, saldo, deposit, user } = useBet();
  const [apiKey, setApiKey] = useState('214db3becf7831f0ede7e7bbf4fb0ddb');
  const [apiStatus, setApiStatus] = useState<string>('Verificando status...');
  const [quotaRemaining, setQuotaRemaining] = useState<string>('500 requisições');
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(MOCK_MATCHES[0].id);
  const [notification, setNotification] = useState<string | null>(null);

  // Estados da Central de Depósitos PIX
  interface PixDepositItem {
    id: string;
    amount: number;
    userName: string;
    userEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    approvedBy?: 'owner' | 'mercadopago';
  }

  const [pendingDeposits, setPendingDeposits] = useState<PixDepositItem[]>([]);
  const [recentApproved, setRecentApproved] = useState<PixDepositItem[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Estados da Central de Saques dos Clientes
  interface AdminWithdrawalItem {
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
  }
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);

  // Gestão de Jogadores Cadastrados
  interface DbUserItem {
    id: string;
    name: string;
    email: string;
    cpf: string;
    saldo: number;
    bonus: number;
    status: 'active' | 'blocked';
    role: 'user' | 'admin';
    createdAt: string;
  }
  const [dbUsers, setDbUsers] = useState<DbUserItem[]>([]);
  const [totalBanca, setTotalBanca] = useState<number>(0);

  // Gestão de Apostas & Liquidação (Green/Red)
  interface AdminBetItem {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    date: string;
    selections: Array<{
      id: string;
      matchId: string;
      matchTitle: string;
      sport: string;
      marketName: string;
      selection: string;
      odd: number;
    }>;
    stake: number;
    totalOdds: number;
    potentialReturn: number;
    status: 'open' | 'won' | 'lost' | 'cashed_out';
    settledAt?: string;
    resultDetails?: string;
  }

  interface BetStats {
    totalBets: number;
    openBets: number;
    wonBets: number;
    lostBets: number;
    totalWagered: number;
    totalPaidOut: number;
    houseProfit: number;
  }

  const [adminBets, setAdminBets] = useState<AdminBetItem[]>([]);
  const [betStats, setBetStats] = useState<BetStats>({
    totalBets: 0,
    openBets: 0,
    wonBets: 0,
    lostBets: 0,
    totalWagered: 0,
    totalPaidOut: 0,
    houseProfit: 0,
  });
  const [betFilter, setBetFilter] = useState<'all' | 'open' | 'won' | 'lost'>('all');
  const [isSettling, setIsSettling] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setDbUsers(data.users);
        setTotalBanca(data.totalSaldo);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  };

  const fetchBets = async () => {
    try {
      const res = await fetch('/api/bets');
      const data = await res.json();
      if (data.success) {
        setAdminBets(data.bets);
        setBetStats(data.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar apostas:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', userId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Usuário ${data.status === 'blocked' ? 'BLOQUEADO' : 'DESBLOQUEADO'} com sucesso.`);
        setTimeout(() => setNotification(null), 4000);
        fetchUsers();
      }
    } catch {
      alert('Erro ao alterar status do usuário');
    }
  };

  const handleAdjustBalance = async (userId: string, currentSaldo: number) => {
    const promptVal = prompt(`Novo saldo para o jogador (Atual: R$ ${currentSaldo.toFixed(2)}):`, currentSaldo.toString());
    if (promptVal === null) return;
    const num = parseFloat(promptVal);
    if (isNaN(num) || num < 0) {
      alert('Valor inválido!');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adjust_balance', userId, newSaldo: num }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Saldo atualizado para R$ ${num.toFixed(2)} com sucesso.`);
        setTimeout(() => setNotification(null), 4000);
        fetchUsers();
      }
    } catch {
      alert('Erro ao ajustar saldo');
    }
  };

  // Tocar som de notificação (Ding de caixa registradora suave)
  const playCashSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // AudioContext não disponível
    }
  };

  // Carregar depósitos do servidor
  const fetchDeposits = async () => {
    try {
      const res = await fetch('/api/pix/admin');
      const data = await res.json();
      if (data.success) {
        setPendingDeposits(prev => {
          if (data.pending.length > prev.length) {
            playCashSound();
          }
          return data.pending;
        });
        const approved = (data.all as PixDepositItem[])
          .filter(d => d.status === 'approved')
          .slice(0, 5);
        setRecentApproved(approved);
      }
    } catch (err) {
      console.error('Erro ao buscar depósitos:', err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error('Erro ao buscar saques:', err);
    }
  };

  useEffect(() => {
    fetchDeposits();
    fetchUsers();
    fetchBets();
    fetchWithdrawals();
    const interval = setInterval(() => {
      fetchDeposits();
      fetchUsers();
      fetchBets();
      fetchWithdrawals();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Aprovar com 1 clique
  const handleApproveDeposit = async (id: string, amount: number, clientName: string) => {
    setApprovingId(id);
    try {
      const res = await fetch('/api/pix/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id }),
      });
      const data = await res.json();
      if (data.success) {
        deposit(amount, 'PIX Aprovado pelo Dono');
        setNotification(`✅ DEPÓSITO APROVADO! R$ ${amount.toFixed(2)} liberado para ${clientName}. Saldo creditado.`);
        setTimeout(() => setNotification(null), 6000);
        playCashSound();
        fetchDeposits();
      }
    } catch {
      alert('Erro ao aprovar depósito');
    } finally {
      setApprovingId(null);
    }
  };

  // Rejeitar depósito
  const handleRejectDeposit = async (id: string) => {
    if (!confirm('Deseja realmente recusar este depósito?')) return;
    try {
      await fetch('/api/pix/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id }),
      });
      fetchDeposits();
    } catch {
      alert('Erro ao recusar');
    }
  };

  // Aprovar Saque
  const handleApproveWithdrawal = async (wId: string, amount: number, clientName: string) => {
    if (!confirm(`Confirmar que você já enviou o PIX de R$ ${amount.toFixed(2)} para ${clientName}?`)) return;
    setProcessingWithdrawalId(wId);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', withdrawalId: wId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`✅ SAQUE CONCLUÍDO! PIX de R$ ${amount.toFixed(2)} registrado como pago para ${clientName}.`);
        setTimeout(() => setNotification(null), 5000);
        fetchWithdrawals();
      }
    } catch {
      alert('Erro ao aprovar saque.');
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  // Recusar Saque e estornar saldo
  const handleRejectWithdrawal = async (wId: string, amount: number, clientName: string) => {
    const reason = prompt('Motivo da recusa (o saldo será devolvido ao jogador):', 'Chave PIX incorreta');
    if (reason === null) return;
    setProcessingWithdrawalId(wId);
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', withdrawalId: wId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`⚠️ Saque recusado. Saldo de R$ ${amount.toFixed(2)} devolvido para ${clientName}.`);
        setTimeout(() => setNotification(null), 5000);
        fetchWithdrawals();
        fetchUsers();
      }
    } catch {
      alert('Erro ao recusar saque.');
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  // Testar conexão da chave da API
  const testApiConnection = async () => {
    setApiStatus('Conectando ao The Odds API...');
    try {
      const res = await fetch(`/api/matches?apiKey=${apiKey.trim()}`);
      const data = await res.json();
      if (data.source === 'the_odds_api') {
        setApiStatus('🟢 Conectado ao The Odds API (Dados Reais Ativos)');
        setQuotaRemaining(`Cota restante: ${data.quotaRemaining}`);
      } else {
        setApiStatus('🟡 Chave aguardando 32 caracteres completos. Motor Autônomo ativo como backup!');
      }
    } catch {
      setApiStatus('🟡 Motor Autônomo da BetCerta Ativo');
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  // Simulação de Gol no Jogo Ao Vivo
  const handleScoreGoal = (team: 'home' | 'away') => {
    setMatches(prev =>
      prev.map(m => {
        if (m.id === selectedMatchId) {
          const newHome = team === 'home' ? (m.homeScore || 0) + 1 : m.homeScore;
          const newAway = team === 'away' ? (m.awayScore || 0) + 1 : m.awayScore;
          const scoringTeam = team === 'home' ? m.homeTeam : m.awayTeam;
          setNotification(`⚽ GOL DO ${scoringTeam.toUpperCase()}! Novo Placar: ${newHome} x ${newAway}`);
          setTimeout(() => setNotification(null), 5000);
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

  // Liquidação de Green / Red (Apito Final Real)
  const handleSettleMatch = async (outcome: 'home_win' | 'draw' | 'away_win' | 'current_score') => {
    const currentMatch = matches.find(m => m.id === selectedMatchId);
    if (!currentMatch) return;

    setIsSettling(true);
    let homeScore = currentMatch.homeScore || 0;
    let awayScore = currentMatch.awayScore || 0;
    let winner: 'home' | 'draw' | 'away' = 'draw';

    if (outcome === 'home_win') {
      winner = 'home';
      if (homeScore <= awayScore) homeScore = awayScore + 1;
    } else if (outcome === 'away_win') {
      winner = 'away';
      if (awayScore <= homeScore) awayScore = homeScore + 1;
    } else if (outcome === 'draw') {
      winner = 'draw';
      homeScore = Math.max(homeScore, awayScore);
      awayScore = homeScore;
    } else {
      winner = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';
    }

    // Atualiza o placar do jogo na interface
    setMatches(prev =>
      prev.map(m => (m.id === selectedMatchId ? { ...m, homeScore, awayScore, isLive: false } : m))
    );

    try {
      const res = await fetch('/api/bets/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: currentMatch.id,
          homeTeam: currentMatch.homeTeam,
          awayTeam: currentMatch.awayTeam,
          homeScore,
          awayScore,
          winner,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const winnerName =
          winner === 'home'
            ? currentMatch.homeTeam
            : winner === 'away'
            ? currentMatch.awayTeam
            : 'Empate';

        setNotification(
          `🏁 APITO FINAL! Placar: ${currentMatch.homeTeam} ${homeScore} x ${awayScore} ${currentMatch.awayTeam} (${winnerName}). ${data.report.wonCount} Green(s) (R$ ${data.report.totalPaidOut.toFixed(2)} pagos) e ${data.report.lostCount} Red(s). Saldos atualizados!`
        );
        setTimeout(() => setNotification(null), 8000);
        playCashSound();
        fetchBets();
        fetchUsers();
      } else {
        alert(data.error || 'Erro ao liquidar partida');
      }
    } catch {
      alert('Erro de conexão ao liquidar partida');
    } finally {
      setIsSettling(false);
    }
  };

  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const openBets = betHistory.filter(b => b.status === 'open');

  // Proteção: apenas o Dono/Admin pode acessar este painel
  if (!user.isLogged || user.role !== 'admin') {
    return (
      <div className={styles.container} style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.card} style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🔒</span>
          <h1 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Acesso Restrito ao Dono</h1>
          <p className={styles.sub} style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Este painel é de acesso exclusivo para a administração da <strong>BetCerta</strong>. Faça login com a conta de Dono/Admin para gerenciar depósitos, jogos e usuários.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/login" className="btn-gold" style={{ padding: '0.8rem', textAlign: 'center' }}>
              🔑 Fazer Login como Dono (Admin)
            </Link>
            <Link href="/" className="btn-outline" style={{ padding: '0.6rem', textAlign: 'center' }}>
              ← Voltar para o Site Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Topo do Painel */}
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>PAINEL DO DONO DA CASA</span>
          <h1 className={styles.title}>Gestão Autônoma BetCerta</h1>
          <p className={styles.sub}>
            Controle a integração com The Odds API, partidas ao vivo e liquidação de Green/Red.
          </p>
        </div>
        <Link href="/" className="btn-outline">
          ← Voltar para a Loja
        </Link>
      </div>

      {notification && <div className={styles.notificationBanner}>{notification}</div>}

      {/* STATUS DO ROBÔ AUTÔNOMO 24/7 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '2px solid #10b981',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}>
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <strong style={{ fontSize: '1.1rem', color: '#fff' }}>Robô de Liquidação Autônoma BetCerta</strong>
              <span style={{
                background: '#10b981',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.72rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}>
                PILOTO AUTOMÁTICO 24/7 ATIVO
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Todas as apostas esportivas, mercados de odds e bilhetes de jogadores são apurados e pagos <strong>automaticamente</strong> pela BetCerta. Você não precisa fazer nada manualmente!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            Avaliando odds e pagando Greens em tempo real
          </span>
        </div>
      </div>

      {/* CENTRAL DE DEPÓSITOS PIX (APROVAÇÃO EM 1 CLIQUE) */}
      <div className={styles.card} style={{ border: pendingDeposits.length > 0 ? '1px solid rgba(245, 158, 11, 0.6)' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>💰</span>
            <div>
              <h2 className={styles.cardTitle}>Central de Depósitos PIX (Mercado Pago Oficial)</h2>
              <p className={styles.cardDesc} style={{ margin: 0 }}>
                Depósitos dos clientes chegam aqui em tempo real. Você aprova com 1 clique sem precisar de comprovante!
              </p>
            </div>
          </div>
          <div className={styles.pixHeaderBadge}>
            ⚡ {pendingDeposits.length} {pendingDeposits.length === 1 ? 'Depósito Pendente' : 'Depósitos Pendentes'}
          </div>
        </div>

        {/* Lista de Depósitos Aguardando Aprovação */}
        {pendingDeposits.length === 0 ? (
          <div style={{ background: '#080c16', border: '1px dashed var(--border)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            🟢 <strong>Nenhum depósito aguardando aprovação no momento.</strong>
            <p style={{ fontSize: '0.82rem', marginTop: '0.4rem', color: '#94a3b8' }}>
              Quando um cliente gerar e pagar o PIX na loja, o sino apitará aqui e o botão verde aparecerá para você aprovar em 1 clique.
            </p>
          </div>
        ) : (
          <div className={styles.pixCardGrid}>
            {pendingDeposits.map(d => (
              <div key={d.id} className={styles.pixDepositCard}>
                <div className={styles.pixDepositInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className={styles.pixDepositAmount}>R$ {d.amount.toFixed(2)}</span>
                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                      AGUARDANDO APROVAÇÃO
                    </span>
                  </div>
                  <div className={styles.pixDepositMeta}>
                    <strong>Jogador:</strong> {d.userName} ({d.userEmail}) • <strong>ID Mercado Pago:</strong> #{d.id}
                  </div>
                  <div className={styles.pixDepositMeta} style={{ color: '#64748b' }}>
                    Solicitado em: {new Date(d.createdAt).toLocaleTimeString('pt-BR')} • Sem necessidade de comprovante
                  </div>
                </div>

                <div className={styles.pixDepositActions}>
                  <button
                    className={styles.btnApprovePix}
                    onClick={() => handleApproveDeposit(d.id, d.amount, d.userName)}
                    disabled={approvingId === d.id}
                  >
                    {approvingId === d.id ? 'Aprovando...' : '✅ APROVAR COM 1 CLIQUE'}
                  </button>
                  <button
                    className={styles.btnRejectPix}
                    onClick={() => handleRejectDeposit(d.id)}
                  >
                    ❌ Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Histórico Recente de Aprovados */}
        {recentApproved.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>Últimos Aprovados:</span>
            {recentApproved.map(a => (
              <span key={a.id} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                R$ {a.amount.toFixed(2)} ({a.userName}) ✓
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CENTRAL DE SAQUES DOS CLIENTES (CASH-OUT PIX) */}
      {(() => {
        const pendingW = withdrawals.filter(w => w.status === 'pending');
        const totalPending = pendingW.reduce((sum, w) => sum + w.amount, 0);

        return (
          <div className={styles.card} style={{ border: pendingW.length > 0 ? '1px solid rgba(245, 158, 11, 0.8)' : undefined, marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>💸</span>
                <div>
                  <h2 className={styles.cardTitle}>Central de Saques dos Clientes (Cash-Out PIX)</h2>
                  <p className={styles.cardDesc} style={{ margin: 0 }}>
                    Quando um apostador ganha e solicita retirada, o pedido aparece aqui. Você envia o PIX com sua conta empresarial e aprova!
                  </p>
                </div>
              </div>
              <div style={{ background: pendingW.length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.1)', color: pendingW.length > 0 ? '#f59e0b' : '#10b981', border: '1px solid currentColor', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem' }}>
                {pendingW.length} {pendingW.length === 1 ? 'Saque Pendente' : 'Saques Pendentes'} (Total: R$ {totalPending.toFixed(2)})
              </div>
            </div>

            {/* Aviso de Privacidade do Dono */}
            <div style={{ background: 'rgba(0, 115, 245, 0.1)', border: '1px solid rgba(0, 115, 245, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', margin: '1rem 0', fontSize: '0.85rem', color: '#93c5fd', lineHeight: 1.5 }}>
              🔒 <strong>Privacidade Total do Dono:</strong> Ao transferir o PIX pela conta Woovi / OpenPix da BetCerta (CNPJ 69.654.316/0001-01), o apostador receberá o dinheiro enviado por <strong>&quot;WOOVI IP LTDA / BETCERTA&quot;</strong>. Seu nome de pessoa física e CPF jamais aparecem no extrato bancário dele!
            </div>

            {pendingW.length === 0 ? (
              <div style={{ background: '#080c16', border: '1px dashed var(--border)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                🟢 <strong>Nenhuma solicitação de saque pendente no momento.</strong> Todo o dinheiro está retido com segurança na banca.
              </div>
            ) : (
              <div className={styles.pixCardGrid}>
                {pendingW.map(w => (
                  <div key={w.id} className={styles.pixDepositCard} style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                    <div className={styles.pixDepositInfo}>
                      <span className={styles.pixDepositId}>{w.id} • {new Date(w.createdAt).toLocaleTimeString('pt-BR')}</span>
                      <strong className={styles.pixDepositName}>{w.userName}</strong>
                      <span className={styles.pixDepositEmail} style={{ color: '#94a3b8' }}>{w.userEmail}</span>
                      <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem' }}>
                        🔑 Chave PIX: <strong>{w.pixKey}</strong> ({w.pixKeyType.toUpperCase()})
                      </div>
                    </div>

                    <div className={styles.pixDepositAction}>
                      <div className={styles.pixDepositAmount} style={{ color: '#f87171' }}>
                        - R$ {w.amount.toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveWithdrawal(w.id, w.amount, w.userName)}
                          disabled={processingWithdrawalId === w.id}
                          className="btn-1win-green"
                          style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem' }}
                        >
                          ✓ Confirmar PIX Pago
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id, w.amount, w.userName)}
                          disabled={processingWithdrawalId === w.id}
                          className="btn-outline"
                          style={{ padding: '0.5rem 0.7rem', fontSize: '0.82rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                          ✕ Recusar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Grid Principal */}
      <div className={styles.grid}>
        {/* COLUNA ESQUERDA: Chave The Odds API e Motor Híbrido */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📡</span>
            <h2 className={styles.cardTitle}>Conexão The Odds API & Motor Autônomo</h2>
          </div>

          <p className={styles.cardDesc}>
            Os dois sistemas trabalham juntos: a API consome a cota gratuita oficial e o Robô Autônomo
            mantém a plataforma viva quando a cota acabar.
          </p>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Chave The Odds API (32 caracteres):</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className={styles.textInput}
                placeholder="Ex: 214db3becf7831f0ede7e7bbf4fb0..."
              />
              <button onClick={testApiConnection} className="btn-gold" style={{ padding: '0.6rem 1rem' }}>
                Conectar
              </button>
            </div>
            <span className={styles.charCount}>Tamanho atual: {apiKey.length} caracteres (Necessário: 32)</span>
          </div>

          <div className={styles.statusBox}>
            <div className={styles.statusRow}>
              <span>Status Atual:</span>
              <strong>{apiStatus}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>Modo Híbrido:</span>
              <strong style={{ color: 'var(--green-win)' }}>Ativo (Sem interrupções)</strong>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Controle de Jogos Ao Vivo e Liquidação de Green/Red */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>⚽</span>
            <h2 className={styles.cardTitle}>Simulador e Apito Final (Green / Red)</h2>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Selecione o Jogo para Comandar:</label>
            <select
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              className={styles.selectInput}
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam} ({m.league}) - {m.isLive ? 'AO VIVO' : 'Agendado'}
                </option>
              ))}
            </select>
          </div>

          {/* Placar em Tempo Real */}
          <div className={styles.liveControlBox}>
            <div className={styles.teamControl}>
              <TeamBadge teamName={currentMatch.homeTeam} size={36} />
              <span className={styles.ctrlTeamName}>{currentMatch.homeTeam}</span>
              <button onClick={() => handleScoreGoal('home')} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                +1 Gol
              </button>
            </div>

            <div className={styles.scoreDisplay}>
              <span className={styles.scoreNum}>{currentMatch.homeScore || 0}</span>
              <span>:</span>
              <span className={styles.scoreNum}>{currentMatch.awayScore || 0}</span>
              <span className={styles.liveMinute}>{currentMatch.liveTime || '90\''}</span>
            </div>

            <div className={styles.teamControl}>
              <TeamBadge teamName={currentMatch.awayTeam} size={36} />
              <span className={styles.ctrlTeamName}>{currentMatch.awayTeam}</span>
              <button onClick={() => handleScoreGoal('away')} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                +1 Gol
              </button>
            </div>
          </div>

          {/* Botões de Liquidação de Fim de Jogo */}
          <div className={styles.settleSection}>
            <span className={styles.label}>Apitar Fim de Partida & Liquidar Apostas (Green/Red):</span>
            <div className={styles.settleBtns} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <button
                onClick={() => handleSettleMatch('home_win')}
                disabled={isSettling}
                className="btn-gold"
                style={{ padding: '0.65rem 0.4rem', fontSize: '0.85rem' }}
              >
                🟢 GREEN ({currentMatch.homeTeam.split(' ')[0]})
              </button>
              <button
                onClick={() => handleSettleMatch('draw')}
                disabled={isSettling}
                className="btn-outline"
                style={{ padding: '0.65rem 0.4rem', fontSize: '0.85rem' }}
              >
                🟡 GREEN (Empate)
              </button>
              <button
                onClick={() => handleSettleMatch('away_win')}
                disabled={isSettling}
                className="btn-gold"
                style={{ padding: '0.65rem 0.4rem', fontSize: '0.85rem' }}
              >
                🔵 GREEN ({currentMatch.awayTeam.split(' ')[0]})
              </button>
              <button
                onClick={() => handleSettleMatch('current_score')}
                disabled={isSettling}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '0.65rem 0.4rem',
                }}
              >
                ⚡ Placar Atual ({currentMatch.homeScore || 0} x {currentMatch.awayScore || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE GESTÃO DE APOSTAS & LIQUIDAÇÃO (GREEN/RED) */}
      <div className={styles.card} style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>🎟️ Central de Apostas & Liquidação Financeira</h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Monitore os bilhetes de todos os jogadores, resultados de Green/Red e a lucratividade da casa (GGR).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setBetFilter('all')}
              style={{
                background: betFilter === 'all' ? 'var(--gold)' : '#080c16',
                color: betFilter === 'all' ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Todas ({betStats.totalBets})
            </button>
            <button
              onClick={() => setBetFilter('open')}
              style={{
                background: betFilter === 'open' ? 'rgba(245, 158, 11, 0.25)' : '#080c16',
                color: betFilter === 'open' ? 'var(--gold)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ⏳ Em Aberto ({betStats.openBets})
            </button>
            <button
              onClick={() => setBetFilter('won')}
              style={{
                background: betFilter === 'won' ? 'rgba(16, 185, 129, 0.25)' : '#080c16',
                color: betFilter === 'won' ? '#34d399' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🟢 GREEN ({betStats.wonBets})
            </button>
            <button
              onClick={() => setBetFilter('lost')}
              style={{
                background: betFilter === 'lost' ? 'rgba(239, 68, 68, 0.25)' : '#080c16',
                color: betFilter === 'lost' ? '#f87171' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔴 RED ({betStats.lostBets})
            </button>
          </div>
        </div>

        {/* CARDS DE RESUMO FINANCEIRO (KPIs DA BANCA) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#080c16', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📊 Volume Total Apostado</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'Rajdhani, sans-serif', marginTop: '0.2rem' }}>
              R$ {betStats.totalWagered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: '#080c16', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#34d399' }}>🏆 Prêmios Pagos (Green)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', fontFamily: 'Rajdhani, sans-serif', marginTop: '0.2rem' }}>
              R$ {betStats.totalPaidOut.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: '#080c16', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>💰 Lucro da Casa (GGR BetCerta)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: betStats.houseProfit >= 0 ? 'var(--gold)' : '#f87171', fontFamily: 'Rajdhani, sans-serif', marginTop: '0.2rem' }}>
              R$ {betStats.houseProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: '#080c16', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#60a5fa' }}>🎟️ Total de Bilhetes</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa', fontFamily: 'Rajdhani, sans-serif', marginTop: '0.2rem' }}>
              {betStats.totalBets} apostas
            </div>
          </div>
        </div>

        {/* LISTA DE BILHETES FILTRADOS */}
        {(() => {
          const filtered = adminBets.filter(b => (betFilter === 'all' ? true : b.status === betFilter));
          if (filtered.length === 0) {
            return (
              <div style={{ background: '#080c16', border: '1px dashed var(--border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Nenhum bilhete encontrado nesta categoria.
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(b => (
                <div
                  key={b.id}
                  style={{
                    background: '#080c16',
                    border: `1px solid ${
                      b.status === 'won'
                        ? 'rgba(16, 185, 129, 0.4)'
                        : b.status === 'lost'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'var(--border)'
                    }`,
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{b.id}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Jogador: <strong style={{ color: '#cbd5e1' }}>{b.userName}</strong> ({b.userEmail})
                      </span>
                    </div>

                    <div>
                      {b.status === 'won' && (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 900 }}>
                          🟢 GREEN (+ R$ {b.potentialReturn.toFixed(2)})
                        </span>
                      )}
                      {b.status === 'lost' && (
                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 900 }}>
                          🔴 RED (- R$ {b.stake.toFixed(2)})
                        </span>
                      )}
                      {b.status === 'open' && (
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--gold)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 900 }}>
                          ⏳ EM ABERTO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seleções do Bilhete */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {b.selections.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0f1d', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: '#94a3b8' }}>{s.matchTitle}</span> • <span style={{ color: '#cbd5e1' }}>{s.marketName}:</span> <strong style={{ color: 'var(--gold)' }}>{s.selection}</strong>
                        </div>
                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>@{s.odd.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Resumo Financeiro da Aposta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Apostado: <strong style={{ color: '#fff' }}>R$ {b.stake.toFixed(2)}</strong> • Cotação Total: <strong style={{ color: 'var(--gold)' }}>{b.totalOdds.toFixed(2)}</strong> • Retorno Possível: <strong style={{ color: '#34d399' }}>R$ {b.potentialReturn.toFixed(2)}</strong>
                    </div>

                    {b.resultDetails && (
                      <div style={{ fontSize: '0.78rem', color: b.status === 'won' ? '#34d399' : '#94a3b8', fontStyle: 'italic' }}>
                        {b.resultDetails}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* GESTÃO DE JOGADORES CADASTRADOS (BANCO LOCAL) */}
      <div className={styles.card} style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>👥 Jogadores Cadastrados ({dbUsers.length})</h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Controle de contas reais salvas no banco de dados local. Você pode bloquear usuários ou alterar saldos.
            </p>
          </div>
          <div className={styles.pixHeaderBadge}>
            💰 Saldo Total nas Contas: R$ {totalBanca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {dbUsers.map(u => (
            <div
              key={u.id}
              style={{
                background: '#080c16',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{u.name}</strong>
                  <span
                    style={{
                      background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: u.role === 'admin' ? 'var(--gold)' : '#60a5fa',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    {u.role === 'admin' ? 'DONO / ADMIN' : 'JOGADOR'}
                  </span>
                  <span
                    style={{
                      background: u.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: u.status === 'active' ? '#34d399' : '#f87171',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    {u.status === 'active' ? '🟢 ATIVO' : '🔴 BLOQUEADO'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  E-mail: <strong>{u.email}</strong> • CPF: <strong>{u.cpf}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Cadastrado em: {new Date(u.createdAt).toLocaleDateString('pt-BR')} às {new Date(u.createdAt).toLocaleTimeString('pt-BR')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saldo em Conta</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--green-win)', fontFamily: 'Rajdhani, sans-serif' }}>
                    R$ {u.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-outline"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => handleAdjustBalance(u.id, u.saldo)}
                  >
                    ✏️ Ajustar Saldo
                  </button>

                  {u.role !== 'admin' && (
                    <button
                      style={{
                        background: u.status === 'active' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        border: `1px solid ${u.status === 'active' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                        color: u.status === 'active' ? '#f87171' : '#34d399',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                    >
                      {u.status === 'active' ? '🚫 Bloquear' : '✅ Desbloquear'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
