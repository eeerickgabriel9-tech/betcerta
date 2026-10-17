'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Match } from '@/data/mockMatches';
import { useBet } from '@/context/BetContext';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import MatchStats from '@/components/MatchStats/MatchStats';
import styles from './MatchCard.module.css';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

export default function MatchCard({ match, featured = false }: MatchCardProps) {
  const { betslip, addSelection } = useBet();
  const [showStats, setShowStats] = useState(false);

  const isSelected = (oddId: string) => betslip.some(item => item.id === oddId);

  const handleSelectOdd = (
    oddId: string,
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

  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''}`}>
      {/* Topo do card: Liga e status */}
      <div className={styles.header}>
        <div className={styles.league}>
          <span className={styles.leagueIcon}>{match.leagueIcon}</span>
          <span className={styles.leagueName}>{match.league}</span>
        </div>
        <div className={styles.status}>
          {match.isLive ? (
            <span className="badge-live">
              AO VIVO {match.liveTime && `• ${match.liveTime}`}
            </span>
          ) : (
            <span className={styles.matchDate}>⏰ {match.date}</span>
          )}
        </div>
      </div>

      {/* Times com Escudos Reais e Placar (Entrar no Jogo) */}
      <Link
        href={`/esportes/${match.id}`}
        className={styles.teamsRow}
        style={{ textDecoration: 'none' }}
        title="Entrar no jogo e ver todas as odds e Criar Aposta"
      >
        <div className={styles.teamCol}>
          <div className={styles.teamBadgeWrapper}>
            <TeamBadge teamName={match.homeTeam} size={32} />
            <span className={styles.teamName}>{match.homeTeam}</span>
          </div>
          {match.isLive && (
            <span className={styles.score}>{match.homeScore}</span>
          )}
        </div>

        <div className={styles.vsBadge}>VS</div>

        <div className={styles.teamCol}>
          <div className={styles.teamBadgeWrapper}>
            <TeamBadge teamName={match.awayTeam} size={32} />
            <span className={styles.teamName}>{match.awayTeam}</span>
          </div>
          {match.isLive && (
            <span className={styles.score}>{match.awayScore}</span>
          )}
        </div>
      </Link>

      {/* Botão de Estatísticas Ao Vivo */}
      {match.isLive && match.stats && (
        <div className={styles.statsToggleRow}>
          <button
            type="button"
            className={`${styles.statsBtn} ${showStats ? styles.statsBtnActive : ''}`}
            onClick={() => setShowStats(!showStats)}
          >
            <span>📊 {showStats ? 'Ocultar Estatísticas' : 'Estatísticas Ao Vivo (Posse, Chutes, Escanteios)'}</span>
            <span className={styles.toggleArrow}>{showStats ? '▲' : '▼'}</span>
          </button>
        </div>
      )}

      {/* Painel Expansível de Estatísticas Ao Vivo */}
      {showStats && match.stats && (
        <div className={styles.statsSection}>
          <MatchStats match={match} onClose={() => setShowStats(false)} />
        </div>
      )}

      {/* Mercados de Apostas: 1 X 2 ou Vencedor (1 / 2) */}
      <div
        className={styles.oddsGrid}
        style={!match.markets.winner.draw ? { gridTemplateColumns: '1fr 1fr' } : undefined}
      >
        {/* 1 - Casa / Jogador 1 */}
        <button
          className={`odd-btn ${isSelected(match.markets.winner.home.id) ? 'selected' : ''}`}
          onClick={() =>
            handleSelectOdd(
              match.markets.winner.home.id,
              match.markets.winner.home.label,
              match.markets.winner.home.odd,
              match.markets.winner.draw ? 'Resultado Final (1X2)' : 'Vencedor do Confronto'
            )
          }
        >
          <span className="odd-label">1 ({match.homeTeam.split(' ')[0]})</span>
          <span className="odd-value">{match.markets.winner.home.odd.toFixed(2)}</span>
        </button>

        {/* X - Empate (Apenas se o esporte tiver empate) */}
        {match.markets.winner.draw && (
          <button
            className={`odd-btn ${isSelected(match.markets.winner.draw.id) ? 'selected' : ''}`}
            onClick={() =>
              handleSelectOdd(
                match.markets.winner.draw!.id,
                'Empate',
                match.markets.winner.draw!.odd,
                'Resultado Final (1X2)'
              )
            }
          >
            <span className="odd-label">X (Empate)</span>
            <span className="odd-value">{match.markets.winner.draw.odd.toFixed(2)}</span>
          </button>
        )}

        {/* 2 - Fora / Jogador 2 */}
        <button
          className={`odd-btn ${isSelected(match.markets.winner.away.id) ? 'selected' : ''}`}
          onClick={() =>
            handleSelectOdd(
              match.markets.winner.away.id,
              match.markets.winner.away.label,
              match.markets.winner.away.odd,
              match.markets.winner.draw ? 'Resultado Final (1X2)' : 'Vencedor do Confronto'
            )
          }
        >
          <span className="odd-label">2 ({match.awayTeam.split(' ')[0]})</span>
          <span className="odd-value">{match.markets.winner.away.odd.toFixed(2)}</span>
        </button>
      </div>

      {/* Ações: Entrar no jogo com todas as odds & Criar Aposta */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <Link
          href={`/esportes/${match.id}?tab=criar-aposta`}
          className={styles.builderBtn}
          style={{ flex: 1, marginTop: 0 }}
          title="Criar aposta combinada personalizada para este jogo"
        >
          <span>⚡</span>
          <span>Criar Aposta</span>
        </Link>
        <Link
          href={`/esportes/${match.id}`}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            transition: 'all 0.2s',
          }}
          title="Entrar no jogo para ver todas as odds"
        >
          <span>+ Mais Opções ›</span>
        </Link>
      </div>
    </div>
  );
}
