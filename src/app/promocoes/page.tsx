'use client';

import React from 'react';
import Link from 'next/link';
import { useBet } from '@/context/BetContext';
import styles from './promocoes.module.css';

const PROMOS = [
  {
    id: 'freebet-welcome',
    tag: '🎁 BOAS-VINDAS • APOSTA GRÁTIS',
    badgeClass: 'badgeGold',
    title: 'R$ 20,00 em Aposta Grátis (Freebet de Futebol)',
    description:
      'Como funciona a Aposta Grátis na BetCerta (estilo Betano e Bet365): Ao criar sua conta, você recebe instantaneamente R$ 20 de saldo Freebet. Adicione qualquer palpite de futebol oficial no seu bilhete, ative a opção "Usar Aposta Grátis" e faça sua aposta sem arriscar nenhum centavo do seu bolso! Se der GREEN, os ganhos são creditados diretamente no seu saldo real para sacar via PIX!',
    rules: 'Sem pegadinha • Válido para futebol oficial • Lucros pagos em dinheiro real',
    btnText: 'Cadastrar & Ativar R$ 20 Grátis',
    link: '/cadastro',
    featured: true,
  },
  {
    id: 'super-odds',
    tag: '🔥 SUPER ODDS BETCERTA',
    badgeClass: 'badgePurple',
    title: 'Super Odds no Brasileirão & Ligas Oficiais',
    description:
      'Cotações aumentadas diariamente nos principais jogos do futebol nacional e internacional. Aproveite as melhores odds do mercado no 1X2, Dupla Chance, Gols e 1º Tempo.',
    rules: 'Disponível em partidas selecionadas de futebol pré-jogo',
    btnText: 'Ver Jogos com Super Odds',
    link: '/esportes',
    featured: false,
  },
  {
    id: 'multipla-express',
    tag: '⚡ MÚLTIPLA TURBINADA',
    badgeClass: 'badgePurple',
    title: 'Bônus Progressivo em Apostas Combinadas',
    description:
      'Junte 2 ou mais seleções de futebol no mesmo bilhete para multiplicar exponencialmente suas odds e receber bônus adicional nos seus lucros a cada acerto.',
    rules: 'Válido para bilhetes com 2 ou mais jogos oficiais',
    btnText: 'Montar Bilhete Múltiplo',
    link: '/esportes',
    featured: false,
  },
  {
    id: 'pix-instant',
    tag: '⚡ PAGAMENTO IMEDIATO',
    badgeClass: 'badgeGold',
    title: 'Depósitos e Saques Instantâneos via PIX',
    description:
      'Transações 100% automatizadas direto na sua conta bancária. Depósitos liberados no mesmo segundo e saques rápidos sem taxa.',
    rules: 'Depósito a partir de R$ 1,00 • Saques 24 horas por dia',
    btnText: 'Acessar Carteira PIX',
    link: '/carteira',
    featured: false,
  },
];

export default function PromocoesPage() {
  const { user, bonus } = useBet();

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <span className={styles.heroTag}>🎁 PROMOÇÕES & VANTAGENS OFICIAIS</span>
        <h1 className={styles.heroTitle}>Aposta Grátis & Super Odds BetCerta</h1>
        <p className={styles.heroSub}>
          Entenda como funciona a Aposta Grátis de Boas-Vindas, turbine seus palpites de futebol e receba seus prêmios na hora via PIX.
        </p>

        {user.isLogged && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              marginTop: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.75rem' }}>🎟️</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>
                Seu Saldo de Aposta Grátis:
              </span>
              <strong style={{ color: '#10b981', fontSize: '1.35rem', fontFamily: 'Rajdhani, sans-serif' }}>
                R$ {bonus.toFixed(2)}
              </strong>
            </div>
            <Link
              href="/esportes"
              className="btn-gold"
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Usar no Bilhete
            </Link>
          </div>
        )}
      </div>

      <div className={styles.promosGrid}>
        {PROMOS.map(p => (
          <div
            key={p.id}
            className={styles.promoCard}
            style={p.featured ? { border: '1px solid rgba(245, 158, 11, 0.6)', background: 'linear-gradient(180deg, #182238 0%, #101726 100%)' } : {}}
          >
            <div className={styles.cardHeader}>
              <span className={`${styles.badge} ${styles[p.badgeClass]}`}>{p.tag}</span>
            </div>
            <h2 className={styles.promoTitle} style={p.featured ? { color: '#fbbf24' } : {}}>{p.title}</h2>
            <p className={styles.promoDesc}>{p.description}</p>
            <div className={styles.promoRules}>
              <span>📋 {p.rules}</span>
            </div>
            <Link
              href={user.isLogged && p.id === 'freebet-welcome' ? '/esportes' : p.link}
              className={p.featured ? "btn-gold" : "btn-1win-green"}
              style={{ marginTop: 'auto', textAlign: 'center', fontWeight: 800 }}
            >
              {user.isLogged && p.id === 'freebet-welcome' ? 'Usar Minha Aposta Grátis' : p.btnText}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
