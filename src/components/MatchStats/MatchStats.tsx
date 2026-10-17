'use client';

import React from 'react';
import { Match } from '@/data/mockMatches';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import styles from './MatchStats.module.css';

interface MatchStatsProps {
  match: Match;
  onClose?: () => void;
}

export default function MatchStats({ match, onClose }: MatchStatsProps) {
  const stats = match.stats;

  if (!stats) {
    return (
      <div className={styles.noStats}>
        <p>Estatísticas ao vivo não disponíveis para esta partida no momento.</p>
      </div>
    );
  }

  const homePoss = stats.possession.home;
  const awayPoss = stats.possession.away;

  return (
    <div className={styles.container}>
      {/* Topo do painel com times e placar */}
      <div className={styles.header}>
        <div className={styles.teamHeaderCol}>
          <TeamBadge teamName={match.homeTeam} size={42} />
          <span className={styles.teamHeaderName}>{match.homeTeam}</span>
        </div>

        <div className={styles.scoreCol}>
          <span className="badge-live">AO VIVO • {match.liveTime}</span>
          <div className={styles.scoreRow}>
            <span>{match.homeScore ?? 0}</span>
            <span className={styles.scoreSep}>-</span>
            <span>{match.awayScore ?? 0}</span>
          </div>
          <span className={styles.leagueName}>{match.league}</span>
        </div>

        <div className={styles.teamHeaderCol}>
          <TeamBadge teamName={match.awayTeam} size={42} />
          <span className={styles.teamHeaderName}>{match.awayTeam}</span>
        </div>

        {onClose && (
          <button onClick={onClose} className={styles.closeBtn} title="Fechar estatísticas">
            ✕
          </button>
        )}
      </div>

      {/* CAMPO VIRTUAL 2D / MATCH TRACKER */}
      <div className={styles.pitchContainer}>
        <div className={styles.pitch}>
          <div className={styles.pitchLineMid}></div>
          <div className={styles.pitchCircleMid}></div>
          <div className={styles.pitchBoxLeft}></div>
          <div className={styles.pitchBoxRight}></div>

          {/* Indicador de ação e posse no campo */}
          <div className={styles.actionDot}>
            <span className={styles.ballIcon}>⚽</span>
            <span className={styles.pulseRing}></span>
          </div>

          <div className={styles.liveBanner}>
            ⚡ <strong>Ataque Perigoso:</strong> {match.homeTeam} avança pela ponta direita!
          </div>
        </div>
      </div>

      {/* LINHA DO TEMPO DOS GOLS */}
      {stats.timeline && stats.timeline.length > 0 && (
        <div className={styles.timelineBox}>
          <span className={styles.subTitle}>Principais Lances da Partida</span>
          <div className={styles.timelineList}>
            {stats.timeline.map((event, idx) => (
              <div
                key={idx}
                className={`${styles.timelineItem} ${
                  event.team === 'home' ? styles.itemHome : styles.itemAway
                }`}
              >
                <span className={styles.timelineMinute}>{event.minute}</span>
                <span className={styles.timelinePlayer}>{event.player}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPARATIVO DE ESTATÍSTICAS */}
      <div className={styles.statsList}>
        <span className={styles.subTitle}>Estatísticas em Tempo Real</span>

        {/* Posse de Bola */}
        <div className={styles.statBlock}>
          <div className={styles.statLabels}>
            <strong className={styles.statValHome}>{homePoss}%</strong>
            <span className={styles.statName}>Posse de Bola</span>
            <strong className={styles.statValAway}>{awayPoss}%</strong>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barHome} style={{ width: `${homePoss}%` }}></div>
            <div className={styles.barAway} style={{ width: `${awayPoss}%` }}></div>
          </div>
        </div>

        {/* Chutes no Alvo */}
        <div className={styles.statBlock}>
          <div className={styles.statLabels}>
            <strong className={styles.statValHome}>{stats.shotsOnTarget.home}</strong>
            <span className={styles.statName}>Finalizações no Gol</span>
            <strong className={styles.statValAway}>{stats.shotsOnTarget.away}</strong>
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barHome}
              style={{
                width: `${
                  (stats.shotsOnTarget.home /
                    (stats.shotsOnTarget.home + stats.shotsOnTarget.away || 1)) *
                  100
                }%`,
              }}
            ></div>
            <div
              className={styles.barAway}
              style={{
                width: `${
                  (stats.shotsOnTarget.away /
                    (stats.shotsOnTarget.home + stats.shotsOnTarget.away || 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total de Chutes */}
        <div className={styles.statBlock}>
          <div className={styles.statLabels}>
            <strong className={styles.statValHome}>{stats.totalShots.home}</strong>
            <span className={styles.statName}>Chutes Totais</span>
            <strong className={styles.statValAway}>{stats.totalShots.away}</strong>
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barHome}
              style={{
                width: `${
                  (stats.totalShots.home /
                    (stats.totalShots.home + stats.totalShots.away || 1)) *
                  100
                }%`,
              }}
            ></div>
            <div
              className={styles.barAway}
              style={{
                width: `${
                  (stats.totalShots.away /
                    (stats.totalShots.home + stats.totalShots.away || 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Escanteios */}
        <div className={styles.statBlock}>
          <div className={styles.statLabels}>
            <strong className={styles.statValHome}>{stats.corners.home}</strong>
            <span className={styles.statName}>Escanteios</span>
            <strong className={styles.statValAway}>{stats.corners.away}</strong>
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barHome}
              style={{
                width: `${
                  (stats.corners.home /
                    (stats.corners.home + stats.corners.away || 1)) *
                  100
                }%`,
              }}
            ></div>
            <div
              className={styles.barAway}
              style={{
                width: `${
                  (stats.corners.away /
                    (stats.corners.home + stats.corners.away || 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Ataques Perigosos */}
        <div className={styles.statBlock}>
          <div className={styles.statLabels}>
            <strong className={styles.statValHome}>{stats.dangerousAttacks.home}</strong>
            <span className={styles.statName}>Ataques Perigosos</span>
            <strong className={styles.statValAway}>{stats.dangerousAttacks.away}</strong>
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barHome}
              style={{
                width: `${
                  (stats.dangerousAttacks.home /
                    (stats.dangerousAttacks.home + stats.dangerousAttacks.away || 1)) *
                  100
                }%`,
              }}
            ></div>
            <div
              className={styles.barAway}
              style={{
                width: `${
                  (stats.dangerousAttacks.away /
                    (stats.dangerousAttacks.home + stats.dangerousAttacks.away || 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Cartões Amarelos */}
        <div className={styles.statBlock}>
          <div className={styles.statLabels}>
            <strong className={styles.statValHome}>{stats.yellowCards.home} 🟨</strong>
            <span className={styles.statName}>Cartões Amarelos</span>
            <strong className={styles.statValAway}>{stats.yellowCards.away} 🟨</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
