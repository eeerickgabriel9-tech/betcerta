'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Banner de Jogo Responsável */}
        <div className={styles.responsibleBox}>
          <div className={styles.ageBadge}>18+</div>
          <div className={styles.responsibleText}>
            <strong>Aposte com Responsabilidade:</strong> As apostas esportivas destinam-se
            exclusivamente a maiores de 18 anos. Aposte apenas o que pode perder. Em caso de dúvidas sobre controle de jogo,
            busque orientação em entidades especializadas.
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className={styles.paymentSection}>
          <span className={styles.paymentTitle}>Métodos de Pagamento Seguros:</span>
          <div className={styles.paymentBadges}>
            <div className={styles.paymentBadge}>⚡ PIX Instantâneo (Receba em 2 min)</div>
            <div className={styles.paymentBadge}>💳 Cartão Visa / Mastercard</div>
            <div className={styles.paymentBadge}>🪙 Bitcoin & USDT</div>
            <div className={styles.paymentBadge}>📄 Boleto Rápido</div>
          </div>
        </div>

        {/* Links do Rodapé */}
        <div className={styles.linksGrid}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Apostas Esportivas</h4>
            <Link href="/esportes?sport=futebol">Futebol Brasileiro & Europeu</Link>
            <Link href="/esportes">Calendário Oficial Prematch</Link>
            <Link href="/esportes?sport=basquete">NBA & Basquete</Link>
            <Link href="/esportes?sport=mma">UFC & Lutas</Link>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Ligas em Destaque</h4>
            <Link href="/esportes?league=Brasileirão+Série+A">Brasileirão Série A</Link>
            <Link href="/esportes?league=UEFA+Champions+League">UEFA Champions League</Link>
            <Link href="/esportes?league=Premier+League">Premier League Inglesa</Link>
            <Link href="/esportes?league=La+Liga">La Liga Espanhola</Link>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Ajuda & Segurança</h4>
            <Link href="/carteira">Depósitos & Saques PIX</Link>
            <Link href="/promocoes">Vantagens & Regras</Link>
            <Link href="/termos">Termos e Condições</Link>
            <Link href="/jogo-responsavel">Jogo Responsável</Link>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Suporte 24/7</h4>
            <p className={styles.supportInfo}>Atendimento via Chat Ao Vivo em português 24 horas por dia, 7 dias por semana.</p>
            <button className="btn-outline" style={{ marginTop: '0.5rem', width: 'fit-content' }}>
              💬 Chat com Especialista
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.bottomBar}>
          <div>
            © 2026 <strong>BetCerta Brasil</strong>. Todos os direitos reservados.
          </div>
          <div className={styles.bottomMeta}>
            Licenciado e regulamentado para entretenimento digital. Criptografia SSL 256-bit ativa.
          </div>
        </div>
      </div>
    </footer>
  );
}
