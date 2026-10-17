'use client';

import React, { useState } from 'react';
import { useBet } from '@/context/BetContext';
import styles from './Betslip.module.css';

export default function Betslip() {
  const {
    betslip,
    removeSelection,
    clearSlip,
    placeBet,
    isSlipOpen,
    toggleSlip,
    saldo,
    bonus,
    betHistory,
    cashOutBet,
  } = useBet();

  const [activeTab, setActiveTab] = useState<'ordinaria' | 'express' | 'minhas'>('express');
  const [stake, setStake] = useState<string>('25');
  const [useFreebet, setUseFreebet] = useState<boolean>(false);
  const [betSuccessMsg, setBetSuccessMsg] = useState<string | null>(null);
  const [betErrorMsg, setBetErrorMsg] = useState<string | null>(null);

  const stakeNum = parseFloat(stake) || 0;
  const rawTotalOdds = betslip.reduce((acc, curr) => acc * curr.odd, 1);
  const totalOdds = parseFloat(rawTotalOdds.toFixed(2));

  const rawReturn = stakeNum * totalOdds;
  const potentialReturn = rawReturn.toFixed(2);

  const handlePlaceBet = () => {
    setBetSuccessMsg(null);
    setBetErrorMsg(null);

    const result = placeBet(stakeNum, useFreebet);
    if (result.success) {
      setBetSuccessMsg(result.message);
      if (useFreebet) setUseFreebet(false);
      setTimeout(() => setBetSuccessMsg(null), 4000);
    } else {
      setBetErrorMsg(result.message);
      setTimeout(() => setBetErrorMsg(null), 4000);
    }
  };

  const handleToggleFreebet = () => {
    if (!useFreebet) {
      setUseFreebet(true);
      const freebetVal = Math.min(bonus > 0 ? bonus : 20, 20);
      setStake(freebetVal.toString());
    } else {
      setUseFreebet(false);
      setStake('25');
    }
  };

  const handleQuickStake = (val: number) => {
    setStake(val.toString());
  };

  const openBets = betHistory.filter(b => b.status === 'open');

  return (
    <>
      <div
        className={`${styles.betslipOverlay} ${isSlipOpen ? styles.overlayOpen : ''}`}
        onClick={toggleSlip}
      />
      <aside className={`${styles.betslipContainer} ${isSlipOpen ? styles.open : ''}`}>
      {/* Cabeçalho do Betslip Estilo 1Win */}
      <div className={styles.header}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'ordinaria' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('ordinaria')}
          >
            Ordinária
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'express' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('express')}
          >
            Express {betslip.length > 0 && <span className={styles.countBadge}>{betslip.length}</span>}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'minhas' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('minhas')}
          >
            Abertas {openBets.length > 0 && <span className={styles.countBadgeGold}>{openBets.length}</span>}
          </button>
        </div>
        <button className={styles.closeBtn} onClick={toggleSlip} title="Fechar bilhete">
          ✕
        </button>
      </div>

      {/* Conteúdo Aba Bilhete (Ordinária ou Express) */}
      {(activeTab === 'ordinaria' || activeTab === 'express') && (
        <div className={styles.content}>
          {betslip.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎯</span>
              <p className={styles.emptyTitle}>Seu bilhete 1Win está vazio</p>
              <p className={styles.emptySub}>
                Selecione as cotações nas partidas para montar sua aposta simples ou acumulador Express!
              </p>
            </div>
          ) : (
            <>
              {/* Botão limpar tudo */}
              <div className={styles.slipActions}>
                <span className={styles.slipType}>
                  {activeTab === 'express'
                    ? `Express Multiplicador (${betslip.length})`
                    : `Aposta Ordinária (${betslip.length})`}
                </span>
                <button onClick={clearSlip} className={styles.clearBtn}>
                  Limpar tudo
                </button>
              </div>

              {/* Informação de Aposta Múltipla Express */}
              {activeTab === 'express' && betslip.length > 1 && (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    padding: '0.5rem 0.8rem',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)' }}>
                      ⚡ MÚLTIPLA EXPRESS
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {betslip.length} seleções combinadas com cotações multiplicadas!
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Seleções */}
              <div className={styles.selectionsList}>
                {betslip.map(item => (
                  <div
                    key={item.id}
                    className={item.isBetBuilder ? styles.builderItemCard : styles.itemCard}
                  >
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeSelection(item.id)}
                      title="Remover seleção"
                    >
                      ✕
                    </button>
                    <div className={styles.itemHeader}>
                      {item.isBetBuilder ? (
                        <span className={styles.builderBadge}>⚡ CRIAR APOSTA</span>
                      ) : (
                        <span className={styles.itemSport}>{item.sport}</span>
                      )}
                      <span className={styles.itemOdd}>{item.odd.toFixed(2)}</span>
                    </div>
                    <div className={styles.itemSelection}>{item.selection}</div>
                    <div className={styles.itemMarket}>{item.marketName}</div>
                    <div className={styles.itemMatch}>{item.matchTitle}</div>

                    {/* Pernas do Bet Builder */}
                    {item.isBetBuilder && item.builderSelections && (
                      <div className={styles.builderLegsList}>
                        {item.builderSelections.map((leg, lIdx) => (
                          <div key={lIdx} className={styles.builderLegItem}>
                            <span>
                              <span className={styles.builderLegDot}>•</span> {leg.selection}
                            </span>
                            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                              {leg.odd.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Área de Cálculo e Valor da Aposta */}
              <div className={styles.stakeBox}>
                {/* SELETOR DE APOSTA GRÁTIS (FREEBET) ESTILO BETANO / SUPERBET */}
                {bonus > 0 && (
                  <div
                    onClick={handleToggleFreebet}
                    style={{
                      background: useFreebet
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(16, 185, 129, 0.22))'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: useFreebet
                        ? '1px solid #f59e0b'
                        : '1px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🎁</span>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: useFreebet ? '#fbbf24' : '#fff', display: 'block' }}>
                          {useFreebet ? 'Usando Aposta Grátis (Ativada)' : 'Usar Aposta Grátis (Freebet)'}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          Disponível: <strong style={{ color: '#10b981' }}>R$ {bonus.toFixed(2)}</strong> (Sem gastar seu saldo!)
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: useFreebet ? '2px solid #10b981' : '2px solid #64748b',
                        background: useFreebet ? '#10b981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                      }}
                    >
                      {useFreebet ? '✓' : ''}
                    </div>
                  </div>
                )}

                <div className={styles.stakeInputRow}>
                  <label htmlFor="stake-input" className={styles.stakeLabel}>
                    {useFreebet ? 'Valor da Aposta Grátis (R$):' : 'Valor da Aposta (R$):'}
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencyPrefix}>R$</span>
                    <input
                      id="stake-input"
                      type="number"
                      min="1"
                      step="1"
                      value={stake}
                      onChange={e => setStake(e.target.value)}
                      className={styles.stakeInput}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Chips de aposta rápida */}
                <div className={styles.chipsRow}>
                  {[10, 20, 25, 50, 100].map(val => (
                    <button
                      key={val}
                      className={styles.chipBtn}
                      onClick={() => handleQuickStake(val)}
                    >
                      +{val}
                    </button>
                  ))}
                  <button
                    className={`${styles.chipBtn} ${styles.chipMax}`}
                    onClick={() => handleQuickStake(useFreebet ? Math.floor(bonus) : Math.floor(saldo))}
                  >
                    MAX
                  </button>
                </div>

                {/* Resumo de Retorno com Cotação Múltipla */}
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>Cotação Express:</span>
                    <strong className={styles.highlightOdd}>{totalOdds.toFixed(2)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Ganhos Potenciais:</span>
                    <strong className={styles.highlightReturn} style={{ color: 'var(--green-action)' }}>
                      R$ {potentialReturn}
                    </strong>
                  </div>
                </div>

                {/* Mensagens de feedback */}
                {betSuccessMsg && (
                  <div className={styles.successMsg}>{betSuccessMsg}</div>
                )}
                {betErrorMsg && (
                  <div className={styles.errorMsg}>{betErrorMsg}</div>
                )}

                {/* Botão de Finalizar Aposta */}
                <button
                  onClick={handlePlaceBet}
                  className={useFreebet ? "btn-gold" : "btn-1win-green"}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 800 }}
                  id="btn-confirmar-aposta"
                >
                  {useFreebet
                    ? `🎁 APOSTAR GRÁTIS (R$ ${stakeNum.toFixed(2)})`
                    : '⚡ FAZER APOSTA'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Conteúdo Aba Minhas Apostas (Cash Out) */}
      {activeTab === 'minhas' && (
        <div className={styles.content}>
          {openBets.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⏳</span>
              <p className={styles.emptyTitle}>Sem apostas abertas</p>
              <p className={styles.emptySub}>Suas apostas em andamento aparecerão aqui com opção de Cash Out imediato!</p>
            </div>
          ) : (
            <div className={styles.openBetsList}>
              {openBets.map(bet => (
                <div key={bet.id} className={styles.openBetCard}>
                  <div className={styles.openBetHeader}>
                    <span className={styles.betId}>{bet.id}</span>
                    <span className="badge-live">EM JOGO</span>
                  </div>

                  {bet.selections.map((sel, idx) => (
                    <div key={idx} className={styles.openBetMatch}>
                      <strong>{sel.selection}</strong> ({sel.odd.toFixed(2)})
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {sel.matchTitle}
                      </div>
                    </div>
                  ))}

                  <div className={styles.openBetDetails}>
                    <div>
                      <span className={styles.detailLabel}>Aposta:</span>
                      <strong>R$ {bet.stake.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className={styles.detailLabel}>Retorno Potencial:</span>
                      <strong style={{ color: 'var(--green-win)' }}>R$ {bet.potentialReturn.toFixed(2)}</strong>
                    </div>
                  </div>

                  {bet.cashOutValue && (
                    <button
                      className="btn-gold"
                      style={{ width: '100%', marginTop: '0.75rem', padding: '0.55rem', fontSize: '0.85rem' }}
                      onClick={() => cashOutBet(bet.id)}
                    >
                      💰 Cash Out: R$ {bet.cashOutValue.toFixed(2)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  </>
);
}
