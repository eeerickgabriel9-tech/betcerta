'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBet } from '@/context/BetContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useBet();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrCpf: email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Credenciais inválidas.');
        setLoading(false);
        return;
      }

      login(data.user.email, data.user.name, data.user.role, data.user.cpf, data.user.saldo);
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setErrorMsg('Erro de conexão com o servidor.');
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
          <h1 className={styles.title}>Acesse sua Conta</h1>
          <p className={styles.sub}>Entre para apostar nos jogos e sacar via PIX.</p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>E-mail ou CPF</label>
            <input
              type="text"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              placeholder="seuemail@exemplo.com ou CPF"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Senha</label>
              <a href="#" className={styles.forgot}>Esqueceu a senha?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Sua senha secreta"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            id="btn-submit-login"
          >
            {loading ? 'Entrando...' : 'Entrar na BetCerta'}
          </button>


        </form>

        <div className={styles.footer}>
          Não tem uma conta ainda?{' '}
          <Link href="/cadastro" className={styles.registerLink}>
            Cadastre-se grátis
          </Link>
        </div>
      </div>
    </div>
  );
}
