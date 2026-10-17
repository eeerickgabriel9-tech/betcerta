'use client';

import React from 'react';
import Link from 'next/link';

export default function JogoResponsavelPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', color: '#e2e8f0', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#f59e0b', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Voltar para o Início
      </Link>

      <div style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '1rem' }}>
        🔞 18+ APOSTE COM RESPONSABILIDADE
      </div>

      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
        Política de Jogo Responsável
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Nosso compromisso é proporcionar um ambiente de apostas esportivas e jogos de entretenimento seguro e saudável.
      </p>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>Princípios do Jogo Saudável</h2>
        <ul style={{ paddingLeft: '1.25rem' }}>
          <li>Aposte apenas o valor destinado ao seu lazer pessoal, nunca valores necessários para sustento ou despesas essenciais.</li>
          <li>Encare as apostas esportivas como uma forma de entretenimento, e não como uma fonte garantida de renda ou investimento.</li>
          <li>Nunca tente recuperar perdas de forma impulsiva aumentando apostas repetidamente.</li>
          <li>Estabeleça limites de tempo e de gastos antes de iniciar suas sessões de jogo.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>Ferramentas de Proteção ao Jogador</h2>
        <p>No seu perfil da BetCerta, disponibilizamos ferramentas ativas para garantir seu controle:</p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li><strong>Limites Diários e Semanais de Depósito:</strong> Defina o valor máximo que pode ser depositado na sua conta.</li>
          <li><strong>Pausa Temporária (Time-Out):</strong> Bloqueie seu acesso por períodos de 24 horas, 7 dias ou 30 dias.</li>
          <li><strong>Auto-Exclusão Definitiva:</strong> Encerre sua conta permanentemente caso sinta necessidade de se afastar dos jogos.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#10b981', marginBottom: '0.75rem' }}>Onde Buscar Ajuda Especializada</h2>
        <p>Se você ou alguém que você conhece está enfrentando dificuldades com o jogo, existem entidades gratuitas e confidenciais disponíveis no Brasil:</p>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
            <strong>🤝 Jogadores Anônimos do Brasil</strong>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>Reuniões presenciais e online de apoio mútuo em todo o Brasil.</p>
            <a href="https://jogadoresanonimos.com.br" target="_blank" rel="noreferrer" style={{ color: '#0073f5', fontWeight: 700 }}>www.jogadoresanonimos.com.br</a>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
            <strong>📞 Centro de Valorização da Vida (CVV)</strong>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>Apoio emocional gratuito e sigiloso 24 horas por dia.</p>
            <span style={{ color: '#10b981', fontWeight: 800 }}>Disque 188 (Ligação Gratuita) ou acesse cvv.org.br</span>
          </div>
        </div>
      </section>
    </div>
  );
}
