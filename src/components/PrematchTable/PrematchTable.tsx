'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Match } from '@/data/mockMatches';
import { useBet } from '@/context/BetContext';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import styles from './PrematchTable.module.css';

function parseMatchDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.toLowerCase().includes('encerrado')) return null;

  const now = new Date();
  const lower = dateStr.toLowerCase().trim();

  // Caso 1: "Hoje, HH:MM"
  const hojeMatch = lower.match(/hoje,?\s*(\d{1,2}):(\d{2})/);
  if (hojeMatch) {
    const d = new Date(now);
    d.setHours(parseInt(hojeMatch[1], 10), parseInt(hojeMatch[2], 10), 0, 0);
    return d;
  }

  // Caso 2: "Amanhã, HH:MM" ou "Amanha, HH:MM"
  const amanhaMatch = lower.match(/amanh[aã],?\s*(\d{1,2}):(\d{2})/);
  if (amanhaMatch) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(parseInt(amanhaMatch[1], 10), parseInt(amanhaMatch[2], 10), 0, 0);
    return d;
  }

  // Caso 3: "Sáb 17/10, HH:MM", "17/10, HH:MM", "Dom 18/10, HH:MM", etc.
  const dateMatch = lower.match(/(\d{1,2})\/(\d{1,2}),?\s*(\d{1,2}):(\d{2})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1; // 0-indexed
    const hours = parseInt(dateMatch[3], 10);
    const mins = parseInt(dateMatch[4], 10);
    const d = new Date(now.getFullYear(), month, day, hours, mins, 0, 0);
    return d;
  }

  // Caso 4: formato ISO
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso;

  return null;
}

function isMatchToday(dateStr: string): boolean {
  if (!dateStr || dateStr.toLowerCase().includes('encerrado')) return false;
  if (dateStr.toLowerCase().includes('hoje')) return true;

  const d = parseMatchDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
}

function isMatchWeekend(dateStr: string): boolean {
  if (!dateStr || dateStr.toLowerCase().includes('encerrado')) return false;
  const lower = dateStr.toLowerCase();
  if (lower.includes('amanh') || lower.includes('sáb') || lower.includes('sábado') || lower.includes('dom') || lower.includes('domingo')) {
    return true;
  }
  const d = parseMatchDate(dateStr);
  if (!d) return false;
  const day = d.getDay();
  return day === 0 || day === 6; // Sábado ou Domingo
}

function isMatchWithinHours(dateStr: string, maxHours: number): boolean {
  if (!dateStr || dateStr.toLowerCase().includes('encerrado')) return false;

  const d = parseMatchDate(dateStr);
  if (!d) return false;

  const now = new Date();
  const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Considera jogos de até 30 min atrás (recém-iniciados) até maxHours à frente
  return diffHours >= -0.5 && diffHours <= maxHours;
}

function hasMatchPassed(dateStr: string): boolean {
  if (dateStr.toLowerCase().includes('encerrado')) return true;
  const d = parseMatchDate(dateStr);
  if (!d) return false;

  const now = new Date();
  // Se já se passaram mais de 135 minutos do início, a partida encerrou
  return (now.getTime() - d.getTime()) > 135 * 60 * 1000;
}

interface PrematchTableProps {
  initialSport?: string;
  initialLeague?: string;
}

