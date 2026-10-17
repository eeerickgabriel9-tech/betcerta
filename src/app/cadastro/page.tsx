'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBet } from '@/context/BetContext';
import styles from '../login/login.module.css';

export default function CadastroPage() {
  const router = useRouter();
  const { login } = useBet();

  // Estados do Formulário
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [over18, setOver18] = useState(true);
  const [claimFreebet, setClaimFreebet] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Envio direto do formulário de cadastro (Alta Conversão estilo Betano / 365)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!over18) {
      setErrorMsg('Você precisa ter mais de 18 anos para criar uma conta.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cpf, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Erro ao realizar cadastro.');
        setLoading(false);
        return;
      }

      // Login automático imediato sem barreira de código
      login(
        data.user.email,
        data.user.name,
        data.user.role,
        data.user.cpf,
        data.user.saldo || 0,
        data.user.bonus || 20
      );

      setSuccessMsg('🎉 Parabéns! Conta criada com sucesso e R$ 20,00 de Aposta Grátis ativada! Entrando...');

      setTimeout(() => {
        router.push('/esportes');
      }, 1200);
    } catch {
      setErrorMsg('Erro de conexão com o servidor. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            ⚡ Bet<span>Certa</span>
          </Link>

          {/* BADGE DE BOAS-VINDAS: APOSTA GRÁTIS */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🎁</span>
            <div>
              <strong style={{ color: '#fbbf24', fontSize: '0.85rem', display: 'block' }}>
                BÔNUS DE BOAS-VINDAS EXCLUSIVO
              </strong>
              <span style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>
                Ganhe <strong style={{ color: '#10b981' }}>R$ 20 em Aposta Grátis</strong> logo após o cadastro para palpitar no futebol!
              </span>
            </div>
          </div>

          <h1 className={styles.title} style={{ marginTop: '0.5rem' }}>Criar Minha Conta</h1>
          <p className={styles.sub}>Preencha em menos de 1 minuto e comece a apostar agora mesmo.</p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.input}
              placeholder="Ex: Carlos Silva"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>CPF (para saques instantâneos via PIX)</label>
            <input
              type="text"
              required
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              className={styles.input}
              placeholder="000.000.000-00"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Seu Melhor E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Crie uma Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.82rem',
              color: '#fbbf24',
              cursor: 'pointer',
              background: 'rgba(245, 158, 11, 0.08)',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <input
              type="checkbox"
              checked={claimFreebet}
              onChange={e => setClaimFreebet(e.target.checked)}
            />
            <span>Quero ativar minha <strong>Aposta Grátis de R$ 20,00</strong> de boas-vindas</span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            <input
              type="checkbox"
              checked={over18}
              onChange={e => setOver18(e.target.checked)}
            />
            Confirmo que possuo 18 anos ou mais e aceito os Termos de Uso.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 800,
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
            }}
            id="btn-submit-cadastro"
          >
            {loading ? 'Criando Conta...' : '🎁 Criar Conta & Ganhar R$ 20 Grátis'}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Já possui uma conta?{' '}
            <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
