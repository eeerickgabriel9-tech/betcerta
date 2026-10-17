'use client';

import React, { useState, useMemo } from 'react';
import { Match } from '@/data/mockMatches';
import { useBet } from '@/context/BetContext';
import { getExpandedMarkets, calculateBuilderOdds, MarketOptionItem } from '@/lib/matchMarkets';
import TeamBadge from '@/components/TeamBadge/TeamBadge';
import styles from './BetBuilderModal.module.css';

interface BetBuilderModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BetBuilderModal({ match, isOpen, onClose }: BetBuilderModalProps) {
  const { addSelection, isSlipOpen, toggleSlip } = useBet();
  const [selectedItems, setSelectedItems] = useState<MarketOptionItem[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('todos');

  const expandedMarkets = useMemo(() => {
    if (!match) return null;
    return getExpandedMarkets(match);
  }, [match]);

  const combinedOdd = useMemo(() => {
    return calculateBuilderOdds(selectedItems);
  }, [selectedItems]);

  if (!isOpen || !match || !expandedMarkets) return null;

  const handleToggleOption = (item: MarketOptionItem) => {
    setSelectedItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        // Deselecionar
        return prev.filter(i => i.id !== item.id);
      } else {
        // Substituir opção na mesma categoria mutuamente exclusiva (ex: vencedor, dupla chance, btts)
        const mutuallyExclusive = ['winner', 'doubleChance', 'btts', 'firstHalf'];
        let updated = prev;
        if (mutuallyExclusive.includes(item.category)) {
          updated = prev.filter(i => i.category !== item.category);
        }
        return [...updated, item];
      }
    });
  };

  const handleRemoveChip = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddBuilderBet = () => {
    if (selectedItems.length < 2) return;

    addSelection({
      id: `builder-${match.id}-${Date.now()}`,
      matchId: match.id,
      matchTitle: `${match.homeTeam} vs ${match.awayTeam}`,
      sport: match.sport,
      marketName: '⚡ Criar Aposta (Betano Builder)',
      selection: `Criar Aposta (${selectedItems.length} seleções)`,
      odd: combinedOdd,
      isBetBuilder: true,
      builderSelections: selectedItems.map(i => ({
        marketName: i.categoryLabel,
        selection: i.label,
        odd: i.odd,
      })),
    });

    if (!isSlipOpen) {
      toggleSlip();
    }

    onClose();
    setSelectedItems([]);
  };

  const isSelected = (id: string) => selectedItems.some(i => i.id === id);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.betanoTag}>⚡ Criar Aposta • Betano</span>
            <h2 className={styles.title}>
              <TeamBadge teamName={match.homeTeam} size={22} />
              <span>{match.homeTeam}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>x</span>
              <TeamBadge teamName={match.awayTeam} size={22} />
              <span>{match.awayTeam}</span>
            </h2>
            <span className={styles.subtitle}>{match.league} • {match.date}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Fechar Criar Aposta">
            ✕
          </button>
        </div>

        {/* Banner Informativo */}
        <div className={styles.infoBanner}>
          <span>💡</span>
          <span>
            Combine 2 ou mais opções deste confronto para montar sua aposta personalizada com super cotação!
          </span>
        </div>

        {/* Filtro Rápido de Categorias */}
        <div className={styles.categoryFilterRow}>
          {[
            { id: 'todos', label: 'Todos os Mercados' },
            { id: 'principais', label: 'Principais (1X2 & Dupla Chance)' },
            { id: 'gols', label: 'Gols & Totais' },
            { id: 'estatisticas', label: 'Escanteios & Cartões' },
            { id: 'jogadores', label: 'Marcadores de Gol' },
            { id: 'placar', label: 'Placar Exato' },
          ].map(cat => (
            <button
              key={cat.id}
              className={`${styles.catBtn} ${activeCategoryFilter === cat.id ? styles.catBtnActive : ''}`}
              onClick={() => setActiveCategoryFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Corpo com Mercados */}
        <div className={styles.body}>
          {/* 1. Resultado Final */}
          {(activeCategoryFilter === 'todos' || activeCategoryFilter === 'principais') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🏆 Resultado Final</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.winner.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Ambos os Times Marcam */}
          {expandedMarkets.btts && (activeCategoryFilter === 'todos' || activeCategoryFilter === 'principais' || activeCategoryFilter === 'gols') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>⚽ Ambos os Times Marcam</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.btts.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Dupla Chance */}
          {expandedMarkets.doubleChance && (activeCategoryFilter === 'todos' || activeCategoryFilter === 'principais') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🛡️ Dupla Chance</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.doubleChance.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Total de Gols / Pontos */}
          {(activeCategoryFilter === 'todos' || activeCategoryFilter === 'gols') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🥅 Linhas de Totais</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.totals.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Escanteios */}
          {expandedMarkets.corners && (activeCategoryFilter === 'todos' || activeCategoryFilter === 'estatisticas') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🚩 Total de Escanteios</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.corners.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Cartões */}
          {expandedMarkets.cards && (activeCategoryFilter === 'todos' || activeCategoryFilter === 'estatisticas') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🟨 Total de Cartões</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.cards.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. Marcadores de Gol / Jogadores */}
          {expandedMarkets.players && (activeCategoryFilter === 'todos' || activeCategoryFilter === 'jogadores') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>👟 Jogadores em Destaque</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.players.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. Placar Exato */}
          {expandedMarkets.exactScores && (activeCategoryFilter === 'todos' || activeCategoryFilter === 'placar') && (
            <div className={styles.marketSection}>
              <div className={styles.marketHeader}>
                <span className={styles.marketTitle}>🎯 Placar Exato</span>
              </div>
              <div className={styles.optionsGrid}>
                {expandedMarkets.exactScores.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.optionBtn} ${isSelected(item.id) ? styles.optionSelected : ''}`}
                    onClick={() => handleToggleOption(item)}
                  >
                    <span className={styles.optionLabel}>
                      {isSelected(item.id) && <span className={styles.checkMark}>✓</span>}
                      {item.label}
                    </span>
                    <span className={styles.optionOdd}>{item.odd.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Flutuante Betano */}
        <div className={styles.footer}>
          {selectedItems.length > 0 && (
            <div className={styles.chipsContainer}>
              {selectedItems.map(item => (
                <span key={item.id} className={styles.selectionChip}>
                  <span>{item.label}</span>
                  <span className={styles.chipOdd}>({item.odd.toFixed(2)})</span>
                  <button
                    className={styles.chipRemove}
                    onClick={() => handleRemoveChip(item.id)}
                    title="Remover seleção"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className={styles.summaryRow}>
            <div className={styles.oddsBox}>
              <span className={styles.oddsLabel}>
                {selectedItems.length} {selectedItems.length === 1 ? 'Seleção' : 'Seleções Combinadas'}
              </span>
              <span className={styles.oddsValue}>Odd: {combinedOdd.toFixed(2)}</span>
            </div>

            <button
              className={styles.actionBtn}
              disabled={selectedItems.length < 2}
              onClick={handleAddBuilderBet}
            >
              <span>⚡</span>
              <span>
                {selectedItems.length < 2
                  ? 'Selecione 2+ Opções'
                  : `Adicionar ao Bilhete (${combinedOdd.toFixed(2)})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
