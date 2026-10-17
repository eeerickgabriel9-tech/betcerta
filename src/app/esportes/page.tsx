'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SidebarSports from '@/components/SidebarSports/SidebarSports';
import Betslip from '@/components/Betslip/Betslip';
import MatchCard from '@/components/MatchCard/MatchCard';
import { useBet } from '@/context/BetContext';
import styles from './esportes.module.css';

import PrematchTable from '@/components/PrematchTable/PrematchTable';

function EsportesContent() {
  const { matches } = useBet();
  const searchParams = useSearchParams();

  const [selectedSport, setSelectedSport] = useState<string>('todos');
  const [selectedLeague, setSelectedLeague] = useState<string>('todas');
  const [activeTab, setActiveTab] = useState<'todos' | 'hoje' | 'rodada'>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); // 1Win Table como padrão
  const [searchQuery, setSearchQuery] = useState('');

  // Sincronizar com parâmetros da URL (Navbar e Sidebar)
  useEffect(() => {
    const leagueParam = searchParams.get('league');
    const sportParam = searchParams.get('sport');

    if (leagueParam) {
      setSelectedLeague(leagueParam);
      setSelectedSport('todos');
    } else if (sportParam) {
      setSelectedSport(sportParam);
      setSelectedLeague('todas');
    } else {
      setSelectedLeague('todas');
      setSelectedSport('todos');
    }
  }, [searchParams]);

  const handleSelectSport = (sportId: string) => {
    setSelectedSport(sportId);
    setSelectedLeague('todas');
  };

  const handleSelectTab = (tab: 'todos' | 'hoje' | 'rodada') => {
    setActiveTab(tab);
  };

  // Filtragem dos jogos para visualização em cards
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (m.date && m.date.toLowerCase().includes('encerrado')) return false;
      // REGRA 1: Filtro de status
      if (activeTab === 'hoje' && !m.date.toLowerCase().includes('hoje')) return false;
      if (activeTab === 'rodada' && m.date.toLowerCase().includes('hoje')) return false;

      // REGRA 2: Se selecionar uma liga específica
      if (selectedLeague !== 'todas') {
        if (m.leagueKey !== selectedLeague && !m.league.toLowerCase().includes(selectedLeague.toLowerCase())) {
          return false;
        }
      }
      // REGRA 3: Se selecionar esporte
      else if (selectedSport !== 'todos') {
        if (m.sport !== selectedSport) return false;
      }

      // Filtro de busca de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTeam =
          m.homeTeam.toLowerCase().includes(query) ||
          m.awayTeam.toLowerCase().includes(query) ||
          m.league.toLowerCase().includes(query);
        if (!matchesTeam) return false;
      }

      return true;
    });
  }, [matches, selectedSport, selectedLeague, activeTab, searchQuery]);

  const countHoje = matches.filter(m => m.date.toLowerCase().includes('hoje')).length;

  return (
    <div className={styles.layout}>
      <SidebarSports />

      <main className={styles.main}>
        {/* Cabeçalho da página de esportes */}
        <div className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ background: 'var(--blue-1win)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                FUTEBOL OFICIAL
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                Apostas Pré-Jogo com Super Odds
              </span>
            </div>
            <h1 className={styles.title}>
              {selectedLeague !== 'todas'
                ? `${matches.find(m => m.leagueKey === selectedLeague)?.leagueIcon || '🏆'} ${matches.find(m => m.leagueKey === selectedLeague)?.league || selectedLeague}`
                : 'Central de Apostas em Futebol (Prematch Oficial)'}
            </h1>
            <p className={styles.sub}>
              Consulte os confrontos confirmados das maiores ligas do Brasil e do mundo com cotações pré-jogo e novos mercados de 1º Tempo e Handicap.
            </p>
          </div>

          {/* Campo de Busca & Alternador de Modo de Visualização */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Buscar time, atleta ou torneio..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Alternador 1Win Table vs Cards */}
            <div style={{ display: 'flex', background: '#121929', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--blue-1win)' : 'transparent',
                  color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                📊 Tabela 1Win
              </button>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  background: viewMode === 'cards' ? 'var(--blue-1win)' : 'transparent',
                  color: viewMode === 'cards' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                🃏 Cards
              </button>
            </div>
          </div>
        </div>

        {/* Abas de status: Todos / Jogos de Hoje / Rodada Completa */}
        <div className={styles.statusTabs}>
          <button
            className={`${styles.statusTab} ${activeTab === 'todos' ? styles.statusActive : ''}`}
            onClick={() => handleSelectTab('todos')}
          >
            ⚽ Todos os Confrontos ({matches.length})
          </button>
          <button
            className={`${styles.statusTab} ${activeTab === 'hoje' ? styles.statusActive : ''}`}
            onClick={() => handleSelectTab('hoje')}
          >
            ⏰ Jogos de Hoje ({countHoje})
          </button>
          <button
            className={`${styles.statusTab} ${activeTab === 'rodada' ? styles.statusActive : ''}`}
            onClick={() => handleSelectTab('rodada')}
          >
            📅 Rodada & Fim de Semana
          </button>
        </div>

        {/* RENDERIZAÇÃO DO CONTEÚDO */}
        {viewMode === 'table' ? (
          /* Visualização Tabela Prematch 1Win */
          <PrematchTable initialSport={selectedSport} initialLeague={selectedLeague} />
        ) : (
          /* Visualização em Cards Tradicionais */
          <div className={styles.matchesList}>
            {filteredMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function EsportesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#fff' }}>Carregando Esportes...</div>}>
      <EsportesContent />
    </Suspense>
  );
}
