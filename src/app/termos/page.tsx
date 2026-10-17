'use client';

import React from 'react';
import Link from 'next/link';

export default function TermosPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', color: '#e2e8f0', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#f59e0b', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Voltar para o Início
      </Link>

      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
        Termos e Condições de Uso
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Última atualização: Outubro de 2026 • BetCerta Brasil (CNPJ: 69.654.316/0001-01)
      </p>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>1. Aceitação dos Termos e Maioridade</h2>
        <p>
          Ao criar uma conta ou utilizar os serviços da <strong>BetCerta</strong>, o usuário declara e garante ter idade igual ou superior a <strong>18 (dezoito) anos</strong> completos, bem como plena capacidade civil para contratar e assumir obrigações. O cadastro de menores de 18 anos é terminantemente proibido.
        </p>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>2. Depósitos e Meios de Pagamento</h2>
        <p>
          Os depósitos na BetCerta são processados via PIX instantâneo 24 horas por dia, 7 dias por semana. Para a segurança de todos os usuários, os depósitos devem ser originados de contas bancárias de mesma titularidade que o CPF cadastrado no perfil da plataforma. Não são aceitos depósitos de terceiros.
        </p>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>3. Retiradas e Saques (Cash-Out)</h2>
        <p>
          O usuário poderá solicitar a retirada de seus fundos a qualquer momento através da seção <strong>Carteira</strong> ou <strong>Meu Perfil</strong>. O saque mínimo é de R$ 10,00 e o pagamento é transferido via PIX para a chave informada pelo usuário vinculada ao seu CPF ou chave de destino validada. As solicitações são processadas com agilidade após checagem anti-fraude.
        </p>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>4. Regras de Apostas e Liquidação Autônoma</h2>
        <p>
          Todas as cotações (odds) e eventos esportivos baseiam-se em resultados oficiais fornecidos por feeds de dados esportivos certificados. As apostas são liquidadas de forma 100% autônoma pelo sistema. O resultado considerado é o placar oficial ao término do tempo regulamentar da partida, acrescido de acréscimos, salvo indicação expressa em contrário no mercado correspondente.
        </p>
      </section>

      <section style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', marginBottom: '0.75rem' }}>5. Privacidade e Proteção de Dados (LGPD)</h2>
        <p>
          A BetCerta adota criptografia de ponta a ponta (SSL 256-bit) e práticas rigorosas de proteção aos dados cadastrais em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Suas informações jamais serão comercializadas com terceiros.
        </p>
      </section>
    </div>
  );
}
