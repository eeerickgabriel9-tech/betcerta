'use client';

import React, { useState } from 'react';
import { useBet } from '@/context/BetContext';
import styles from './RouletteGame.module.css';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export default function RouletteGame() {
  const { saldo, recordCasinoBet } = useBet();
  const [selectedBet, setSelectedBet] = useState<'red' | 'black' | 'even' | 'odd' | 'zero'>('red');
  const [stake, setStake] = useState<number>(20);
  const [spinning, setSpinning] = useState(false);
  const [lastNumber, setLastNumber] = useState<number | null>(7);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const spinRoulette = () => {
    if (spinning) return;
    if (stake > saldo) {
      alert('Saldo insuficiente! Deposite via PIX.');
      return;
    }

    setSpinning(true);
    setResultMsg(null);

    // Girar a roleta com rotação acumulada
    const extraRotations = 1440 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extraRotations;
    setRotation(newRotation);

    setTimeout(() => {
      // Sortear número entre 0 e 36
      const winningNumber = Math.floor(Math.random() * 37);
      setLastNumber(winningNumber);
      setSpinning(false);

      const isRed = RED_NUMBERS.includes(winningNumber);
      const isBlack = winningNumber !== 0 && !isRed;
      const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
      const isOdd = winningNumber % 2 !== 0;

      let won = false;
      let multiplier = 0;

      if (selectedBet === 'red' && isRed) {
        won = true;
        multiplier = 2;
      } else if (selectedBet === 'black' && isBlack) {
        won = true;
        multiplier = 2;
      } else if (selectedBet === 'even' && isEven) {
        won = true;
        multiplier = 2;
      } else if (selectedBet === 'odd' && isOdd) {
        won = true;
        multiplier = 2;
      } else if (selectedBet === 'zero' && winningNumber === 0) {
        won = true;
        multiplier = 36;
      }

      const winAmount = won ? stake * multiplier : 0;
      const colorText = winningNumber === 0 ? 'Verde (Zero)' : isRed ? 'Vermelho' : 'Preto';

      if (won) {
        setResultMsg(`🎉 VITÓRIA! Saiu ${winningNumber} (${colorText}). Você ganhou R$ ${winAmount.toFixed(2)}!`);
      } else {
        setResultMsg(`Saiu ${winningNumber} (${colorText}). Não foi dessa vez!`);
      }

      recordCasinoBet('BetCerta Roleta Europeia', stake, winAmount);
    }, 2800);
  };

  const isRed = lastNumber !== null && RED_NUMBERS.includes(lastNumber);
  const isZero = lastNumber === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🎡 Roleta Europeia BetCerta</h2>
        <p className={styles.subtitle}>Escolha sua aposta na mesa e gire a roleta da sorte!</p>
      </div>

      {/* Roda da Roleta */}
      <div className={styles.wheelWrapper}>
        <div
          className={styles.wheel}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 2.8s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none',
          }}
        >
          <div className={styles.wheelInner}>
            <div className={styles.wheelCenter}>
              {spinning ? (
                <span className={styles.spinningText}>GIRANDO...</span>
              ) : (
                <div
                  className={`${styles.numberBadge} ${
                    isZero ? styles.zero : isRed ? styles.red : styles.black
                  }`}
                >
                  {lastNumber !== null ? lastNumber : '0'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de resultado */}
      {resultMsg && (
        <div className={`${styles.message} ${resultMsg.includes('VITÓRIA') ? styles.win : styles.loss}`}>
          {resultMsg}
        </div>
      )}

      {/* Mesa de Apostas */}
      <div className={styles.table}>
        <div className={styles.tableLabel}>Selecione seu palpite:</div>
        <div className={styles.optionsGrid}>
          <button
            className={`${styles.tableBtn} ${styles.btnRed} ${selectedBet === 'red' ? styles.selected : ''}`}
            onClick={() => setSelectedBet('red')}
          >
            VERMELHO (2x)
          </button>
          <button
            className={`${styles.tableBtn} ${styles.btnBlack} ${selectedBet === 'black' ? styles.selected : ''}`}
            onClick={() => setSelectedBet('black')}
          >
            PRETO (2x)
          </button>
          <button
            className={`${styles.tableBtn} ${styles.btnGreen} ${selectedBet === 'zero' ? styles.selected : ''}`}
            onClick={() => setSelectedBet('zero')}
          >
            ZERO (36x)
          </button>
          <button
            className={`${styles.tableBtn} ${selectedBet === 'even' ? styles.selected : ''}`}
            onClick={() => setSelectedBet('even')}
          >
            PAR (2x)
          </button>
          <button
            className={`${styles.tableBtn} ${selectedBet === 'odd' ? styles.selected : ''}`}
            onClick={() => setSelectedBet('odd')}
          >
            ÍMPAR (2x)
          </button>
        </div>
      </div>

      {/* Seletor de Ficha e Botão de Girar */}
      <div className={styles.controls}>
        <div className={styles.chipsRow}>
          <span className={styles.chipsLabel}>Valor da Ficha:</span>
          {[10, 20, 50, 100, 250].map(val => (
            <button
              key={val}
              className={`${styles.chip} ${stake === val ? styles.chipActive : ''}`}
              onClick={() => setStake(val)}
              disabled={spinning}
            >
              R$ {val}
            </button>
          ))}
        </div>

        <button
          onClick={spinRoulette}
          disabled={spinning}
          className={`btn-gold ${styles.spinBtn}`}
          id="btn-spin-roulette"
        >
          {spinning ? 'GIRANDO A RODA...' : `GIRAR ROLETA (R$ ${stake})`}
        </button>
      </div>
    </div>
  );
}
