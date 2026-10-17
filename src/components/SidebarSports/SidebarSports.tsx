'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useBet } from '@/context/BetContext';
import styles from './SidebarSports.module.css';

const TOP_20_FOOTBALL_LEAGUES = [
  { id: 'brasileirao', name: 'Brasileirão Série A', icon: '🇧🇷' },
  { id: 'premier-league', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'la-liga', name: 'La Liga (Espanha)', icon: '🇪🇸' },
  { id: 'champions-league', name: 'UEFA Champions League', icon: '🏆' },
  { id: 'serie-a', name: 'Serie A Italiana', icon: '🇮🇹' },
  { id: 'bundesliga', name: 'Bundesliga', icon: '🇩🇪' },
  { id: 'ligue-1', name: 'Ligue 1 (França)', icon: '🇫🇷' },
  { id: 'libertadores', name: 'Copa Libertadores', icon: '🌎' },
  { id: 'sul-americana', name: 'Copa Sul-Americana', icon: '🌎' },
  { id: 'copa-do-brasil', name: 'Copa do Brasil', icon: '🇧🇷' },
  { id: 'serie-b', name: 'Brasileirão Série B', icon: '🇧🇷' },
  { id: 'liga-portugal', name: 'Liga Portugal', icon: '🇵🇹' },
  { id: 'eredivisie', name: 'Eredivisie Holandesa', icon: '🇳🇱' },
  { id: 'saudi-pro-league', name: 'Saudi Pro League', icon: '🇸🇦' },
  { id: 'mls', name: 'Major League Soccer', icon: '🇺🇸' },
  { id: 'championship', name: 'EFL Championship', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'super-lig', name: 'Süper Lig Turca', icon: '🇹🇷' },
  { id: 'liga-argentina', name: 'Liga Argentina', icon: '🇦🇷' },
  { id: 'liga-mx', name: 'Liga MX México', icon: '🇲🇽' },
  { id: 'europa-league', name: 'UEFA Europa League', icon: '🇪🇺' },
];

const OTHER_COMPETITIONS = [
  { id: 'nba', name: 'NBA (Basquete 1 Sem.)', icon: '🏀', sport: 'basquete' },
  { id: 'euroleague', name: 'EuroLeague Basquete', icon: '🏀', sport: 'basquete' },
  { id: 'nbb', name: 'NBB CAIXA Brasil', icon: '🏀', sport: 'basquete' },
  { id: 'nfl', name: 'NFL (Futebol Amer. 1 Sem.)', icon: '🏈', sport: 'futebol-americano' },
  { id: 'esports', name: 'LoL Worlds & CS2', icon: '🎮', sport: 'esports' },
];

function SidebarSportsContent() {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get('sport') || 'todos';
  const currentLeague = searchParams.get('league') || '';
  const { matches } = useBet();
  const [showAllLeagues, setShowAllLeagues] = useState(false);

  const liveCount = matches.filter(m => m.isLive).length;
  const footballUpcomingCount = matches.filter(m => m.sport === 'futebol' && !m.isLive).length;
  const basketballCount = matches.filter(m => m.sport === 'basquete' && !m.isLive).length;
  const nflCount = matches.filter(m => m.sport === 'futebol-americano' && !m.isLive).length;
  const esportsCount = matches.filter(m => m.sport === 'esports' && !m.isLive).length;

  const allSports = [
    { id: 'futebol', name: 'Futebol (20 Ligas)', icon: '⚽', count: footballUpcomingCount },
    { id: 'basquete', name: 'Basquete (1 Semana)', icon: '🏀', count: basketballCount },
    { id: 'futebol-americano', name: 'Futebol Amer. (NFL)', icon: '🏈', count: nflCount },
    { id: 'esports', name: 'eSports (Worlds/CS2)', icon: '🎮', count: esportsCount },
  ];

  const displayedLeagues = showAllLeagues ? TOP_20_FOOTBALL_LEAGUES : TOP_20_FOOTBALL_LEAGUES.slice(0, 8);

  return (
    <aside className={styles.sidebar}>
      {/* Seção Modalidades Esportivas */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>Modalidades Oficiais</div>
        <div className={styles.itemsList}>
          {/* Lista de Esportes com Contagens Dinâmicas */}
          {allSports.map(sp => {
            const isActive = currentSport === sp.id && searchParams.get('tab') !== 'ao-vivo';
            return (
              <Link
                key={sp.id}
                href={`/esportes?sport=${sp.id}`}
                className={`${styles.item} ${isActive ? styles.activeItem : ''}`}
              >
                <span className={styles.icon}>{sp.icon}</span>
                <span className={styles.name}>{sp.name}</span>
                <span className={styles.count}>{sp.count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 20 Principais Ligas de Futebol Mais Apostadas */}
      <div className={styles.group}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
          <div className={styles.groupTitle} style={{ padding: 0 }}>🏆 20 Principais Ligas</div>
          <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 800 }}>1 Semana</span>
        </div>

        <div className={styles.itemsList}>
          {displayedLeagues.map(league => {
            const count = matches.filter(m => m.leagueKey === league.id).length;
            const isActive = currentLeague === league.id;

            return (
              <Link
                key={league.id}
                href={`/esportes?league=${league.id}`}
                className={`${styles.item} ${isActive ? styles.activeItem : ''}`}
                title={`Ver jogos da ${league.name} para a semana`}
              >
                <span className={styles.icon}>{league.icon}</span>
                <span className={styles.name}>{league.name}</span>
                <span className={styles.count}>{count}</span>
              </Link>
            );
          })}

          {/* Botão Expandir / Recolher as 20 Ligas */}
          <button
            onClick={() => setShowAllLeagues(!showAllLeagues)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.45rem',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '0.25rem',
              transition: 'all 0.2s',
            }}
          >
            {showAllLeagues ? '▲ Recolher Ligas' : `+ Ver Todas as 20 Ligas (${TOP_20_FOOTBALL_LEAGUES.length})`}
          </button>
        </div>
      </div>

      {/* Outras Grandes Competições (Basquete, Tênis, NFL) */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>Grandes Torneios Mundiais</div>
        <div className={styles.itemsList}>
          {OTHER_COMPETITIONS.map(comp => {
            const count = matches.filter(m => m.leagueKey === comp.id || (comp.id === 'esports' && m.sport === 'esports')).length;
            const isActive = currentLeague === comp.id;

            return (
              <Link
                key={comp.id}
                href={`/esportes?league=${comp.id}`}
                className={`${styles.item} ${isActive ? styles.activeItem : ''}`}
              >
                <span className={styles.icon}>{comp.icon}</span>
                <span className={styles.name}>{comp.name}</span>
                <span className={styles.count}>{count}</span>
              </Link>
            );
          })}
        </div>
      </div>


      {/* Card de Depósito Instantâneo PIX */}
      <div className={styles.promoBox}>
        <div className={styles.promoTag} style={{ background: '#10b981', color: '#fff' }}>PIX 24/7</div>
        <div className={styles.promoTitle}>Depósitos e Saques Rápidos</div>
        <div className={styles.promoDesc}>Crédito automático em segundos na sua conta via PIX seguro.</div>
        <Link href="/carteira" className="btn-gold" style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem' }}>
          ⚡ Depositar via PIX
        </Link>
      </div>
    </aside>
  );
}

export default function SidebarSports() {
  return (
    <React.Suspense fallback={<aside className={styles.sidebar}></aside>}>
      <SidebarSportsContent />
    </React.Suspense>
  );
}
