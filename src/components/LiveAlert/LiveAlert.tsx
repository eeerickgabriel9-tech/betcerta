'use client';

import React from 'react';
import { useBet } from '@/context/BetContext';
import styles from './LiveAlert.module.css';

export default function LiveAlert() {
  const { liveAlert, dismissAlert } = useBet();

  if (!liveAlert) return null;

  const isGreen = liveAlert.includes('GREEN');
  const isGoal = liveAlert.includes('GOL');

  return (
    <div
      className={`${styles.toast} ${
        isGreen ? styles.greenToast : isGoal ? styles.goalToast : styles.defaultToast
      }`}
    >
      <div className={styles.toastIcon}>
        {isGreen ? '🟢' : isGoal ? '⚽' : '📢'}
      </div>
      <div className={styles.toastText}>{liveAlert}</div>
      <button onClick={dismissAlert} className={styles.closeBtn} title="Fechar alerta">
        ✕
      </button>
    </div>
  );
}
