'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBet } from '@/context/BetContext';
import styles from './CrashGame.module.css';

export default function CrashGame() {
  const { saldo, recordCasinoBet } = useBet();
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed'>('idle');
  const [betAmount, setBetAmount] = useState(25);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState<number[]>([1.85, 3.40, 1.15, 7.20, 2.05, 1.42, 12.90]);

  const animationRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(2.0);

  const startRound = () => {
    if (gameState === 'flying') return;
    if (betAmount > saldo) {
      alert('Saldo insuficiente! Deposite via PIX.');
      return;
    }

    // Gerar ponto de queda aleatório (entre 1.10x e 15.00x)
    const rand = Math.random();
    let crashPoint = 1.05;
    if (rand < 0.10) {
      crashPoint = parseFloat((1.05 + Math.random() * 0.25).toFixed(2)); // queda rápida
    } else if (rand < 0.60) {
      crashPoint = parseFloat((1.30 + Math.random() * 2.20).toFixed(2)); // média
    } else if (rand < 0.90) {
      crashPoint = parseFloat((3.50 + Math.random() * 4.50).toFixed(2)); // alta
    } else {
      crashPoint = parseFloat((8.00 + Math.random() * 14.00).toFixed(2)); // vela alta!
    }
    crashPointRef.current = crashPoint;

    setMultiplier(1.00);
    setGameState('flying');
    setHasCashedOut(false);
    setWinAmount(0);

    const startTime = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Multiplicador sobe em curva exponencial suave
      const currentMult = parseFloat((1 + Math.pow(elapsed * 0.65, 1.5)).toFixed(2));

      if (currentMult >= crashPointRef.current) {
        // Explodiu!
        setMultiplier(crashPointRef.current);
        setGameState('crashed');
        setHistory(prev => [crashPointRef.current, ...prev.slice(0, 9)]);

        // Se o jogador não sacou a tempo, perdeu a aposta
        setHasCashedOut(cashed => {
          if (!cashed) {
            recordCasinoBet('BetCerta Aviator / Crash', betAmount, 0);
          }
          return cashed;
        });
      } else {
        setMultiplier(currentMult);
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  };

  const cashOut = () => {
    if (gameState !== 'flying' || hasCashedOut) return;

    const win = parseFloat((betAmount * multiplier).toFixed(2));
    setHasCashedOut(true);
    setWinAmount(win);
    recordCasinoBet('BetCerta Aviator / Crash', betAmount, win);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>🚀 BetCerta Aviator Crash</h2>
          <span className="badge-live">AO VIVO</span>
        </div>
        <p className={styles.subtitle}>
          O foguete sobe e multiplica sua aposta. Faça o Cash Out antes que ele exploda!
        </p>

        {/* Histórico recente de velas */}
        <div className={styles.historyRow}>
          <span className={styles.histLabel}>Anteriores:</span>
          {history.map((h, i) => (
            <span
              key={i}
              className={`${styles.histBadge} ${
                h >= 2 ? styles.histHigh : styles.histLow
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Tela do gráfico do Crash */}
      <div className={styles.displayArea}>
        <div className={styles.graphCanvas}>
          {gameState === 'flying' && (
            <div className={styles.flyingRocket}>
              <span className={styles.rocketIcon}>🚀</span>
              <div className={styles.flame}></div>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className={styles.explosion}>
              💥 <span>EXPLODIU EM {multiplier.toFixed(2)}x!</span>
            </div>
          )}

          <div
            className={`${styles.bigMultiplier} ${
              gameState === 'crashed' ? styles.crashedText : ''
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>

          {hasCashedOut && (
            <div className={styles.cashOutBanner}>
              🎉 VOCÊ SACOU R$ {winAmount.toFixed(2)} ({multiplier.toFixed(2)}x)!
            </div>
          )}
        </div>
      </div>

      {/* Controles de Aposta e Cash Out */}
      <div className={styles.controlsRow}>
        <div className={styles.betGroup}>
          <span className={styles.label}>Valor da Aposta (R$):</span>
          <div className={styles.chips}>
            {[10, 25, 50, 100, 200].map(val => (
              <button
                key={val}
                className={`${styles.chip} ${betAmount === val ? styles.chipActive : ''}`}
                onClick={() => setBetAmount(val)}
                disabled={gameState === 'flying'}
              >
                R$ {val}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actionCol}>
          {gameState !== 'flying' ? (
            <button
              className={`btn-gold ${styles.actionBtn}`}
              onClick={startRound}
              id="btn-start-crash"
            >
              DECOLAR FOGUETE (R$ {betAmount})
            </button>
          ) : (
            <button
              className={`btn-primary ${styles.actionBtn} ${styles.cashOutBtn}`}
              onClick={cashOut}
              disabled={hasCashedOut}
              id="btn-cashout-crash"
            >
              {hasCashedOut
                ? 'LUCRO GARANTIDO!'
                : `SACAR R$ ${(betAmount * multiplier).toFixed(2)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
