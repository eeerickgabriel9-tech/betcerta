'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CasinoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#94a3b8' }}>
      <p>Redirecionando para a central de Futebol BetCerta...</p>
    </div>
  );
}
