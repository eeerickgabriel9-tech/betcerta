'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useBet } from '@/context/BetContext';
import styles from './perfil.module.css';

interface UserProfileData {
  user: {
    name: string;
    email: string;
    cpf: string;
    saldo: number;
    bonus: number;
    role: string;
    status: string;
    createdAt?: string;
  };
  stats: {
    totalBets: number;
    wonBets: number;
    lostBets: number;
    openBets: number;
    totalWagered: number;
    totalWon: number;
    totalWithdrawn: number;
  };
  recentBets: Array<{
    id: string;
    date: string;
    stake: number;
    totalOdds: number;
    potentialReturn: number;
    status: 'open' | 'won' | 'lost' | 'cashed_out';
    selections?: Array<{
      matchTitle: string;
      selection: string;
      odd: number;
    }>;
    resultDetails?: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    amount: number;
    pixKey: string;
    pixKeyType: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    approvedAt?: string;
    rejectedReason?: string;
  }>;
  userDeposits: Array<{
    id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>;
  pendingDeposit: {
    id: string;
    amount: number;
    qrCode: string;
    qrCodeBase64: string;
    createdAt: string;
  } | null;
  vipInfo?: {
    currentTier: {
      level: number;
      name: string;
      badge: string;
      icon: string;
      minWager: number;
    };
    nextTier: {
      level: number;
      name: string;
      badge: string;
      icon: string;
      minWager: number;
      rewardFreebet: number;
    } | null;
    progressPercent: number;
    remainingToNext: number;
    allTiers: Array<{
      level: number;
      name: string;
      badge: string;
      icon: string;
      minWager: number;
      rewardFreebet: number;
      perks: string[];
      isReached: boolean;
      isClaimed: boolean;
      canClaim: boolean;
    }>;
    unclaimedRewards: Array<{
      level: number;
      name: string;
      rewardFreebet: number;
    }>;
  };
}

export default function PerfilPage() {
  const { user, saldo, withdraw, deposit, logout } = useBet();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dados' | 'apostas' | 'financeiro' | 'saque' | 'responsavel'>('dados');

  // Estado do PIX Copia e Cola no Alerta Pendente
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVerifyingPix, setIsVerifyingPix] = useState(false);
  const [pixStatusMsg, setPixStatusMsg] = useState<string | null>(null);

  // Estado do Formulário de Saque
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [pixKey, setPixKey] = useState(user.cpf || '');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Estado do Clube VIP
  const [claimingVipLevel, setClaimingVipLevel] = useState<number | null>(null);