export default function PrematchTable({ initialSport = 'todos', initialLeague = 'todas' }: PrematchTableProps) {
  const { matches, betslip, addSelection } = useBet();

  const [selectedSport, setSelectedSport] = useState<string>(initialSport);
  const [selectedLeague, setSelectedLeague] = useState<string>(initialLeague);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('todos');
  const [collapsedLeagues, setCollapsedLeagues] = useState<{ [key: string]: boolean }>({});

  // Sincronizar com props recebidas de fora (URL / Sidebar)
  React.useEffect(() => {
    setSelectedSport(initialSport);
  }, [initialSport]);

  React.useEffect(() => {
    setSelectedLeague(initialLeague);
  }, [initialLeague]);

  const isSelected = (oddId: string) => betslip.some(item => item.id === oddId);

  const handleSelectOdd = (
    oddId: string,
    match: Match,
    selectionName: string,
    oddValue: number,
    marketName: string
  ) => {
    addSelection({
      id: oddId,
      matchId: match.id,
      matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
      sport: match.sport,
      marketName,
      selection: selectionName,
      odd: oddValue,
    });
  };

  const toggleLeague = (leagueKey: string) => {
    setCollapsedLeagues(prev => ({
      ...prev,
      [leagueKey]: !prev[leagueKey],
    }));
  };

  const handleSelectSportTab = (sportId: string) => {
    setSelectedSport(sportId);
    setSelectedLeague('todas'); // Libera o filtro de liga específica para exibir todas as partidas do esporte selecionado
  };

  // Base de jogos para a contagem dos filtros (Apenas jogos que NÃO encerraram e sem duplicidades)
  const basePrematchMatches = useMemo(() => {
    const seenMatches = new Set<string>();
    return matches.filter(m => {
      if (m.isLive) return false;
      // NUNCA exibir jogos já finalizados/encerrados para aposta pré-jogo
      if (m.date && (m.date.toLowerCase().includes('encerrado') || hasMatchPassed(m.date))) return false;
      if (selectedSport !== 'todos' && m.sport !== selectedSport) return false;
      if (selectedLeague !== 'todas' && m.leagueKey !== selectedLeague) return false;

      // Desduplicar confrontos com mesmo time mandante e visitante
      const key = `${m.homeTeam.trim().toLowerCase()}_vs_${m.awayTeam.trim().toLowerCase()}`;
      if (seenMatches.has(key)) return false;
      seenMatches.add(key);

      return true;
    });
  }, [matches, selectedSport, selectedLeague]);

  // Contagens dinâmicas por filtro de tempo
  const countTodos = basePrematchMatches.length;
  const countHoje = basePrematchMatches.filter(m => isMatchToday(m.date)).length;
  const countFimDeSemana = basePrematchMatches.filter(m => isMatchWeekend(m.date)).length;
  const count3h = basePrematchMatches.filter(m => isMatchWithinHours(m.date, 3)).length;
  const count6h = basePrematchMatches.filter(m => isMatchWithinHours(m.date, 6)).length;
  const count12h = basePrematchMatches.filter(m => isMatchWithinHours(m.date, 12)).length;

  // Filtragem dos jogos
  const filteredMatches = useMemo(() => {
    return basePrematchMatches.filter(m => {
      // Regra Filtro de tempo 1Win
      if (selectedTimeFilter === 'hoje' && !isMatchToday(m.date)) return false;
      if (selectedTimeFilter === 'amanha' && !isMatchWeekend(m.date)) return false;
      if (selectedTimeFilter === '3h' && !isMatchWithinHours(m.date, 3)) return false;
      if (selectedTimeFilter === '6h' && !isMatchWithinHours(m.date, 6)) return false;
      if (selectedTimeFilter === '12h' && !isMatchWithinHours(m.date, 12)) return false;

      return true;
    });
  }, [basePrematchMatches, selectedTimeFilter]);

  // Agrupamento por Liga
  const groupedByLeague = useMemo(() => {
    const groups: { [key: string]: { league: string; leagueIcon: string; sport: string; matches: Match[] } } = {};

    filteredMatches.forEach(m => {
      if (!groups[m.league]) {
        groups[m.league] = {
          league: m.league,
          leagueIcon: m.leagueIcon,
          sport: m.sport,
          matches: [],
        };
      }
      groups[m.league].matches.push(m);
    });

    return Object.values(groups);
  }, [filteredMatches]);

  // Contagens por esporte para a barra horizontal
  const footballCount = matches.filter(m => m.sport === 'futebol' && !m.isLive).length;
  const basketballCount = matches.filter(m => m.sport === 'basquete' && !m.isLive).length;
  const nflCount = matches.filter(m => m.sport === 'futebol-americano' && !m.isLive).length;
  const esportsCount = matches.filter(m => m.sport === 'esports' && !m.isLive).length;

  return (
    <div className={styles.container}>
      {/* 1. BARRA DE FILTRO DE TEMPO ESTILO 1WIN COM CONTAGEM REAL */}
      <div className={styles.timeFilterRow}>
        {[
          { id: 'todos', label: 'Todos', count: countTodos },
          { id: 'hoje', label: 'Hoje', count: countHoje },
          { id: 'amanha', label: 'Fim de Semana', count: countFimDeSemana },
          { id: '3h', label: '3 Horas', count: count3h },
          { id: '6h', label: '6 Horas', count: count6h },
          { id: '12h', label: '12 Horas', count: count12h },
        ].map(tf => (
          <button
            key={tf.id}
            className={`${styles.timeBtn} ${selectedTimeFilter === tf.id ? styles.timeBtnActive : ''}`}
            onClick={() => setSelectedTimeFilter(tf.id)}
          >
            <span>{tf.label}</span>
            <span className={styles.timeBadgeCount}>({tf.count})</span>
          </button>
        ))}
      </div>

      {/* 2. FITA DE ESPORTES HORIZONTAL 1WIN */}
      <div className={styles.sportsBar}>
        {[
          { id: 'todos', label: 'Todos os Esportes', icon: '🌐', count: matches.filter(m => !m.isLive).length },
          { id: 'futebol', label: 'Futebol', icon: '⚽', count: footballCount },
          { id: 'basquete', label: 'Basquete', icon: '🏀', count: basketballCount },
          { id: 'futebol-americano', label: 'Futebol Americano', icon: '🏈', count: nflCount },
          { id: 'esports', label: 'eSports', icon: '🎮', count: esportsCount },
        ].map(sp => (
          <button
            key={sp.id}
            className={`${styles.sportTab} ${selectedSport === sp.id ? styles.sportTabActive : ''}`}
            onClick={() => handleSelectSportTab(sp.id)}
          >
            <span>{sp.icon}</span>
            <span>{sp.label}</span>
            <span className={styles.sportCountBadge}>{sp.count}</span>
          </button>
        ))}
      </div>

      {/* Indicador de Filtro Ativo por Liga com Botão de Limpar */}
      {selectedLeague !== 'todas' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📌</span>
            <span style={{ color: '#fff', fontSize: '0.85rem' }}>
              Filtrando pela competição: <strong style={{ color: '#60a5fa' }}>{matches.find(m => m.leagueKey === selectedLeague)?.league || selectedLeague}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedLeague('todas')}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✕ Ver Todas as Ligas
          </button>
        </div>
      )}

      {/* 3. TABELA DE JOGOS PREMATCH AGRUPADA POR LIGA */}
      {groupedByLeague.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <h3 style={{ color: '#fff', marginTop: '0.5rem' }}>Nenhum confronto encontrado</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Tente selecionar outro esporte ou alterar o filtro de horário acima.
          </p>
          {selectedLeague !== 'todas' && (
            <button
              onClick={() => setSelectedLeague('todas')}
              className="btn-1win-green"
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Ver Todas as Partidas
            </button>
          )}
        </div>
      ) : (
        groupedByLeague.map(group => {
          const isCollapsed = collapsedLeagues[group.league];

          return (
            <div key={group.league} className={styles.leagueBlock}>
              {/* Cabeçalho da Liga (Estilo 1Win Header) */}
              <div className={styles.leagueHeader} onClick={() => toggleLeague(group.league)}>
                <div className={styles.leagueTitleLeft}>
                  <span className={styles.leagueFlag}>{group.leagueIcon}</span>
                  <span className={styles.leagueName}>{group.league}</span>
                  <span className={styles.leagueBadgeCount}>{group.matches.length}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {isCollapsed ? '▼ Expandir' : '▲ Recolher'}
                </span>
              </div>

              {!isCollapsed && (
                <>
                  {/* Cabeçalhos de Colunas */}
                  <div className={styles.tableHeaderRow}>
                    <span>Início</span>
                    <span>Partida</span>
                    <span className={styles.colCenter}>
                      {group.matches[0]?.markets.winner.draw ? '1 • X • 2' : '1 • 2 (Vencedor)'}
                    </span>
                    <span className={styles.colCenter}>Criar Aposta</span>
                    <span className={styles.colCenter}>Mais Opções</span>
                  </div>

                  {/* Linhas de Partidas */}
                  {group.matches.map(m => {
                    const hasDraw = !!m.markets.winner.draw;

                    return (
                      <React.Fragment key={m.id}>
                        <div className={styles.matchRow}>
                          {/* Coluna Horário */}
                          <div className={styles.timeCol}>
                            <span className={styles.matchTime}>
                              {m.date.split(',')[1]?.trim() || m.date}
                            </span>
                            <span className={styles.matchDate}>
                              {m.date.split(',')[0]?.trim()}
                            </span>
                          </div>

                          {/* Coluna Times (Entrar no Jogo) */}
                          <Link
                            href={`/esportes/${m.id}`}
                            className={styles.teamsCol}
                            style={{ textDecoration: 'none' }}
                            title="Entrar no jogo e ver todas as odds e Criar Aposta"
                          >
                            <div className={styles.teamLine}>
                              <TeamBadge teamName={m.homeTeam} size={18} />
                              <span className={styles.teamName}>{m.homeTeam}</span>
                            </div>
                            <div className={styles.teamLine}>
                              <TeamBadge teamName={m.awayTeam} size={18} />
                              <span className={styles.teamName}>{m.awayTeam}</span>
                            </div>
                          </Link>

                          {/* Coluna Odds 1X2 ou 1-2 */}
                          <div className={hasDraw ? styles.oddsCol3 : styles.oddsCol2}>
                            {/* 1 - Casa */}
                            <button
                              className={`${styles.oddCell} ${isSelected(m.markets.winner.home.id) ? styles.oddSelected : ''}`}
                              onClick={() =>
                                handleSelectOdd(
                                  m.markets.winner.home.id,
                                  m,
                                  m.homeTeam,
                                  m.markets.winner.home.odd,
                                  hasDraw ? 'Resultado Final (1X2)' : 'Vencedor do Confronto'
                                )
                              }
                            >
                              <span className={styles.oddLabel}>1</span>
                              <span className={styles.oddVal}>{m.markets.winner.home.odd.toFixed(2)}</span>
                            </button>

                            {/* X - Empate */}
                            {hasDraw && m.markets.winner.draw && (
                              <button
                                className={`${styles.oddCell} ${isSelected(m.markets.winner.draw.id) ? styles.oddSelected : ''}`}
                                onClick={() =>
                                 handleSelectOdd(
                                    m.markets.winner.draw!.id,
                                    m,
                                    'Empate',
                                    m.markets.winner.draw!.odd,
                                    'Resultado Final (1X2)'
                                  )
                                }
                              >
                                <span className={styles.oddLabel}>X</span>
                                <span className={styles.oddVal}>{m.markets.winner.draw.odd.toFixed(2)}</span>
                              </button>
                            )}

                            {/* 2 - Fora */}
                            <button
                              className={`${styles.oddCell} ${isSelected(m.markets.winner.away.id) ? styles.oddSelected : ''}`}
                              onClick={() =>
                                handleSelectOdd(
                                  m.markets.winner.away.id,
                                  m,
                                  m.awayTeam,
                                  m.markets.winner.away.odd,
                                  hasDraw ? 'Resultado Final (1X2)' : 'Vencedor do Confronto'
                                )
                              }
                            >
                              <span className={styles.oddLabel}>2</span>
                              <span className={styles.oddVal}>{m.markets.winner.away.odd.toFixed(2)}</span>
                            </button>
                          </div>

                          {/* Coluna Criar Aposta */}
                          <div className={styles.builderCol}>
                            <Link
                              href={`/esportes/${m.id}?tab=criar-aposta`}
                              className={styles.builderTableBtn}
                              title="Criar aposta combinada personalizada para este jogo"
                            >
                              <span>⚡</span>
                              <span>Criar Aposta</span>
                            </Link>
                          </div>

                          {/* Botão Entrar no Jogo / Mais Opções */}
                          <div className={styles.moreCol}>
                            <Link
                              href={`/esportes/${m.id}`}
                              className={styles.moreBtn}
                              title="Entrar no jogo e ver todas as odds"
                            >
                              <span>+ Mais Opções ›</span>
                            </Link>
                          </div>
                        </div>

                        {/* Ações no Mobile */}
                        <div className={styles.tableActionsMobile}>
                          <Link
                            href={`/esportes/${m.id}?tab=criar-aposta`}
                            className={styles.builderTableBtn}
                          >
                            <span>⚡</span>
                            <span>Criar Aposta</span>
                          </Link>
                          <Link
                            href={`/esportes/${m.id}`}
                            className={styles.moreBtn}
                          >
                            <span>+ Mais Opções ›</span>
                          </Link>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
