'use client';

import React from 'react';

interface TeamBadgeProps {
  teamName: string;
  size?: number;
  className?: string;
}

export default function TeamBadge({ teamName, size = 32, className = '' }: TeamBadgeProps) {
  const norm = teamName.toLowerCase();

  // Flamengo
  if (norm.includes('flamengo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <defs>
          <clipPath id="fla-clip">
            <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" />
          </clipPath>
        </defs>
        <path d="M50 3 L90 19 C90 67 50 97 50 97 C50 97 10 67 10 19 Z" fill="#f59e0b" />
        <g clipPath="url(#fla-clip)">
          <rect x="0" y="0" width="100" height="20" fill="#c91818" />
          <rect x="0" y="20" width="100" height="15" fill="#111111" />
          <rect x="0" y="35" width="100" height="15" fill="#c91818" />
          <rect x="0" y="50" width="100" height="15" fill="#111111" />
          <rect x="0" y="65" width="100" height="15" fill="#c91818" />
          <rect x="0" y="80" width="100" height="20" fill="#111111" />
          <circle cx="35" cy="38" r="16" fill="rgba(0,0,0,0.4)" />
          <text x="35" y="44" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            CRF
          </text>
        </g>
      </svg>
    );
  }

  // Palmeiras
  if (norm.includes('palmeiras')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#f59e0b" />
        <circle cx="50" cy="50" r="45" fill="#006437" />
        <circle cx="50" cy="50" r="38" fill="#ffffff" />
        <circle cx="50" cy="50" r="34" fill="#006437" />
        <path
          d="M42 28 L54 28 C62 28 66 33 66 39 C66 45 62 50 54 50 L48 50 L48 72 L42 72 Z M48 34 L48 44 L53 44 C57 44 60 42 60 39 C60 36 57 34 53 34 Z"
          fill="#ffffff"
        />
        <circle cx="50" cy="18" r="2.5" fill="#ffffff" />
        <circle cx="32" cy="22" r="2.5" fill="#ffffff" />
        <circle cx="68" cy="22" r="2.5" fill="#ffffff" />
      </svg>
    );
  }

  // São Paulo
  if (norm.includes('são paulo') || norm.includes('sao paulo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M10 20 L90 20 L90 35 L50 90 L10 35 Z" fill="#ffffff" stroke="#111" strokeWidth="4" />
        <rect x="12" y="22" width="76" height="15" fill="#111111" />
        <text x="50" y="34" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SPFC
        </text>
        <polygon points="16,39 48,39 48,82" fill="#d00000" />
        <polygon points="84,39 52,39 52,82" fill="#111111" />
        <polygon points="50,6 52,12 58,12 53,16 55,22 50,18 45,22 47,16 42,12 48,12" fill="#f59e0b" />
      </svg>
    );
  }

  // Corinthians
  if (norm.includes('corinthians')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L50 92 M35 15 L65 15 M20 75 C35 90 65 90 80 75" stroke="#cc0000" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="50" r="30" fill="#ffffff" stroke="#111111" strokeWidth="3" />
        <circle cx="50" cy="50" r="24" fill="#111111" />
        <text x="50" y="55" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SCCP
        </text>
      </svg>
    );
  }

  // Vasco da Gama
  if (norm.includes('vasco')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
        <path d="M50 8 L84 22 C84 62 50 90 50 90 C50 90 16 62 16 22 Z" fill="#111111" />
        {/* Faixa diagonal branca */}
        <path d="M26 30 L80 78 L72 84 L18 36 Z" fill="#ffffff" />
        {/* Cruz de Malta vermelha */}
        <path d="M45 42 L55 42 L55 35 L62 35 L62 42 L69 42 L69 49 L62 49 L62 56 L55 56 L55 49 L45 49 Z" fill="#dc2626" />
      </svg>
    );
  }

  // Bahia
  if (norm.includes('bahia')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#003580" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="50" cy="50" r="40" fill="#ffffff" />
        <circle cx="50" cy="50" r="32" fill="#d00000" />
        <text x="50" y="56" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          ECB
        </text>
      </svg>
    );
  }

  // Grêmio
  if (norm.includes('grêmio') || norm.includes('gremio')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#00a3e0" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="50" cy="50" r="40" fill="#111111" />
        <circle cx="50" cy="50" r="30" fill="#ffffff" />
        <text x="50" y="55" fill="#00a3e0" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          GREMIO
        </text>
      </svg>
    );
  }

  // Internacional
  if (norm.includes('internacional') || norm.includes('inter')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#cc0000" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="50" cy="50" r="38" fill="#ffffff" />
        <circle cx="50" cy="50" r="34" fill="#cc0000" />
        <text x="50" y="56" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SCI
        </text>
      </svg>
    );
  }

  // Cruzeiro
  if (norm.includes('cruzeiro')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#003580" stroke="#f59e0b" strokeWidth="3" />
        {/* Constelação Cruzeiro do Sul */}
        <circle cx="50" cy="30" r="4" fill="#ffffff" />
        <circle cx="50" cy="70" r="4" fill="#ffffff" />
        <circle cx="30" cy="50" r="4" fill="#ffffff" />
        <circle cx="70" cy="46" r="4" fill="#ffffff" />
        <circle cx="62" cy="58" r="2.5" fill="#ffffff" />
      </svg>
    );
  }

  // Atlético-MG
  if (norm.includes('atlético') || norm.includes('atletico-mg') || norm.includes('galo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#f59e0b" />
        <path d="M50 8 L84 22 C84 62 50 90 50 90 C50 90 16 62 16 22 Z" fill="#111111" />
        <rect x="25" y="30" width="10" height="50" fill="#ffffff" />
        <rect x="45" y="30" width="10" height="50" fill="#ffffff" />
        <rect x="65" y="30" width="10" height="50" fill="#ffffff" />
        <text x="50" y="26" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          CAM
        </text>
      </svg>
    );
  }

  // Santos
  if (norm.includes('santos')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#f59e0b" />
        <path d="M50 8 L84 22 C84 62 50 90 50 90 C50 90 16 62 16 22 Z" fill="#ffffff" />
        <rect x="16" y="22" width="68" height="20" fill="#111111" />
        <text x="50" y="36" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SFC
        </text>
        <circle cx="50" cy="62" r="12" fill="#111111" />
        <circle cx="50" cy="62" r="8" fill="#ffffff" />
      </svg>
    );
  }

  // Real Madrid
  if (norm.includes('real madrid')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M30 25 L35 12 L45 20 L50 8 L55 20 L65 12 L70 25 Z" fill="#f59e0b" />
        <circle cx="50" cy="58" r="36" fill="#f59e0b" />
        <circle cx="50" cy="58" r="32" fill="#ffffff" stroke="#003580" strokeWidth="2" />
        <path d="M26 40 L74 76 L68 84 L20 48 Z" fill="#7c3aed" />
        <text x="50" y="66" fill="#003580" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          MCF
        </text>
      </svg>
    );
  }

  // Barcelona
  if (norm.includes('barcelona') || norm.includes('barça')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M15 15 C35 10 65 10 85 15 C85 45 85 65 50 90 C15 65 15 45 15 15 Z" fill="#f59e0b" />
        <path d="M18 18 C35 13 65 13 82 18 C82 45 82 63 50 86 C18 63 18 45 18 18 Z" fill="#ffffff" />
        <rect x="24" y="23" width="22" height="22" fill="#ffffff" />
        <rect x="33" y="23" width="4" height="22" fill="#dc2626" />
        <rect x="24" y="32" width="22" height="4" fill="#dc2626" />
        <path d="M20 53 C20 63 32 75 50 84 C68 75 80 63 80 53 Z" fill="#004d98" />
        <circle cx="50" cy="62" r="7" fill="#f59e0b" stroke="#111" strokeWidth="1" />
      </svg>
    );
  }

  // Manchester City
  if (norm.includes('manchester city') || norm.includes('man city')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#6cabdd" />
        <circle cx="50" cy="50" r="45" fill="#1c2c5b" />
        <circle cx="50" cy="50" r="36" fill="#ffffff" />
        <circle cx="50" cy="50" r="34" fill="#6cabdd" />
        <path d="M38 42 L62 42 L58 48 L42 48 Z M50 30 L50 40" stroke="#f59e0b" strokeWidth="3" fill="#f59e0b" />
      </svg>
    );
  }

  // Arsenal
  if (norm.includes('arsenal')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M18 12 L82 12 C82 55 50 90 50 90 C50 90 18 55 18 12 Z" fill="#023474" stroke="#f59e0b" strokeWidth="3" />
        <path d="M22 16 L78 16 C78 52 50 84 50 84 C50 84 22 52 22 16 Z" fill="#db0007" />
        <rect x="28" y="44" width="44" height="8" rx="3" fill="#f59e0b" />
        <circle cx="36" cy="54" r="8" fill="#f59e0b" stroke="#111" strokeWidth="2" />
      </svg>
    );
  }

  // Mirassol
  if (norm.includes('mirassol')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#facc15" stroke="#15803d" strokeWidth="4" />
        <circle cx="50" cy="50" r="38" fill="#15803d" />
        <text x="50" y="56" fill="#facc15" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          MFC
        </text>
      </svg>
    );
  }

  // Sport Recife
  if (norm.includes('sport')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#f59e0b" />
        <path d="M50 8 L84 22 C84 62 50 90 50 90 C50 90 16 62 16 22 Z" fill="#111111" />
        <rect x="18" y="26" width="64" height="12" fill="#dc2626" />
        <rect x="18" y="44" width="64" height="12" fill="#dc2626" />
        <text x="50" y="70" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SCR
        </text>
      </svg>
    );
  }

  // Fortaleza
  if (norm.includes('fortaleza')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#f59e0b" />
        <path d="M50 8 L84 22 C84 62 50 90 50 90 C50 90 16 62 16 22 Z" fill="#1d4ed8" />
        <rect x="18" y="32" width="64" height="10" fill="#ffffff" />
        <rect x="18" y="48" width="64" height="10" fill="#dc2626" />
        <text x="50" y="72" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          FEC
        </text>
      </svg>
    );
  }

  // Boca Juniors
  if (norm.includes('boca')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#003580" stroke="#f59e0b" strokeWidth="4" />
        <rect x="18" y="42" width="64" height="18" fill="#f59e0b" />
        <text x="50" y="55" fill="#003580" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          CABJ
        </text>
      </svg>
    );
  }

  // Eintracht Frankfurt
  if (norm.includes('frankfurt')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#dc2626" stroke="#111" strokeWidth="4" />
        <circle cx="50" cy="50" r="36" fill="#111111" />
        <text x="50" y="56" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          SGE
        </text>
      </svg>
    );
  }

  // Sassuolo
  if (norm.includes('sassuolo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#15803d" stroke="#111" strokeWidth="4" />
        <rect x="30" y="25" width="10" height="55" fill="#111111" />
        <rect x="50" y="25" width="10" height="55" fill="#111111" />
        <text x="50" y="45" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          US
        </text>
      </svg>
    );
  }

  // Liverpool
  if (norm.includes('liverpool')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#c8102e" stroke="#00b2a9" strokeWidth="3" />
        <circle cx="50" cy="50" r="32" fill="#9e1026" />
        <text x="50" y="55" fill="#f59e0b" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          LFC
        </text>
      </svg>
    );
  }

  // Chelsea
  if (norm.includes('chelsea')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#034694" stroke="#d1d5db" strokeWidth="4" />
        <circle cx="50" cy="50" r="38" fill="#ffffff" />
        <circle cx="50" cy="50" r="32" fill="#034694" />
        <text x="50" y="55" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          CFC
        </text>
      </svg>
    );
  }

  // Tottenham
  if (norm.includes('tottenham')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#132257" stroke="#ffffff" strokeWidth="3" />
        <text x="50" y="58" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          THFC
        </text>
      </svg>
    );
  }

  // Bayern de Munique
  if (norm.includes('bayern')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#dc2626" stroke="#0066b2" strokeWidth="4" />
        <circle cx="50" cy="50" r="34" fill="#0066b2" />
        <text x="50" y="56" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          FCB
        </text>
      </svg>
    );
  }

  // Borussia Dortmund
  if (norm.includes('dortmund')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#fde047" stroke="#111111" strokeWidth="5" />
        <text x="50" y="52" fill="#111111" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          BVB
        </text>
        <text x="50" y="66" fill="#111111" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
          09
        </text>
      </svg>
    );
  }

  // Bayer Leverkusen
  if (norm.includes('leverkusen')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#111111" stroke="#dc2626" strokeWidth="5" />
        <text x="50" y="56" fill="#dc2626" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          B04
        </text>
      </svg>
    );
  }

  // Atlético de Madrid
  if (norm.includes('atlético de madrid') || norm.includes('atletico de madrid')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#2563eb" stroke="#dc2626" strokeWidth="4" />
        <rect x="25" y="35" width="10" height="45" fill="#ffffff" />
        <rect x="45" y="35" width="10" height="45" fill="#ffffff" />
        <rect x="65" y="35" width="10" height="45" fill="#ffffff" />
        <text x="50" y="28" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          ATM
        </text>
      </svg>
    );
  }

  // Milan
  if (norm.includes('milan')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <ellipse cx="50" cy="50" rx="38" ry="46" fill="#ffffff" stroke="#111111" strokeWidth="4" />
        <rect x="24" y="15" width="12" height="70" fill="#dc2626" />
        <rect x="36" y="15" width="12" height="70" fill="#111111" />
        <text x="50" y="12" fill="#111111" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          ACM
        </text>
      </svg>
    );
  }

  // Inter de Milão
  if (norm.includes('inter de milão') || norm.includes('inter de milao')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#001854" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="50" cy="50" r="36" fill="#111111" />
        <text x="50" y="57" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          IM
        </text>
      </svg>
    );
  }

  // Juventus
  if (norm.includes('juventus')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#111111" stroke="#ffffff" strokeWidth="4" />
        <path d="M40 30 L40 65 C40 75 48 75 48 65 L48 30 Z" fill="#ffffff" />
        <path d="M60 30 L60 55 C60 62 65 62 65 55 L65 30 Z" fill="#ffffff" />
      </svg>
    );
  }

  // PSG
  if (norm.includes('psg')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#004170" stroke="#da291c" strokeWidth="4" />
        <circle cx="50" cy="50" r="34" fill="#ffffff" />
        <circle cx="50" cy="50" r="26" fill="#da291c" />
        <text x="50" y="55" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          PSG
        </text>
      </svg>
    );
  }

  // Al Nassr
  if (norm.includes('al nassr') || norm.includes('nassr')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#facc15" stroke="#1d4ed8" strokeWidth="4" />
        <text x="50" y="55" fill="#1d4ed8" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          CR7
        </text>
      </svg>
    );
  }

  // Al Hilal
  if (norm.includes('al hilal') || norm.includes('hilal')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#1d4ed8" stroke="#ffffff" strokeWidth="4" />
        <text x="50" y="55" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          HILAL
        </text>
      </svg>
    );
  }

  // River Plate
  if (norm.includes('river')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#111111" strokeWidth="3" />
        <path d="M15 35 L75 95 L85 85 L25 25 Z" fill="#dc2626" />
        <text x="50" y="56" fill="#111111" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          CARP
        </text>
      </svg>
    );
  }

  // Peñarol
  if (norm.includes('peñarol') || norm.includes('penarol')) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
        <path d="M50 5 L88 20 C88 65 50 95 50 95 C50 95 12 65 12 20 Z" fill="#111111" stroke="#facc15" strokeWidth="4" />
        <rect x="25" y="30" width="10" height="50" fill="#facc15" />
        <rect x="45" y="30" width="10" height="50" fill="#facc15" />
        <rect x="65" y="30" width="10" height="50" fill="#facc15" />
      </svg>
    );
  }

  // Fallback padrão com iniciais
  const initials = teamName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="46" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="4" />
      <circle cx="50" cy="50" r="40" fill="var(--purple-primary)" opacity="0.3" />
      <text
        x="50"
        y="58"
        fill="#ffffff"
        fontSize="32"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}