  // Carrega os dados detalhados do perfil
  const fetchProfile = useCallback(async () => {
    try {
      let email = user.email;
      if (!email && typeof window !== 'undefined') {
        const saved = localStorage.getItem('betcerta_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.email) email = parsed.email;
          } catch {}
        }
      }

      if (!email) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Copia o código Copia e Cola do PIX pendente
  const handleCopyPendingPix = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Verifica manualmente se o pagamento pendente caiu no banco
  const handleCheckPendingDeposit = async (depositId: string, amount: number) => {
    setIsVerifyingPix(true);
    setPixStatusMsg('Consultando banco oficial...');
    try {
      const res = await fetch(`/api/pix/status?id=${depositId}`);
      const data = await res.json();

      if (data.success && data.deposit?.status === 'approved') {
        deposit(amount, 'PIX Instantâneo Oficial');
        setPixStatusMsg('🎉 Pagamento CONFIRMADO! Saldo liberado na sua conta.');
        setTimeout(() => {
          fetchProfile();
        }, 1200);
      } else {
        setPixStatusMsg('⏳ Pagamento ainda não detectado no banco. Se já pagou, aguarde 30 a 60 segundos.');
      }
    } catch {
      setPixStatusMsg('Erro ao conectar ao banco. Tente novamente em instantes.');
    } finally {
      setIsVerifyingPix(false);
    }
  };

  // Cancela o PIX pendente
  const handleCancelPendingDeposit = () => {
    if (profileData) {
      setProfileData({ ...profileData, pendingDeposit: null });
    }
  };

  // Resgata bônus de R$ 50 de aposta grátis ao atingir meta VIP
  const handleClaimVipReward = async (targetLevel: number) => {
    setClaimingVipLevel(targetLevel);
    try {
      const res = await fetch('/api/user/vip/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email || 'carlos@teste.com',
          level: targetLevel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        deposit(data.rewardAmount, `Aposta Grátis Nível ${targetLevel}`);
        alert(data.message);
        fetchProfile();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Erro ao resgatar recompensa VIP');
    } finally {
      setClaimingVipLevel(null);
    }
  };

  // Solicita Saque
  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawFeedback(null);
    const amountVal = parseFloat(withdrawAmount);

    if (isNaN(amountVal) || amountVal < 10) {
      setWithdrawFeedback({ type: 'error', msg: 'O valor mínimo para saque via PIX é R$ 10,00.' });
      return;
    }

    if (amountVal > saldo) {
      setWithdrawFeedback({ type: 'error', msg: `Saldo insuficiente (Disponível: R$ ${saldo.toFixed(2)}).` });
      return;
    }

    if (!pixKey.trim()) {
      setWithdrawFeedback({ type: 'error', msg: 'Informe sua chave PIX de destino.' });
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const result = await withdraw(amountVal, pixKey, pixKeyType);
      if (result.success) {
        setWithdrawFeedback({ type: 'success', msg: result.message });
        setWithdrawAmount('50');
        fetchProfile();
      } else {
        setWithdrawFeedback({ type: 'error', msg: result.message });
      }
    } catch {
      setWithdrawFeedback({ type: 'error', msg: 'Erro ao solicitar saque. Tente novamente.' });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (!user.isLogged && !loading && !profileData) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Você precisa estar logado para acessar seu Perfil</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0 2rem' }}>
          Acesse sua conta para ver suas informações, histórico de apostas, saques e depósitos.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn-gold">Entrar na Conta</Link>
          <Link href="/cadastro" className="btn-outline">Criar Conta Nova</Link>
        </div>
      </div>
    );
  }

  const stats = profileData?.stats || {
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    openBets: 0,
    totalWagered: 0,
    totalWon: 0,
    totalWithdrawn: 0,
  };

  const pendingDeposit = profileData?.pendingDeposit;

  return (
    <div className={styles.container}>
      {/* Header do Perfil */}
      <div className={styles.profileHeader}>
        <div className={styles.headerTop}>
          <div className={styles.userIdentity}>
            <div className={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>
                {user.name || 'Apostador VIP'}
                <span className={styles.verifiedBadge}>
                  ✓ Conta Verificada 🟢
                </span>
                {user.role === 'admin' && (
                  <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    👑 DONO
                  </span>
                )}
              </div>
              <span className={styles.userEmail}>{user.email || 'cliente@betcerta.com'}</span>
              <span className={styles.userCpf}>CPF: {user.cpf || '***.456.789-**'} • Membro BetCerta</span>
            </div>
          </div>

          <div className={styles.balanceBox}>
            <span className={styles.balanceLabel}>Saldo em Conta</span>
            <div className={styles.balanceValue}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={styles.headerActions}>
              <Link href="/carteira" className="btn-1win-green" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}>
                + Depositar PIX
              </Link>
              <button
                onClick={() => setActiveTab('saque')}
                className="btn-gold"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
              >
                💸 Pedir Saque
              </button>
              <button
                onClick={logout}
                className="btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                title="Desconectar"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Depósito PIX Pendente */}
      {pendingDeposit && (
        <div className={styles.pendingDepositCard}>
          <div className={styles.pendingHeader}>
            <div className={styles.pendingTitle}>
              <span>⚡ Depósito PIX Gerado e Aguardando Pagamento</span>
            </div>
            <span className={styles.pendingBadge}>⏳ PENDENTE</span>
          </div>

          <div className={styles.pendingBody}>
            {pendingDeposit.qrCodeBase64 ? (
              <div className={styles.pendingQrBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pendingDeposit.qrCodeBase64}`}
                  alt="QR Code PIX Pendente"
                  className={styles.pendingQrImg}
                />
              </div>
            ) : (
              <div className={styles.pendingQrBox}>
                <span style={{ fontSize: '2.5rem' }}>📱</span>
              </div>
            )}

            <div className={styles.pendingInfo}>
              <div className={styles.pendingAmount}>
                R$ {pendingDeposit.amount.toFixed(2)}
              </div>
              <p className={styles.pendingSub}>
                Abra o aplicativo do seu banco, escolha <strong>Pagar com PIX</strong> e escaneie o QR Code acima ou copie a chave Copia e Cola abaixo.
              </p>

              <div className={styles.copyInputGroup}>
                <input
                  type="text"
                  readOnly
                  value={pendingDeposit.qrCode}
                  className={styles.copyInput}
                />
                <button
                  type="button"
                  onClick={() => handleCopyPendingPix(pendingDeposit.qrCode)}
                  className="btn-gold"
                  style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}
                >
                  {copiedCode ? '✓ Copiado!' : 'Copiar Chave PIX'}
                </button>
              </div>

              {pixStatusMsg && (
                <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {pixStatusMsg}
                </div>
              )}

              <div className={styles.pendingActions}>
                <button
                  onClick={() => handleCheckPendingDeposit(pendingDeposit.id, pendingDeposit.amount)}
                  disabled={isVerifyingPix}
                  className="btn-1win-green"
                  style={{ fontSize: '0.85rem' }}
                >
                  {isVerifyingPix ? 'Verificando...' : '🔄 Já Paguei (Verificar Saldo)'}
                </button>
                <button
                  onClick={handleCancelPendingDeposit}
                  className="btn-outline"
                  style={{ fontSize: '0.85rem', color: '#94a3b8' }}
                >
                  ✕ Dispensar Cobrança
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLUBE VIP BETCERTA: METAS & APOSTAS GRÁTIS */}
      {(() => {
        const vip = profileData?.vipInfo;
        const currentTier = vip?.currentTier || { level: 1, name: 'Básico', badge: '🥉 Bronze', icon: '🥉', minWager: 0 };
        const nextTier = vip?.nextTier;
        const progressPercent = vip?.progressPercent ?? 0;
        const remaining = vip?.remainingToNext ?? 0;
        const totalWagered = stats.totalWagered;

        return (
          <div className={styles.vipCard}>
            <div className={styles.vipHeader}>
              <div className={styles.vipTitleRow}>
                <span style={{ fontSize: '1.8rem' }}>👑</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                    Clube VIP BetCerta
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    Suba de nível apostando na casa e ganhe <strong>Apostas Grátis de até R$ 500,00</strong> a cada meta alcançada!
                  </p>
                </div>
              </div>

              <div className={styles.vipLevelBadge}>
                {currentTier.icon} {currentTier.name} (Nível {currentTier.level})
              </div>
            </div>

            {/* Barra de Progresso até o Próximo Nível */}
            {nextTier ? (
              <div>
                <div className={styles.vipNextTierRow}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    Próximo nível: <strong style={{ color: '#f59e0b' }}>{nextTier.name}</strong>
                  </span>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>
                    🎁 Recompensa: +R$ {nextTier.rewardFreebet.toFixed(2)} de Aposta Grátis
                  </span>
                </div>

                <div className={styles.progressBarContainer}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className={styles.vipSubText}>
                  <span>Total Apostado: <strong>R$ {totalWagered.toFixed(2)}</strong></span>
                  <span>Faltam: <strong>R$ {remaining.toFixed(2)}</strong> para o {nextTier.name} ({progressPercent}%)</span>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.25rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                🌟 Parabéns! Você atingiu o nível máximo: VIP Diamante (Lenda BetCerta)!
              </div>
            )}

            {/* Grid dos 5 Níveis VIP */}
            <div className={styles.vipTiersGrid}>
              {vip?.allTiers.map(tier => (
                <div
                  key={tier.level}
                  className={`${styles.vipTierBox} ${tier.level === currentTier.level ? styles.vipTierActive : ''} ${tier.isReached ? styles.vipTierCompleted : ''}`}
                >
                  <div className={styles.tierTop}>
                    <span style={{ fontSize: '1.4rem' }}>{tier.icon}</span>
                    <span className={styles.tierTarget}>
                      {tier.minWager === 0 ? 'Ponto de Partida' : `Meta: R$ ${tier.minWager}`}
                    </span>
                  </div>

                  <div className={styles.tierName}>{tier.name}</div>

                  {tier.rewardFreebet > 0 && (
                    <div className={styles.tierReward}>
                      +R$ {tier.rewardFreebet.toFixed(2)} Grátis
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {tier.canClaim ? (
                      <button
                        onClick={() => handleClaimVipReward(tier.level)}
                        disabled={claimingVipLevel === tier.level}
                        className="btn-gold"
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', fontWeight: 800 }}
                      >
                        {claimingVipLevel === tier.level ? 'Resgatando...' : `🎁 Resgatar R$ ${tier.rewardFreebet}`}
                      </button>
                    ) : tier.isClaimed ? (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ✓ R$ {tier.rewardFreebet} Resgatado
                      </span>
                    ) : tier.isReached ? (
                      <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                        ✓ Nível Concluído
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        🔒 Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Cards de Resumo & Estatísticas Rápidas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#0073f5' }}>📊</div>
          <div className={styles.statData}>
            <span className={styles.statValue}>{stats.totalBets}</span>
            <span className={styles.statTitle}>Total de Apostas</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#10b981' }}>🟢</div>
          <div className={styles.statData}>
            <span className={styles.statValue}>{stats.wonBets}</span>
            <span className={styles.statTitle}>Apostas Ganhas (Green)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#f59e0b' }}>💰</div>
          <div className={styles.statData}>
            <span className={styles.statValue}>R$ {stats.totalWon.toFixed(2)}</span>
            <span className={styles.statTitle}>Prêmios Pagos (Green)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#10b981' }}>💸</div>
          <div className={styles.statData}>
            <span className={styles.statValue}>R$ {stats.totalWithdrawn.toFixed(2)}</span>
            <span className={styles.statTitle}>Total Sacado via PIX</span>
          </div>
        </div>
      </div>

      {/* Barra de Abas */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'dados' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('dados')}
        >
          👤 Informações Pessoais
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'apostas' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('apostas')}
        >
          🎟️ Minhas Apostas ({stats.totalBets})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'financeiro' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('financeiro')}
        >
          💳 Depósitos & Saques
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'saque' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('saque')}
        >
          💸 Solicitar Saque PIX
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'responsavel' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('responsavel')}
        >
          🛡️ Jogo Responsável
        </button>
      </div>

      {/* Conteúdo da Aba */}
      <div className={styles.tabContent}>
        {/* 1. ABA DADOS PESSOAIS */}
        {activeTab === 'dados' && (
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: '#fff' }}>
              Dados Cadastrais do Titular
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Nome Completo</div>
                <div className={styles.infoItemValue}>{user.name || 'Apostador VIP'}</div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>E-mail Cadastrado</div>
                <div className={styles.infoItemValue}>{user.email || 'cliente@betcerta.com'}</div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>CPF do Titular</div>
                <div className={styles.infoItemValue}>{user.cpf || '***.456.789-**'}</div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Status da Conta</div>
                <div className={styles.infoItemValue} style={{ color: '#10b981' }}>
                  Ativa & Verificada 🟢
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Nível de Usuário</div>
                <div className={styles.infoItemValue} style={{ color: '#f59e0b' }}>
                  {user.role === 'admin' ? 'Administrador / Dono' : 'Apostador Ouro VIP ⭐'}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Instituição de Liquidação PIX</div>
                <div className={styles.infoItemValue}>
                  BetCerta Oficial (CNPJ 69.654.316/0001-01)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ABA MINHAS APOSTAS */}
        {activeTab === 'apostas' && (
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: '#fff' }}>
              Histórico de Bilhetes & Palpites
            </h3>
            {profileData?.recentBets && profileData.recentBets.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.betTable}>
                  <thead>
                    <tr>
                      <th>Bilhete</th>
                      <th>Data / Horário</th>
                      <th>Seleção / Confronto</th>
                      <th>Cotação (Odd)</th>
                      <th>Valor Apostado</th>
                      <th>Retorno Potencial</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.recentBets.map(bet => {
                      const sel = bet.selections?.[0];
                      return (
                        <tr key={bet.id}>
                          <td><strong>{bet.id}</strong></td>
                          <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {new Date(bet.date).toLocaleString('pt-BR')}
                          </td>
                          <td>
                            {sel ? (
                              <div>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{sel.selection}</span>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sel.matchTitle}</div>
                              </div>
                            ) : (
                              'Aposta Combinada'
                            )}
                          </td>
                          <td><strong>{bet.totalOdds?.toFixed(2) || '1.85'}</strong></td>
                          <td>R$ {bet.stake?.toFixed(2)}</td>
                          <td style={{ color: '#10b981', fontWeight: 700 }}>
                            R$ {bet.potentialReturn?.toFixed(2)}
                          </td>
                          <td>
                            {bet.status === 'won' && <span className={styles.badgeGreen}>🟢 GREEN</span>}
                            {bet.status === 'lost' && <span className={styles.badgeRed}>🔴 RED</span>}
                            {bet.status === 'open' && <span className={styles.badgeOpen}>⏳ EM ABERTO</span>}
                            {bet.status === 'cashed_out' && <span className={styles.badgeOpen}>⚡ CASHOUT</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <p>Nenhuma aposta registrada ainda.</p>
                <Link href="/esportes" className="btn-gold" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  Apostar Agora nos Jogos de Hoje
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 3. ABA DEPÓSITOS & SAQUES */}
        {activeTab === 'financeiro' && (
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: '#fff' }}>
              Histórico de Depósitos e Saques
            </h3>

            {/* Sub-seção de Saques */}
            <h4 style={{ color: '#f59e0b', margin: '1.5rem 0 0.75rem' }}>💸 Solicitações de Saque PIX</h4>
            {profileData?.recentWithdrawals && profileData.recentWithdrawals.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.betTable}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Chave PIX Informada</th>
                      <th>Status da Transferência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.recentWithdrawals.map(w => (
                      <tr key={w.id}>
                        <td><strong>{w.id}</strong></td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {new Date(w.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td style={{ color: '#f87171', fontWeight: 800 }}>- R$ {w.amount.toFixed(2)}</td>
                        <td>{w.pixKey} ({w.pixKeyType.toUpperCase()})</td>
                        <td>
                          {w.status === 'approved' && (
                            <span className={styles.badgeGreen}>✅ PIX PAGO NO SEU BANCO</span>
                          )}
                          {w.status === 'pending' && (
                            <span className={styles.badgeOpen}>⏳ EM PROCESSAMENTO (ATÉ 30 MIN)</span>
                          )}
                          {w.status === 'rejected' && (
                            <span className={styles.badgeRed}>✕ RECUSADO (SALDO ESTORNADO)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nenhum saque solicitado até o momento.</p>
            )}

            {/* Sub-seção de Depósitos */}
            <h4 style={{ color: '#10b981', margin: '2rem 0 0.75rem' }}>⚡ Depósitos PIX Realizados</h4>
            {profileData?.userDeposits && profileData.userDeposits.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.betTable}>
                  <thead>
                    <tr>
                      <th>Transação</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.userDeposits.map(d => (
                      <tr key={d.id}>
                        <td><strong>{d.id}</strong></td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {new Date(d.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td style={{ color: '#10b981', fontWeight: 800 }}>+ R$ {d.amount.toFixed(2)}</td>
                        <td>
                          {d.status === 'approved' ? (
                            <span className={styles.badgeGreen}>✓ CREDITADO</span>
                          ) : (
                            <span className={styles.badgeOpen}>⏳ PENDENTE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nenhum depósito registrado ainda.</p>
            )}
          </div>
        )}

        {/* 4. ABA PEDIR SAQUE PIX */}
        {activeTab === 'saque' && (
          <div className={styles.withdrawForm}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Solicitar Retirada de Saldo (Saque PIX)</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Transfira seus lucros diretamente para a sua conta bancária via PIX. Processamento rápido e sem taxas.
            </p>

            <form onSubmit={handleSubmitWithdraw}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Valor do Saque (R$) — Saldo Disponível: R$ {saldo.toFixed(2)}
                </label>
                <input
                  type="number"
                  min="10"
                  max={saldo}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className={styles.formInput}
                  placeholder="Ex: 50.00"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo da sua Chave PIX</label>
                <select
                  value={pixKeyType}
                  onChange={e => setPixKeyType(e.target.value)}
                  className={styles.formInput}
                >
                  <option value="cpf">CPF do Titular</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Chave PIX de Destino</label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                  placeholder="Informe a chave exatamente como no seu banco"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.withdrawDisclaimer}>
                <strong>🔒 Regras de Segurança BetCerta:</strong>
                <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                  <li>Para sua segurança, a chave PIX deve pertencer ao mesmo titular cadastrado na conta.</li>
                  <li>O valor mínimo de retirada é de <strong>R$ 10,00</strong>.</li>
                  <li>O pagamento é efetuado por nossa conta empresarial oficial sem cobrança de taxas.</li>
                </ul>
              </div>

              {withdrawFeedback && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: withdrawFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: withdrawFeedback.type === 'success' ? '#10b981' : '#f87171',
                    border: `1px solid ${withdrawFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  {withdrawFeedback.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingWithdraw || saldo < 10}
                className="btn-gold"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
              >
                {isSubmittingWithdraw ? 'Processando Saque...' : `Confirmar Saque de R$ ${parseFloat(withdrawAmount || '0').toFixed(2)}`}
              </button>
            </form>
          </div>
        )}

        {/* 5. ABA JOGO RESPONSÁVEL */}
        {activeTab === 'responsavel' && (
          <div>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', color: '#fff' }}>
              Jogo Consciente & Limites de Conta
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, maxWidth: '800px' }}>
              A BetCerta incentiva o entretenimento saudável. Você tem controle total sobre seus hábitos de aposta através de nossas ferramentas de proteção ao jogador.
            </p>

            <div className={styles.infoGrid} style={{ marginTop: '1.5rem' }}>
              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Limite Diário de Depósito</div>
                <div className={styles.infoItemValue}>R$ 5.000,00 (Padrão Seguro)</div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Pausa Temporária (Time-Out)</div>
                <button className="btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  Ativar Pausa de 24 horas
                </button>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLabel}>Auto-Exclusão Definitiva</div>
                <button
                  className="btn-outline"
                  style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Solicitar Encerramento de Conta
                </button>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
              <strong style={{ color: '#f59e0b' }}>Precisa de ajuda ou orientação?</strong>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.5rem 0' }}>
                Entidades gratuitas e confidenciais de apoio ao jogador no Brasil:
              </p>
              <ul style={{ color: '#cbd5e1', fontSize: '0.85rem', marginLeft: '1.2rem' }}>
                <li>Jogadores Anônimos do Brasil: <a href="https://jogadoresanonimos.com.br" target="_blank" rel="noreferrer" style={{ color: '#0073f5' }}>jogadoresanonimos.com.br</a></li>
                <li>Centro de Valorização da Vida (CVV): Ligue 188 (Atendimento Gratuito 24h)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
