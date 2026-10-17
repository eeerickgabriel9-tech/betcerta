'use client';

import React, { useState } from 'react';
import { useBet } from '@/context/BetContext';
import styles from './MinesGame.module.css';

interface Tile {
  id: number;
  revealed: boolean;
  isMine: boolean;
}

export default function MinesGame() {
  const { saldo, recordCasinoBet } = useBet();
  const [mineCount, setMineCount] = useState<number>(3);
  const [stake, setStake] = useState<number>(20);
  const [inGame, setInGame] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState<Tile[]>([]);
  const [diamondsFound, setDiamondsFound] = useState(0);
  const [cashoutSuccess, setCashoutSuccess] = useState<number | null>(null);

  // Calcula multiplicador atual baseado em quantos diamantes encontrou
  const currentMultiplier = parseFloat(
    (1 + diamondsFound * (mineCount === 3 ? 0.22 : mineCount === 5 ? 0.38 : 0.85)).toFixed(2)
  );

  const startGame = () => {
    if (stake > saldo) {
      alert('Saldo insuficiente! Deposite via PIX.');
      return;
    }

    // Criar grid 5x5
    const totalTiles = 25;
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * totalTiles));
    }

    const newGrid: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
      id: i,
      revealed: false,
      isMine: mineIndices.has(i),
    }));

    setGrid(newGrid);
    setInGame(true);
    setGameOver(false);
    setDiamondsFound(0);
    setCashoutSuccess(null);
  };

  const clickTile = (index: number) => {
    if (!inGame || gameOver || grid[index].revealed) return;

    const tile = grid[index];
    const updatedGrid = [...grid];
    updatedGrid[index] = { ...tile, revealed: true };

    if (tile.isMine) {
      // Explodiu bomba!
      // Revela todas as bombas
      const allRevealed = updatedGrid.map(t => ({
        ...t,
        revealed: t.isMine ? true : t.revealed,
      }));
      setGrid(allRevealed);
      setGameOver(true);
      setInGame(false);
      recordCasinoBet('BetCerta Mines', stake, 0);
    } else {
      // Diamante!
      const newDiamonds = diamondsFound + 1;
      setDiamondsFound(newDiamonds);
      setGrid(updatedGrid);
    }
  };

  const cashOut = () => {
    if (!inGame || diamondsFound === 0) return;

    const winAmount = parseFloat((stake * currentMultiplier).toFixed(2));
    setCashoutSuccess(winAmount);
    setInGame(false);
    setGameOver(true);

    // Revela tudo
    setGrid(prev => prev.map(t => ({ ...t, revealed: true })));
    recordCasinoBet('BetCerta Mines', stake, winAmount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>💣 BetCerta Mines: Campo Minado</h2>
        <p className={styles.subtitle}>Encontre os diamantes e evite as bombas para multiplicar seu saldo!</p>
      </div>

      <div className={styles.gameLayout}>
        {/* Painel lateral de configurações */}
        <div className={styles.sidebar}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Número de Minas:</label>
            <div className={styles.minesButtons}>
              {[3, 5, 10].map(cnt => (
                <button
                  key={cnt}
                  className={`${styles.mineBtn} ${mineCount === cnt ? styles.mineActive : ''}`}
                  onClick={() => setMineCount(cnt)}
                  disabled={inGame}
                >
                  {cnt} Minas
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Valor da Aposta (R$):</label>
            <div className={styles.stakeChips}>
              {[10, 20, 50, 100].map(val => (
                <button
                  key={val}
                  className={`${styles.stakeChip} ${stake === val ? styles.stakeActive : ''}`}
                  onClick={() => setStake(val)}
                  disabled={inGame}
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          {inGame && (
            <div className={styles.statusBox}>
              <div className={styles.statusRow}>
                <span>Diamantes:</span>
                <strong style={{ color: 'var(--green-win)' }}>{diamondsFound} 💎</strong>
              </div>
              <div className={styles.statusRow}>
                <span>Multiplicador:</span>
                <strong style={{ color: 'var(--gold)' }}>{currentMultiplier.toFixed(2)}x</strong>
              </div>
              <div className={styles.statusRow}>
                <span>Valor de Saque:</span>
                <strong style={{ color: 'var(--green-win)', fontSize: '1.1rem' }}>
                  R$ {(stake * currentMultiplier).toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          {cashoutSuccess && (
            <div className={styles.winBanner}>
              🎉 SACADO: R$ {cashoutSuccess.toFixed(2)}!
            </div>
          )}

          {gameOver && !cashoutSuccess && (
            <div className={styles.lossBanner}>
              💥 BOMBA! Você perdeu R$ {stake.toFixed(2)}.
            </div>
          )}

          {!inGame ? (
            <button
              onClick={startGame}
              className={`btn-gold ${styles.actionBtn}`}
              id="btn-start-mines"
            >
              COMEÇAR JOGO (R$ {stake})
            </button>
          ) : (
            <button
              onClick={cashOut}
              disabled={diamondsFound === 0}
              className={`btn-primary ${styles.actionBtn} ${styles.cashOutBtn}`}
              id="btn-cashout-mines"
            >
              {diamondsFound === 0
                ? 'CLIQUE EM UM QUADRADO'
                : `SACAR R$ ${(stake * currentMultiplier).toFixed(2)}`}
            </button>
          )}
        </div>

        {/* Grade 5x5 */}
        <div className={styles.grid}>
          {grid.length === 0
            ? Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={styles.emptyTile}>
                  ?
                </div>
              ))
            : grid.map(tile => (
                <button
                  key={tile.id}
                  className={`${styles.tile} ${tile.revealed ? styles.tileRevealed : ''} ${
                    tile.revealed && tile.isMine ? styles.tileBomb : ''
                  } ${tile.revealed && !tile.isMine ? styles.tileDiamond : ''}`}
                  onClick={() => clickTile(tile.id)}
                  disabled={!inGame || tile.revealed}
                >
                  {tile.revealed ? (tile.isMine ? '💣' : '💎') : ''}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
