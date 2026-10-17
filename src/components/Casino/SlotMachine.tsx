'use client';

import React, { useState } from 'react';
import { useBet } from '@/context/BetContext';
import styles from './SlotMachine.module.css';

const SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣'];

const PAYOUTS: { [key: string]: number } = {
  '7️⃣-7️⃣-7️⃣': 50,
  '💎-💎-💎': 30,
  '⭐-⭐-⭐': 20,
  '🔔-🔔-🔔': 15,
  '🍋-🍋-🍋': 10,
  '🍒-🍒-🍒': 8,
};

export default function SlotMachine() {
  const { saldo, recordCasinoBet } = useBet();
  const [reels, setReels] = useState<string[]>(['7️⃣', '💎', '7️⃣']);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<number>(0);

  const handleSpin = () => {
    if (spinning) return;
    if (betAmount > saldo) {
      setWinMessage('Saldo insuficiente! Deposite via PIX.');
      return;
    }
    if (betAmount <= 0) return;

    setSpinning(true);
    setWinMessage(null);
    setLastWin(0);

    // Efeito de giro
    let ticks = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        // Resultado final
        const finalReels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];

        // 25% de chance de vitória forçada para diversão no teste
        if (Math.random() < 0.28) {
          const luckySym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          finalReels[0] = luckySym;
          finalReels[1] = luckySym;
          finalReels[2] = luckySym;
        }

        setReels(finalReels);
        setSpinning(false);

        const key = `${finalReels[0]}-${finalReels[1]}-${finalReels[2]}`;
        let win = 0;

        if (PAYOUTS[key]) {
          win = betAmount * PAYOUTS[key];
          setWinMessage(`🎉 JACKPOT! 3x ${finalReels[0]} — Ganhou R$ ${win.toFixed(2)}!`);
        } else if (
          finalReels[0] === finalReels[1] ||
          finalReels[1] === finalReels[2] ||
          finalReels[0] === finalReels[2]
        ) {
          win = betAmount * 2;
          setWinMessage(`✨ Par de símbolos! Ganhou R$ ${win.toFixed(2)}!`);
        } else {
          setWinMessage(`Não foi dessa vez. Tente novamente!`);
        }

        setLastWin(win);
        recordCasinoBet('BetCerta Slots Fortuna', betAmount, win);
      }
    }, 80);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🎰 BetCerta Slots: Ouro dos Deuses</h2>
        <p className={styles.subtitle}>Combine 3 símbolos iguais para faturar até 50x a sua aposta!</p>
      </div>

      {/* Máquina de slots */}
      <div className={styles.machineBody}>
        <div className={styles.reelsFrame}>
          {reels.map((sym, i) => (
            <div key={i} className={`${styles.reel} ${spinning ? styles.spinning : ''}`}>
              <span className={styles.symbol}>{sym}</span>
            </div>
          ))}
        </div>

        {/* Mensagem de resultado */}
        {winMessage && (
          <div className={`${styles.message} ${lastWin > 0 ? styles.win : styles.loss}`}>
            {winMessage}
          </div>
        )}

        {/* Controles da aposta */}
        <div className={styles.controls}>
          <div className={styles.betSelector}>
            <span className={styles.label}>Aposta:</span>
            <div className={styles.betButtons}>
              {[5, 10, 25, 50, 100].map(val => (
                <button
                  key={val}
                  className={`${styles.betBtn} ${betAmount === val ? styles.betActive : ''}`}
                  onClick={() => setBetAmount(val)}
                  disabled={spinning}
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`btn-gold ${styles.spinBtn}`}
            id="btn-spin-slots"
          >
            {spinning ? 'GIRANDO...' : '⚡ GIRAR ROLETA'}
          </button>
        </div>

        {/* Tabela de pagamentos rápida */}
        <div className={styles.payouts}>
          <div className={styles.payoutItem}>7️⃣ 7️⃣ 7️⃣ = <strong>50x</strong></div>
          <div className={styles.payoutItem}>💎 💎 💎 = <strong>30x</strong></div>
          <div className={styles.payoutItem}>⭐ ⭐ ⭐ = <strong>20x</strong></div>
          <div className={styles.payoutItem}>Par de símbolos = <strong>2x</strong></div>
        </div>
      </div>
    </div>
  );
}
