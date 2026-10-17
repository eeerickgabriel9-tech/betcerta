'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useBet } from '@/context/BetContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { saldo, bonus, betslip, toggleSlip, user, logout } = useBet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Bet<span className={styles.logoBet}>Certa</span></span>
        </Link>

        {/* Links principais */}
        <div className={styles.navLinks}>
          <Link href="/esportes" className={`${styles.navLink} ${pathname === '/esportes' ? styles.active : ''}`}>
            ⚽ Futebol & Ligas
          </Link>
          <Link href="/promocoes" className={`${styles.navLink} ${pathname === '/promocoes' ? styles.active : ''}`}>
            🎁 Promoções {bonus > 0 ? `(Freebet R$ ${bonus.toFixed(0)})` : ''}
          </Link>
          {user.isLogged && user.role === 'admin' && (
            <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`} style={{ color: 'var(--gold)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              ⚙️ Painel Dono
            </Link>
          )}
        </div>

        {/* Área do usuário e Betslip */}
        <div className={styles.navUser}>
          {/* Botão de bilhete flutuante / indicador - Desktop apenas */}
          <button
            onClick={toggleSlip}
            className={`${styles.desktopOnly} btn-outline`}
            style={{ position: 'relative', padding: '0.5rem 0.9rem' }}
            title="Abrir Bilhete de Apostas"
          >
            🎟️ Bilhete
            {betslip.length > 0 && (
              <span
                style={{
                  background: 'var(--blue-1win)',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '0.4rem',
                  boxShadow: '0 0 10px rgba(0, 115, 245, 0.5)',
                }}
              >
                {betslip.length}
              </span>
            )}
          </button>

          {user.isLogged ? (
            <>
              {/* Saldo da Carteira */}
              <Link href="/carteira" className={styles.saldoBox} title="Gerenciar Carteira">
                <span className={styles.saldoLabel}>Saldo</span>
                <span className={styles.saldoValue}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {bonus > 0 && (
                  <span className={styles.bonusPill} title="Saldo de Aposta Grátis disponível">
                    🎁 R$ {bonus.toFixed(0)}
                  </span>
                )}
              </Link>

              <Link href="/carteira" className={`btn-1win-green ${styles.depositBtn}`} id="btn-depositar">
                + PIX
              </Link>

              <div className={styles.desktopOnly} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link href="/perfil" className="btn-outline" style={{ fontSize: '0.85rem' }} title="Acessar Meu Perfil">
                  👤 {user.name.split(' ')[0]} {user.role === 'admin' ? '(Dono)' : ''}
                </Link>
                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                  title="Sair da Conta"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link href="/login" className="btn-outline" id="btn-login" style={{ padding: '0.5rem 0.9rem', fontSize: '0.88rem' }}>
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="btn-gold"
                id="btn-cadastro"
                style={{
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                }}
              >
                🎁 Criar Conta & Ganhar R$ 20
              </Link>
            </div>
          )}
        </div>

        {/* Menu mobile */}
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          id="btn-menu-mobile"
          aria-label="Abrir Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu mobile dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            🏠 Início
          </Link>
          <Link href="/esportes" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            ⚽ Futebol & Campeonatos
          </Link>
          <Link href="/promocoes" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            🎁 Promoções & Vantagens
          </Link>
          <Link href="/carteira" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            👛 Minha Carteira & Depósito PIX
          </Link>
          <Link href="/perfil" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            👤 Meu Perfil & Histórico
          </Link>
          {user.isLogged && user.role === 'admin' && (
            <Link href="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)} style={{ color: 'var(--gold)', fontWeight: 800 }}>
              ⚙️ Painel Dono da BetCerta
            </Link>
          )}
          <div className={styles.mobileBtns}>
            <button
              onClick={() => {
                toggleSlip();
                setMenuOpen(false);
              }}
              className="btn-gold"
            >
              🎟️ Ver Bilhete ({betslip.length})
            </button>
            <Link href="/carteira" className="btn-primary" onClick={() => setMenuOpen(false)}>
              + Depositar PIX
            </Link>
          </div>
        </div>
      )}

      {/* Fim do navbar */}
      </nav>

      {/* BARRA DE NAVEGAÇÃO INFERIOR PARA CELULAR (Estilo App Nativo Betano / 365) - FORA DO NAV COM BACKDROP-FILTER! */}
      <div className={styles.mobileBottomNav}>
        <Link href="/" className={`${styles.bottomNavItem} ${pathname === '/' ? styles.bottomActive : ''}`}>
          <span className={styles.bottomIcon}>⚽</span>
          <span className={styles.bottomLabel}>Início</span>
        </Link>

        <Link href="/esportes" className={`${styles.bottomNavItem} ${pathname === '/esportes' ? styles.bottomActive : ''}`}>
          <span className={styles.bottomIcon}>🏆</span>
          <span className={styles.bottomLabel}>Ligas</span>
        </Link>

        <button onClick={toggleSlip} className={`${styles.bottomNavItem} ${styles.bottomSlipBtn}`}>
          <span className={styles.bottomIcon}>🎟️</span>
          <span className={styles.bottomLabel}>Bilhete</span>
          {betslip.length > 0 && (
            <span className={styles.bottomBadge}>{betslip.length}</span>
          )}
        </button>

        <Link href={user.isLogged ? "/carteira" : "/login"} className={`${styles.bottomNavItem} ${pathname === '/carteira' ? styles.bottomActive : ''}`}>
          <span className={styles.bottomIcon}>👛</span>
          <span className={styles.bottomLabel}>Carteira</span>
        </Link>

        <Link href={user.isLogged ? "/perfil" : "/cadastro"} className={`${styles.bottomNavItem} ${pathname === '/perfil' || pathname === '/cadastro' ? styles.bottomActive : ''}`}>
          <span className={styles.bottomIcon}>{user.isLogged ? '👤' : '🎁'}</span>
          <span className={styles.bottomLabel}>{user.isLogged ? (user.role === 'admin' ? 'Dono' : 'Conta') : 'Ganhar R$20'}</span>
        </Link>
      </div>
    </>
  );
}
