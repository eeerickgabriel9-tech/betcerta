'use client';

import React from 'react';
import Link from 'next/link';
import { useBet } from '@/context/BetContext';
import { MOCK_MATCHES } from '@/data/mockMatches';
import SidebarSports from '@/components/SidebarSports/SidebarSports';
import Betslip from '@/components/Betslip/Betslip';
import MatchCard from '@/components/MatchCard/MatchCard';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import styles from './page.module.css';

export default function Home() {
  const { betslip, addSelection, matches, user, bonus } = useBet();

  const upcomingMatches = matches.filter(
    m => !m.isLive && (!m.date || (!m.date.toLowerCase().includes('encerrado') && !m.date.toLowerCase().includes('ao vivo')))
  );
  const heroMatch = upcomingMatches[0] || matches[0];

  const isSelected = (oddId: string) => betslip.some(item => item.id === oddId);

  const handleHeroBet = (oddId: string, label: string, odd: number) => {
    if (!heroMatch) return;
    addSelection({
      id: oddId,
      matchId: heroMatch.id,
      matchTitle: `${heroMatch.homeTeam} vs ${heroMatch.awayTeam}`,
      sport: heroMatch.sport,
      marketName: 'Resultado Final (1X2)',
      selection: label,
      odd,
    });
  };

  if (!heroMatch) return null;

  return (
    <div className={styles.layout}>
      {/* Barra lateral esquerda: Categorias e Ligas */}
      <SidebarSports />

      {/* Conteúdo Central Principal */}
      <main className={styles.mainContent}>
        {/* BANNER DE BOAS-VINDAS: APOSTA GRÁTIS DE R$ 20 (ALTA CONVERSÃO) */}
        {!user.isLogged ? (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(16, 185, 129, 0.22))',
              border: '1px solid rgba(245, 158, 11, 0.6)',
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2.2rem' }}>🎁</span>
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '1.05rem', letterSpacing: '0.02em', display: 'block' }}>
                  CADASTRE-SE E GANHE R$ 20 EM APOSTA GRÁTIS!
                </strong>
                <span style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>
                  Sem depósito obrigatório: crie sua conta em 15 segundos e palpite no futebol, basquete e NFL!
                </span>
              </div>
            </div>
            <Link
              href="/cadastro"
              className="btn-gold"
              style={{
                padding: '0.7rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              QUERO MEUS R$ 20 GRÁTIS →
            </Link>
          </div>
        ) : bonus > 0 ? (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 115, 245, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '12px',
              padding: '0.75rem 1.2rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🎟️</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.88rem' }}>
                Você tem <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>R$ {bonus.toFixed(2)}</strong> em Aposta Grátis ativa! Escolha um confronto e ative no bilhete.
              </span>
            </div>
            <Link href="/esportes" className="btn-1win-green" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
              Apostar Grátis
            </Link>
          </div>
        ) : null}

        {/* HERO BANNER: Jogo Destaque */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroBadgeRow}>
              <span className={styles.heroDateTag}>🔥 GRANDE CLÁSSICO OFICIAL • {heroMatch.date}</span>
              <span className={styles.heroLeague}>🏆 {heroMatch.league}</span>
            </div>

            <div className={styles.heroMatchup}>
              <div className={styles.heroTeam}>
                <TeamBadge teamName={heroMatch.homeTeam} size={52} />
                <span className={styles.heroTeamName}>{heroMatch.homeTeam}</span>
              </div>

              <div className={styles.heroTimeBox}>
                <span className={styles.heroTimeText}>{heroMatch.date.includes(',') ? heroMatch.date.split(',')[1].trim() : 'OFICIAL'}</span>
                <span className={styles.heroTimeVs}>VS</span>
              </div>

              <div className={styles.heroTeam}>
                <span className={styles.heroTeamName}>{heroMatch.awayTeam}</span>
                <TeamBadge teamName={heroMatch.awayTeam} size={52} />
              </div>
            </div>

            <p className={styles.heroTagline}>
              {`CONFRONTO CONFIRMADO • SUPER ODDS BETCERTA • ${heroMatch.date}`}
            </p>

            {/* Odds do jogo destaque */}
            <div className={styles.heroOdds}>
              <button
                className={`odd-btn ${isSelected(heroMatch.markets.winner.home.id) ? 'selected' : ''}`}
                onClick={() =>
                  handleHeroBet(
                    heroMatch.markets.winner.home.id,
                    heroMatch.markets.winner.home.label,
                    heroMatch.markets.winner.home.odd
                  )
                }
              >
                <span className="odd-label">1 ({heroMatch.homeTeam})</span>
                <span className="odd-value">{heroMatch.markets.winner.home.odd.toFixed(2)}</span>
              </button>

              {heroMatch.markets.winner.draw && (
                <button
                  className={`odd-btn ${isSelected(heroMatch.markets.winner.draw.id) ? 'selected' : ''}`}
                  onClick={() =>
                    handleHeroBet(
                      heroMatch.markets.winner.draw!.id,
                      'Empate',
                      heroMatch.markets.winner.draw!.odd
                    )
                  }
                >
                  <span className="odd-label">X (Empate)</span>
                  <span className="odd-value">{heroMatch.markets.winner.draw.odd.toFixed(2)}</span>
                </button>
              )}

              <button
                className={`odd-btn ${isSelected(heroMatch.markets.winner.away.id) ? 'selected' : ''}`}
                onClick={() =>
                  handleHeroBet(
                    heroMatch.markets.winner.away.id,
                    heroMatch.markets.winner.away.label,
                    heroMatch.markets.winner.away.odd
                  )
                }
              >
                <span className="odd-label">2 ({heroMatch.awayTeam})</span>
                <span className="odd-value">{heroMatch.markets.winner.away.odd.toFixed(2)}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Banner de Depósito PIX Instantâneo */}
        <section className={styles.bonusBanner}>
          <div className={styles.bonusContent}>
            <span className={styles.bonusBadge}>⚡ PIX INSTANTÂNEO</span>
            <h3 className={styles.bonusTitle}>Depósitos e Saques Imediatos via PIX!</h3>
            <p className={styles.bonusSub}>Aposte nos melhores jogos com saques diretos e rápidos na sua conta bancária.</p>
          </div>
          <Link href="/carteira" className="btn-gold" id="btn-claim-bonus">
            Depositar via PIX
          </Link>
        </section>

        {/* Atalhos Rápidos das Principais Ligas */}
        <section className={styles.quickNav}>
          <Link href="/esportes?sport=futebol" className={styles.quickCard}>
            <span className={styles.quickIcon}>⚽</span>
            <span className={styles.quickText}>Futebol ({matches.filter(m => m.sport === 'futebol').length})</span>
          </Link>
          <Link href="/esportes?sport=basquete" className={styles.quickCard}>
            <span className={styles.quickIcon}>🏀</span>
            <span className={styles.quickText}>NBA & Basquete ({matches.filter(m => m.sport === 'basquete').length})</span>
          </Link>
          <Link href="/esportes?sport=futebol-americano" className={styles.quickCard}>
            <span className={styles.quickIcon}>🏈</span>
            <span className={styles.quickText}>NFL Futebol Amer. ({matches.filter(m => m.sport === 'futebol-americano').length})</span>
          </Link>
          <Link href="/esportes?league=Brasileirão+Série+A" className={styles.quickCard}>
            <span className={styles.quickIcon}>🇧🇷</span>
            <span className={styles.quickText}>Brasileirão Série A</span>
          </Link>
          <Link href="/esportes?league=UEFA+Champions+League" className={styles.quickCard}>
            <span className={styles.quickIcon}>🏆</span>
            <span className={styles.quickText}>Champions League</span>
          </Link>
          <Link href="/esportes?league=Premier+League" className={styles.quickCard}>
            <span className={styles.quickIcon}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
            <span className={styles.quickText}>Premier League</span>
          </Link>
        </section>



        {/* Próximas Partidas */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <h2 className="section-title">Próximos Grandes Confrontos</h2>
            <Link href="/esportes" className={styles.viewAll}>
              Calendário completo →
            </Link>
          </div>

          <div className={styles.matchesGrid}>
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
