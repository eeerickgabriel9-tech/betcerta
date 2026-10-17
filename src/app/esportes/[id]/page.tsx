'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useBet } from '@/context/BetContext';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';
import { getExpandedMarkets, calculateBuilderOdds, MarketOptionItem } from '@/lib/matchMarkets';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import MatchStats from '@/components/MatchStats/MatchStats';
import Betslip from '@/components/Betslip/Betslip';
import styles from './match.module.css';

function MatchDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.id as string;

  const { matches, betslip, addSelection, removeSelection, isSlipOpen, toggleSlip } = useBet();

  // Encontrar o confronto
  const match: Match | undefined = useMemo(() => {
    return matches.find(m => m.id === matchId) || MOCK_MATCHES.find(m => m.id === matchId);
  }, [matches, matchId]);

  // Tab ativa: se a URL tiver ?tab=criar-aposta, inicia nela
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [builderSelections, setBuilderSelections] = useState<MarketOptionItem[]>([]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'criar-aposta') {
      setActiveTab('criar-aposta');
    }
  }, [searchParams]);

  // Obter todos os mercados expandidos
  const expanded = useMemo(() => {
    if (!match) return null;
    return getExpandedMarkets(match);
  }, [match]);

  // Odd combinada do Criar Aposta
  const builderOdd = useMemo(() => {
    return calculateBuilderOdds(builderSelections);
  }, [builderSelections]);

  if (!match || !expanded) {
    return (
      <div className={styles.container}>
        <Link href="/esportes" className={styles.backBtn}>
          ‹ Voltar para Esportes
        </Link>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <h2>Partida não encontrada</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            O evento solicitado pode ter sido encerrado ou o link está incorreto.
          </p>
          <Link href="/esportes" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Ver todos os jogos disponíveis
          </Link>
        </div>
      </div>
    );
  }

  const isSelectedInBetslip = (oddId: string) => betslip.some(item => item.id === oddId);
  const isSelectedInBuilder = (itemId: string) => builderSelections.some(item => item.id === itemId);

  // Manipulação de clique em odd
  const handleOddClick = (item: MarketOptionItem) => {
    if (activeTab === 'criar-aposta') {
      // Modo Criar Aposta: adiciona ao montador do jogo
      setBuilderSelections(prev => {
        const exists = prev.some(i => i.id === item.id);
        if (exists) {
          return prev.filter(i => i.id !== item.id);
        } else {
          // Substitui se for mesma categoria mutuamente exclusiva
          const mutuallyExclusive = ['winner', 'doubleChance', 'btts', 'firstHalf'];
          let updated = prev;
          if (mutuallyExclusive.includes(item.category)) {
            updated = prev.filter(i => i.category !== item.category);
          }
          return [...updated, item];
        }
      });
    } else {
      // Modo Padrão: adiciona direto ao bilhete geral
      if (isSelectedInBetslip(item.id)) {
        removeSelection(item.id);
      } else {
        addSelection({
          id: item.id,
          matchId: match.id,
          matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
          sport: match.sport,
          marketName: item.categoryLabel,
          selection: item.label,
          odd: item.odd,
        });
      }
    }
  };

  // Enviar aposta do Criar Aposta para o Bilhete
  const handleAddBuilderToBetslip = () => {
    if (builderSelections.length < 2) return;

    addSelection({
      id: `builder-${match.id}-${Date.now()}`,
      matchId: match.id,
      matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
      sport: match.sport,
      marketName: 'Criar Aposta',
      selection: `Criar Aposta (${builderSelections.length} seleções)`,
      odd: builderOdd,
      isBetBuilder: true,
      builderSelections: builderSelections.map(i => ({
        marketName: i.categoryLabel,
        selection: i.label,
        odd: i.odd,
      })),
    });

    if (!isSlipOpen) {
      toggleSlip();
    }

    setBuilderSelections([]);
  };

  const isSoccer = match.sport === 'futebol';

  return (
    <div className={styles.container}>
      {/* Botão Voltar */}
      <Link href="/esportes" className={styles.backBtn}>
        ‹ Voltar para Todos os Jogos
      </Link>

      {/* Banner Oficial do Confronto */}
      <div className={styles.matchBanner}>
        <div className={styles.bannerTop}>
          <div className={styles.leagueBadge}>
            <span>{match.leagueIcon}</span>
            <span>{match.league}</span>
          </div>
          {match.isLive ? (
            <div className="badge-live" style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 800 }}>
              🔴 AO VIVO {match.liveTime ? `• ${match.liveTime}` : ''}
            </div>
          ) : (
            <div className={styles.timeBadge}>
              ⏰ {match.date}
            </div>
          )}
        </div>

        <div className={styles.teamsLayout}>
          {/* Time Casa */}
          <div className={styles.teamBox}>
            <TeamBadge teamName={match.homeTeam} size={54} />
            <span className={styles.teamName}>{match.homeTeam}</span>
          </div>

          {/* Centro: Placar Ao Vivo ou VS */}
          {match.isLive ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(0, 115, 245, 0.15)',
                border: '1px solid rgba(0, 115, 245, 0.4)',
                padding: '0.4rem 1.4rem',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(0, 115, 245, 0.25)',
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{match.homeScore ?? 0}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-1win)' }}>:</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{match.awayScore ?? 0}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, letterSpacing: '0.5px' }}>
                ⏱️ {match.liveTime || 'EM ANDAMENTO'}
              </span>
            </div>
          ) : (
            <div className={styles.vsCenter}>
              <div className={styles.vsCircle}>VS</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {isSoccer ? 'FUTEBOL' : match.sport.toUpperCase()}
              </span>
            </div>
          )}

          {/* Time Fora */}
          <div className={styles.teamBox}>
            <TeamBadge teamName={match.awayTeam} size={54} />
            <span className={styles.teamName}>{match.awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Radar e Estatísticas Ao Vivo (Pitch 2D, Posse, Chutes, Lances) */}
      {match.isLive && match.stats && (
        <div style={{ marginBottom: '1.5rem' }}>
          <MatchStats match={match} />
        </div>
      )}

      {/* Barra de Abas de Mercados */}
      <div className={styles.tabsBar}>
        {/* Aba Criar Aposta com Destaque */}
        <button
          className={`${styles.tabBtn} ${styles.tabCriarAposta} ${
            activeTab === 'criar-aposta' ? styles.tabCriarApostaActive : ''
          }`}
          onClick={() => setActiveTab('criar-aposta')}
        >
          <span>⚡</span>
          <span>Criar Aposta</span>
          {builderSelections.length > 0 && (
            <span
              style={{
                background: '#fff',
                color: '#ff6600',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 900,
              }}
            >
              {builderSelections.length}
            </span>
          )}
        </button>

        {/* Aba Análise & Palpite */}
        {match.analysis && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'analise' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('analise')}
          >
            <span>📊</span>
            <span>Análise do Jogo</span>
          </button>
        )}

        {/* Abas Padrão */}
        <button
          className={`${styles.tabBtn} ${activeTab === 'todos' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Todos os Mercados
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'principais' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('principais')}
        >
          Principais
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'gols' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('gols')}
        >
          {isSoccer ? 'Total de Gols' : 'Totais'}
        </button>

        {expanded.btts && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'ambos-marcam' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('ambos-marcam')}
          >
            Ambos Marcam
          </button>
        )}

        {expanded.doubleChance && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'dupla-chance' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('dupla-chance')}
          >
            Dupla Chance
          </button>
        )}

        {expanded.firstHalf && (
          <button
            className={`${styles.tabBtn} ${activeTab === '1o-tempo' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('1o-tempo')}
          >
            ⏱️ 1º Tempo (HT)
          </button>
        )}

        {expanded.handicap && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'handicap' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('handicap')}
          >
            ⚖️ Handicap
          </button>
        )}

        {expanded.corners && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'escanteios' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('escanteios')}
          >
            Escanteios
          </button>
        )}

        {expanded.cards && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'cartoes' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('cartoes')}
          >
            Cartões
          </button>
        )}

        {expanded.players && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'jogadores' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('jogadores')}
          >
            {isSoccer ? 'Marcador de Gol' : 'Destaques'}
          </button>
        )}

        {expanded.exactScores && (
          <button
            className={`${styles.tabBtn} ${activeTab === 'placar' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('placar')}
          >
            Placar Exato
          </button>
        )}
      </div>

      {/* Banner Informativo quando o Criar Aposta estiver Ativo */}
      {activeTab === 'criar-aposta' && (
        <div className={styles.builderActiveBanner}>
          <div className={styles.builderBannerLeft}>
            <span className={styles.builderIcon}>⚡</span>
            <div>
              <div className={styles.builderTitle}>Modo Criar Aposta Ativo</div>
              <div className={styles.builderSub}>
                Selecione 2 ou mais opções abaixo deste jogo para combiná-las em uma aposta única com super odd!
              </div>
            </div>
          </div>
          {builderSelections.length > 0 && (
            <button
              onClick={() => setBuilderSelections([])}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Limpar ({builderSelections.length})
            </button>
          )}
        </div>
      )}

      {/* Seção de Análise do Confronto e Palpite */}
      {match.analysis && (activeTab === 'todos' || activeTab === 'analise') && (
        <div className={styles.analysisCard}>
          <div className={styles.analysisHeader}>
            <div className={styles.analysisTitle}>
              <span>📊</span>
              <span>Análise do Confronto & Insights Estatísticos</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>
              IA BetCerta Analytics
            </span>
          </div>

          <div className={styles.analysisHeadline}>
            {match.analysis.headline}
          </div>

          {/* Barra de Probabilidades */}
          <div className={styles.probSection}>
            <div className={styles.probLabels}>
              <span>{match.homeTeam}: {match.analysis.probHome}%</span>
              {match.analysis.probDraw !== undefined && <span>Empate: {match.analysis.probDraw}%</span>}
              <span>{match.awayTeam}: {match.analysis.probAway}%</span>
            </div>
            <div className={styles.probBarContainer}>
              <div className={styles.probBarHome} style={{ width: `${match.analysis.probHome}%` }} />
              {match.analysis.probDraw !== undefined && (
                <div className={styles.probBarDraw} style={{ width: `${match.analysis.probDraw}%` }} />
              )}
              <div className={styles.probBarAway} style={{ width: `${match.analysis.probAway}%` }} />
            </div>
          </div>

          {/* Forma Recente */}
          <div className={styles.formsRow}>
            <div className={styles.formCol}>
              <span className={styles.formTitle}>Forma Recente: {match.homeTeam}</span>
              <div className={styles.formBadges}>
                {match.analysis.formHome.map((f, idx) => (
                  <span
                    key={idx}
                    className={f === 'V' ? styles.badgeV : f === 'E' ? styles.badgeE : styles.badgeD}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.formCol}>
              <span className={styles.formTitle}>Forma Recente: {match.awayTeam}</span>
              <div className={styles.formBadges}>
                {match.analysis.formAway.map((f, idx) => (
                  <span
                    key={idx}
                    className={f === 'V' ? styles.badgeV : f === 'E' ? styles.badgeE : styles.badgeD}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo da Análise */}
          <div className={styles.analysisSummary}>
            {match.analysis.summary}
          </div>

          {/* Insights Chave e Dica do Especialista */}
          <div className={styles.insightsRow}>
            <div className={styles.keyStatBox}>
              <span className={styles.boxLabel}>⚡ Estatística de Ouro</span>
              <span className={styles.boxValue}>{match.analysis.keyStat}</span>
            </div>

            <div className={styles.tipBox}>
              <span className={styles.tipLabel}>🎯 Palpite Recomendado</span>
              <span className={styles.tipValue}>{match.analysis.tip}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grade de Mercados e Odds */}
      <div className={styles.marketsGrid}>
        {/* 1. Resultado Final / Vencedor */}
        {(activeTab === 'todos' ||
          activeTab === 'criar-aposta' ||
          activeTab === 'principais') && (
          <div className={styles.marketCard}>
            <div className={styles.marketHeader}>
              <span className={styles.marketTitle}>
                🏆 {match.markets.winner.draw ? 'Resultado Final (1X2)' : 'Vencedor do Jogo'}
              </span>
            </div>
            <div className={styles.oddsGrid}>
              {expanded.winner.map(item => {
                const isSelected =
                  activeTab === 'criar-aposta'
                    ? isSelectedInBuilder(item.id)
                    : isSelectedInBetslip(item.id);

                return (
                  <button
                    key={item.id}
                    className={`${styles.oddBtn} ${
                      isSelected
                        ? activeTab === 'criar-aposta'
                          ? styles.oddSelectedBuilder
                          : styles.oddSelected
                        : ''
                    }`}
                    onClick={() => handleOddClick(item)}
                  >
                    <span className={styles.oddLabel}>
                      {isSelected && activeTab === 'criar-aposta' && (
                        <span className={styles.checkMark}>✓</span>
                      )}
                      {item.label}
                    </span>
                    <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Dupla Chance */}
        {expanded.doubleChance &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'principais' ||
            activeTab === 'dupla-chance') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🛡️ Dupla Chance</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.doubleChance.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 3. Ambos os Times Marcam */}
        {expanded.btts &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'principais' ||
            activeTab === 'ambos-marcam') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>⚽ Ambos os Times Marcam</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.btts.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 4. Total de Gols / Pontos */}
        {(activeTab === 'todos' ||
          activeTab === 'criar-aposta' ||
          activeTab === 'gols') && (
          <div className={styles.marketCard}>
            <div className={styles.marketHeader}>
              <span className={styles.marketTitle}>
                🥅 {isSoccer ? 'Linhas de Total de Gols' : 'Totais da Partida'}
              </span>
            </div>
            <div className={styles.oddsGrid}>
              {expanded.totals.map(item => {
                const isSelected =
                  activeTab === 'criar-aposta'
                    ? isSelectedInBuilder(item.id)
                    : isSelectedInBetslip(item.id);

                return (
                  <button
                    key={item.id}
                    className={`${styles.oddBtn} ${
                      isSelected
                        ? activeTab === 'criar-aposta'
                          ? styles.oddSelectedBuilder
                          : styles.oddSelected
                        : ''
                    }`}
                    onClick={() => handleOddClick(item)}
                  >
                    <span className={styles.oddLabel}>
                      {isSelected && activeTab === 'criar-aposta' && (
                        <span className={styles.checkMark}>✓</span>
                      )}
                      {item.label}
                    </span>
                    <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. 1º Tempo (HT) */}
        {expanded.firstHalf &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'principais' ||
            activeTab === '1o-tempo') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>⏱️ 1º Tempo (HT — Resultado e Gols)</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.firstHalf.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 6. Handicap Asiático */}
        {expanded.handicap &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'principais' ||
            activeTab === 'handicap') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>⚖️ Handicap Asiático e Europeu</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.handicap.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 5. Escanteios */}
        {expanded.corners &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'escanteios') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🚩 Total de Escanteios</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.corners.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 6. Cartões */}
        {expanded.cards &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'cartoes') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🟨 Total de Cartões</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.cards.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 7. Marcadores de Gol / Jogadores */}
        {expanded.players &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'jogadores') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>
                  👟 {isSoccer ? 'Marcador de Gol a Qualquer Momento' : 'Estatísticas de Atletas'}
                </span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.players.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* 8. Placar Exato */}
        {expanded.exactScores &&
          (activeTab === 'todos' ||
            activeTab === 'criar-aposta' ||
            activeTab === 'placar') && (
            <div className={styles.marketCard}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🎯 Placar Exato</span>
              </div>
              <div className={styles.oddsGrid}>
                {expanded.exactScores.map(item => {
                  const isSelected =
                    activeTab === 'criar-aposta'
                      ? isSelectedInBuilder(item.id)
                      : isSelectedInBetslip(item.id);

                  return (
                    <button
                      key={item.id}
                      className={`${styles.oddBtn} ${
                        isSelected
                          ? activeTab === 'criar-aposta'
                            ? styles.oddSelectedBuilder
                            : styles.oddSelected
                          : ''
                      }`}
                      onClick={() => handleOddClick(item)}
                    >
                      <span className={styles.oddLabel}>
                        {isSelected && activeTab === 'criar-aposta' && (
                          <span className={styles.checkMark}>✓</span>
                        )}
                        {item.label}
                      </span>
                      <span className={styles.oddValue}>{item.odd.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Floating Bar do Criar Aposta (Aparece quando houver seleções no modo Criar Aposta) */}
      {activeTab === 'criar-aposta' && builderSelections.length > 0 && (
        <div className={styles.floatingBuilderBar}>
          <div className={styles.chipsList}>
            {builderSelections.map(sel => (
              <span key={sel.id} className={styles.chipItem}>
                <span>{sel.label}</span>
                <span style={{ color: '#ffaa66', fontWeight: 800 }}>({sel.odd.toFixed(2)})</span>
                <button
                  className={styles.chipClose}
                  onClick={() =>
                    setBuilderSelections(prev => prev.filter(i => i.id !== sel.id))
                  }
                  title="Remover seleção"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className={styles.barActionRow}>
            <div className={styles.barOddsBox}>
              <span className={styles.barOddsLabel}>
                {builderSelections.length} {builderSelections.length === 1 ? 'Seleção' : 'Seleções'} (Criar Aposta)
              </span>
              <span className={styles.barOddsValue}>Odd: {builderOdd.toFixed(2)}</span>
            </div>

            <button
              className={styles.btnSubmitBuilder}
              disabled={builderSelections.length < 2}
              onClick={handleAddBuilderToBetslip}
            >
              <span>⚡</span>
              <span>
                {builderSelections.length < 2
                  ? 'Selecione mais 1 opção'
                  : `Adicionar ao Bilhete (${builderOdd.toFixed(2)})`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchDetailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#ffffff' }}>
          <h2>Carregando partida e cotações...</h2>
        </div>
      }
    >
      <MatchDetailContent />
    </Suspense>
  );
}
