'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBet } from '@/context/BetContext';
import styles from './carteira.module.css';

export default function CarteiraPage() {
  const { saldo, deposit, withdraw, transactions, user } = useBet();
  const [activeTab, setActiveTab] = useState<'deposito' | 'saque' | 'extrato'>('deposito');

  // Estado Depósito PIX Oficial (Mercado Pago)
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);
  const [isCreatingPix, setIsCreatingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixCopyCode, setPixCopyCode] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [currentDepositId, setCurrentDepositId] = useState<string | null>(null);
  const [depositStatus, setDepositStatus] = useState<'pending' | 'approved'>('pending');

  // Estado Saque PIX
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [pixKey, setPixKey] = useState(user.cpf || '123.456.789-00');
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Monitoramento contínuo (polling) do status do PIX
  React.useEffect(() => {
    if (!pixGenerated || !currentDepositId || depositStatus === 'approved') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status?id=${currentDepositId}`);
        const data = await res.json();
        if (data.success && data.deposit?.status === 'approved') {
          setDepositStatus('approved');
          deposit(depositAmount, 'PIX Mercado Pago Oficial');
          setDepositSuccessMsg(`🎉 Depósito de R$ ${depositAmount.toFixed(2)} APROVADO! Saldo liberado na sua conta.`);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Erro ao verificar status do PIX:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [pixGenerated, currentDepositId, depositStatus, depositAmount, deposit]);

  const handleGeneratePix = async () => {
    if (depositAmount <= 0) return;
    setIsCreatingPix(true);
    setPixError(null);
    setDepositSuccessMsg(null);

    try {
      const res = await fetch('/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: depositAmount,
          userName: user.name,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (data.success && data.deposit) {
        setPixCopyCode(data.deposit.qrCode);
        setQrCodeBase64(data.deposit.qrCodeBase64);
        setCurrentDepositId(data.deposit.id);
        setDepositStatus('pending');
        setPixGenerated(true);
      } else {
        setPixError(data.error || 'Não foi possível gerar o PIX. Tente novamente.');
      }
    } catch {
      setPixError('Erro de conexão ao gerar o PIX. Verifique sua internet.');
    } finally {
      setIsCreatingPix(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    const amountNum = parseFloat(withdrawAmount);
    const result = await withdraw(amountNum, pixKey, pixKeyType);
    if (result.success) {
      setWithdrawMsg({ type: 'success', text: result.message });
      setWithdrawAmount('');
    } else {
      setWithdrawMsg({ type: 'error', text: result.message });
    }
  };

  return (
    <div className={styles.container}>
      {/* Resumo da Carteira */}
      <div className={styles.balanceHeader}>
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Saldo Disponível em Conta</span>
          <h1 className={styles.balanceValue}>
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <span className={styles.balanceUser}>Titular: {user.name} ({user.cpf})</span>
        </div>

        <div className={styles.quickActions}>
          <button
            className={`${styles.actionBtn} ${activeTab === 'deposito' ? styles.actionActive : ''}`}
            onClick={() => setActiveTab('deposito')}
          >
            ⚡ Depositar PIX
          </button>
          <button
            className={`${styles.actionBtn} ${activeTab === 'saque' ? styles.actionActive : ''}`}
            onClick={() => setActiveTab('saque')}
          >
            💸 Sacar Saldo
          </button>
          <button
            className={`${styles.actionBtn} ${activeTab === 'extrato' ? styles.actionActive : ''}`}
            onClick={() => setActiveTab('extrato')}
          >
            📑 Extrato
          </button>
          <Link
            href="/perfil"
            className={styles.actionBtn}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            👤 Meu Perfil
          </Link>
        </div>
      </div>

      {/* ABA: DEPÓSITO PIX */}
      {activeTab === 'deposito' && (
        <div className={styles.cardSection}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.pixIcon}>⚡</span>
            <div>
              <h2 className={styles.cardTitle}>Depósito Instantâneo via PIX</h2>
              <p className={styles.cardSub}>Crédito automático em menos de 30 segundos. Sem taxas.</p>
            </div>
          </div>

          {depositSuccessMsg && (
            <div className={styles.successAlert}>
              ✅ {depositSuccessMsg}
            </div>
          )}

          {!pixGenerated ? (
            <div className={styles.depositForm}>
              <label className={styles.label}>Escolha um valor ou digite o seu:</label>
              <div className={styles.presetGrid}>
                {[20, 50, 100, 200, 500, 1000].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.presetBtn} ${depositAmount === val ? styles.presetActive : ''}`}
                    onClick={() => setDepositAmount(val)}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>

              <div className={styles.inputRow}>
                <span className={styles.currencyPrefix}>R$</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={depositAmount || ''}
                  onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className={styles.numInput}
                  placeholder="Outro valor..."
                />
              </div>

              <div className={styles.bonusNotice} style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)', color: '#34d399' }}>
                ⚡ <strong>Depósito 100% Real:</strong> Saldo creditado instantaneamente na sua conta para apostar e sacar via PIX.
              </div>

              {pixError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  ⚠️ {pixError}
                </div>
              )}

              <button
                type="button"
                className="btn-gold"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleGeneratePix}
                disabled={isCreatingPix}
                id="btn-gerar-pix"
              >
                {isCreatingPix ? '⚡ Gerando PIX Oficial Mercado Pago...' : `Gerar QR Code PIX (R$ ${depositAmount.toFixed(2)})`}
              </button>
            </div>
          ) : (
            <div className={styles.pixResult}>
              <div className={styles.qrCodeBox}>
                {qrCodeBase64 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`data:image/png;base64,${qrCodeBase64}`}
                    alt="QR Code PIX Oficial Mercado Pago"
                    className={styles.realQrImage}
                  />
                ) : (
                  <div className={styles.realQrImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#000', fontWeight: 'bold' }}>
                    ⚡ PIX OFICIAL
                  </div>
                )}
                
                <span className={styles.qrAmount}>Valor: R$ {depositAmount.toFixed(2)}</span>
                
                {depositStatus === 'approved' ? (
                  <div className={styles.approvedBadge}>
                    ✅ Depósito Aprovado com Sucesso!
                  </div>
                ) : (
                  <div className={styles.waitingBadge}>
                    ⏳ Aguardando Pagamento / Aprovação
                  </div>
                )}

                <span className={styles.qrTimer}>Expira em 14:59 minutos</span>
              </div>

              <div className={styles.pixInstructions}>
                <h3>Como pagar (100% Automático e Sem Comprovante):</h3>
                <ol>
                  <li>Abra o app do seu banco (Nubank, Inter, Itaú, Bradesco, etc.).</li>
                  <li>Escolha <strong>PIX</strong> e depois <strong>PIX Copia e Cola</strong> ou <strong>Ler QR Code</strong>.</li>
                  <li>Cole o código oficial abaixo ou aponte a câmera para o QR Code ao lado.</li>
                  <li><strong>Não precisa enviar comprovante!</strong> O sistema recebe o aviso e libera seu saldo na hora.</li>
                </ol>

                <div className={styles.copyBox}>
                  <input
                    type="text"
                    readOnly
                    value={pixCopyCode}
                    className={styles.copyInput}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleCopyPix}
                    style={{ padding: '0.6rem 1rem' }}
                  >
                    {pixCopied ? 'Copiado! ✓' : 'Copiar'}
                  </button>
                </div>

                <div className={styles.testBtnBox}>
                  {depositStatus !== 'approved' && (
                    <button
                      type="button"
                      className="btn-gold"
                      style={{ width: '100%', padding: '0.85rem' }}
                      onClick={async () => {
                        if (currentDepositId) {
                          const res = await fetch(`/api/pix/status?id=${currentDepositId}`);
                          const data = await res.json();
                          if (data.success && data.deposit?.status === 'approved') {
                            setDepositStatus('approved');
                            deposit(depositAmount, 'PIX Mercado Pago Oficial');
                            setDepositSuccessMsg(`🎉 Depósito de R$ ${depositAmount.toFixed(2)} aprovado com sucesso!`);
                          } else {
                            alert('Aguardando confirmação bancária ou aprovação no painel!');
                          }
                        }
                      }}
                    >
                      🔄 Já Fiz o Pagamento (Verificar Agora)
                    </button>
                  )}



                  <button
                    type="button"
                    className="btn-outline"
                    style={{ width: '100%', padding: '0.6rem' }}
                    onClick={() => {
                      setPixGenerated(false);
                      setCurrentDepositId(null);
                    }}
                  >
                    Alterar Valor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: SAQUE PIX */}
      {activeTab === 'saque' && (
        <div className={styles.cardSection}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.pixIcon}>💸</span>
            <div>
              <h2 className={styles.cardTitle}>Solicitar Saque Instantâneo</h2>
              <p className={styles.cardSub}>Transferência via PIX enviada diretamente para sua conta bancária.</p>
            </div>
          </div>

          {withdrawMsg && (
            <div
              className={withdrawMsg.type === 'success' ? styles.successAlert : styles.errorAlert}
            >
              {withdrawMsg.type === 'success' ? '✅' : '❌'} {withdrawMsg.text}
            </div>
          )}

          <form onSubmit={handleWithdraw} className={styles.depositForm}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Tipo de Chave PIX:</label>
              <div className={styles.keyTypes}>
                {['cpf', 'email', 'telefone', 'aleatoria'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.keyBtn} ${pixKeyType === t ? styles.keyActive : ''}`}
                    onClick={() => setPixKeyType(t)}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Sua Chave PIX:</label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                className={styles.textInput}
                placeholder="Insira sua chave PIX..."
              />
            </div>

            <div className={styles.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className={styles.label}>Valor do Saque (R$):</label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Disponível: R$ {saldo.toFixed(2)}
                </span>
              </div>
              <div className={styles.inputRow}>
                <span className={styles.currencyPrefix}>R$</span>
                <input
                  type="number"
                  min="10"
                  max={saldo}
                  step="1"
                  required
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className={styles.numInput}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className={styles.chipsRow}>
              {[50, 100, 200, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  className={styles.quickChip}
                  onClick={() => setWithdrawAmount(val.toString())}
                >
                  R$ {val}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.quickChip} ${styles.quickChipMax}`}
                onClick={() => setWithdrawAmount(Math.floor(saldo).toString())}
              >
                TUDO (R$ {Math.floor(saldo)})
              </button>
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
              id="btn-confirmar-saque"
            >
              Confirmar Saque PIX
            </button>
          </form>
        </div>
      )}

      {/* ABA: EXTRATO DE TRANSAÇÕES */}
      {activeTab === 'extrato' && (
        <div className={styles.cardSection}>
          <h2 className={styles.cardTitle}>Histórico de Movimentações</h2>
          <p className={styles.cardSub}>Confira todos os seus depósitos, saques e resultados.</p>

          <div className={styles.txList}>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Nenhuma movimentação registrada até o momento.
              </p>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className={styles.txItem}>
                  <div className={styles.txIcon}>
                    {tx.type === 'deposit' && '⚡'}
                    {tx.type === 'withdraw' && '💸'}
                    {tx.type === 'bet_won' && '🏆'}
                    {tx.type === 'bet_placed' && '🎟️'}
                    {tx.type === 'casino_win' && '🎰'}
                    {tx.type === 'casino_bet' && '🎲'}
                  </div>
                  <div className={styles.txDetails}>
                    <strong>{tx.description}</strong>
                    <span>{tx.id} • {tx.date}</span>
                  </div>
                  <div
                    className={`${styles.txAmount} ${
                      tx.amount > 0 ? styles.txPositive : styles.txNegative
                    }`}
                  >
                    {tx.amount > 0 ? `+ R$ ${tx.amount.toFixed(2)}` : `- R$ ${Math.abs(tx.amount).toFixed(2)}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
