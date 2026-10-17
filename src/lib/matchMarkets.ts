import { Match, MarketOdd } from '@/data/mockMatches';

export interface MarketOptionItem {
  id: string;
  category: string;
  categoryLabel: string;
  label: string;
  odd: number;
}

export interface MatchExpandedMarkets {
  winner: MarketOptionItem[];
  doubleChance?: MarketOptionItem[];
  btts?: MarketOptionItem[];
  totals: MarketOptionItem[];
  firstHalf?: MarketOptionItem[];
  handicap?: MarketOptionItem[];
  corners?: MarketOptionItem[];
  cards?: MarketOptionItem[];
  players?: MarketOptionItem[];
  exactScores?: MarketOptionItem[];
}

// Marcadores e estrelas conhecidas por equipe
const STAR_PLAYERS_MAP: { [teamKeyword: string]: Array<{ name: string; odd: number }> } = {
  flamengo: [
    { name: 'Pedro (Marca a qualquer momento)', odd: 2.10 },
    { name: 'Gabi / Bruno Henrique', odd: 2.75 },
    { name: 'Arrascaeta', odd: 3.40 },
  ],
  palmeiras: [
    { name: 'Estêvão (Marca a qualquer momento)', odd: 2.50 },
    { name: 'Flaco López', odd: 2.30 },
    { name: 'Raphael Veiga', odd: 3.10 },
  ],
  botafogo: [
    { name: 'Igor Jesus (Marca a qualquer momento)', odd: 2.25 },
    { name: 'Luiz Henrique', odd: 2.70 },
    { name: 'Jefferson Savarino', odd: 3.30 },
  ],
  'são paulo': [
    { name: 'Jonathan Calleri (Marca a qualquer momento)', odd: 2.20 },
    { name: 'Lucas Moura', odd: 2.90 },
    { name: 'Luciano', odd: 2.80 },
  ],
  sao: [
    { name: 'Jonathan Calleri (Marca a qualquer momento)', odd: 2.20 },
    { name: 'Lucas Moura', odd: 2.90 },
  ],
  corinthians: [
    { name: 'Yuri Alberto (Marca a qualquer momento)', odd: 2.40 },
    { name: 'Memphis Depay', odd: 2.35 },
    { name: 'Rodrigo Garro', odd: 3.80 },
  ],
  vasco: [
    { name: 'Pablo Vegetti (Marca a qualquer momento)', odd: 2.50 },
    { name: 'Dimitri Payet', odd: 3.60 },
  ],
  internacional: [
    { name: 'Rafael Borré (Marca a qualquer momento)', odd: 2.45 },
    { name: 'Alan Patrick', odd: 3.20 },
  ],
  'atlético-mg': [
    { name: 'Hulk (Marca a qualquer momento)', odd: 2.15 },
    { name: 'Paulinho', odd: 2.40 },
    { name: 'Gustavo Scarpa', odd: 3.50 },
  ],
  atletico: [
    { name: 'Hulk (Marca a qualquer momento)', odd: 2.15 },
    { name: 'Paulinho', odd: 2.40 },
  ],
  cruzeiro: [
    { name: 'Kaio Jorge (Marca a qualquer momento)', odd: 2.50 },
    { name: 'Matheus Pereira', odd: 3.10 },
  ],
  grêmio: [
    { name: 'Martin Braithwaite (Marca a qualquer momento)', odd: 2.40 },
    { name: 'Franco Cristaldo', odd: 3.30 },
  ],
  gremio: [
    { name: 'Martin Braithwaite (Marca a qualquer momento)', odd: 2.40 },
    { name: 'Franco Cristaldo', odd: 3.30 },
  ],
  fluminense: [
    { name: 'Germán Cano (Marca a qualquer momento)', odd: 2.30 },
    { name: 'Jhon Arias', odd: 3.10 },
    { name: 'Ganso', odd: 4.50 },
  ],
  bahia: [
    { name: 'Everaldo (Marca a qualquer momento)', odd: 2.80 },
    { name: 'Cauly', odd: 3.60 },
    { name: 'Everton Ribeiro', odd: 4.20 },
  ],
  liverpool: [
    { name: 'Mohamed Salah (Marca a qualquer momento)', odd: 1.95 },
    { name: 'Luis Díaz', odd: 2.60 },
    { name: 'Darwin Núñez', odd: 2.35 },
  ],
  chelsea: [
    { name: 'Cole Palmer (Marca a qualquer momento)', odd: 2.40 },
    { name: 'Nicolas Jackson', odd: 2.65 },
  ],
  'manchester city': [
    { name: 'Erling Haaland (Marca a qualquer momento)', odd: 1.45 },
    { name: 'Phil Foden', odd: 2.70 },
    { name: 'Kevin De Bruyne', odd: 3.10 },
  ],
  arsenal: [
    { name: 'Bukayo Saka (Marca a qualquer momento)', odd: 2.35 },
    { name: 'Kai Havertz', odd: 2.50 },
  ],
  'real madrid': [
    { name: 'Kylian Mbappé (Marca a qualquer momento)', odd: 1.75 },
    { name: 'Vinicius Jr', odd: 1.95 },
    { name: 'Jude Bellingham', odd: 2.60 },
  ],
  barcelona: [
    { name: 'Robert Lewandowski (Marca a qualquer momento)', odd: 1.75 },
    { name: 'Lamine Yamal', odd: 2.50 },
    { name: 'Raphinha', odd: 2.30 },
  ],
  bayern: [
    { name: 'Harry Kane (Marca a qualquer momento)', odd: 1.55 },
    { name: 'Jamal Musiala', odd: 2.60 },
  ],
  celtics: [
    { name: 'Jayson Tatum (Mais de 26.5 Pontos)', odd: 1.85 },
    { name: 'Jaylen Brown (Mais de 22.5 Pontos)', odd: 1.88 },
  ],
  lakers: [
    { name: 'LeBron James (Mais de 23.5 Pontos)', odd: 1.85 },
    { name: 'Anthony Davis (Mais de 24.5 Pontos)', odd: 1.82 },
  ],
  chiefs: [
    { name: 'Patrick Mahomes (2+ Passes p/ Touchdown)', odd: 1.70 },
    { name: 'Travis Kelce (Anota Touchdown)', odd: 2.10 },
  ],
  packers: [
    { name: 'Jordan Love (2+ Passes p/ Touchdown)', odd: 1.80 },
    { name: 'Josh Jacobs (Anota Touchdown)', odd: 1.95 },
  ],
};

/**
 * Retorna todos os mercados detalhados e expandidos para um determinado jogo
 */
export function getExpandedMarkets(match: Match): MatchExpandedMarkets {
  const isSoccer = match.sport === 'futebol';
  const hasDraw = !!match.markets.winner.draw;
  const homeOdd = match.markets.winner.home.odd;
  const awayOdd = match.markets.winner.away.odd;
  const drawOdd = match.markets.winner.draw?.odd || 3.20;

  // 1. Resultado Final
  const winner: MarketOptionItem[] = [
    {
      id: `${match.id}-res-home`,
      category: 'winner',
      categoryLabel: hasDraw ? 'Resultado Final' : 'Vencedor do Jogo',
      label: `${match.homeTeam} Vence`,
      odd: homeOdd,
    },
  ];

  if (hasDraw && match.markets.winner.draw) {
    winner.push({
      id: `${match.id}-res-draw`,
      category: 'winner',
      categoryLabel: 'Resultado Final',
      label: 'Empate',
      odd: drawOdd,
    });
  }

  winner.push({
    id: `${match.id}-res-away`,
    category: 'winner',
    categoryLabel: hasDraw ? 'Resultado Final' : 'Vencedor do Jogo',
    label: `${match.awayTeam} Vence`,
    odd: awayOdd,
  });

  // 2. Dupla Chance (Apenas esportes com empate)
  let doubleChance: MarketOptionItem[] | undefined;
  if (hasDraw) {
    const dc1X = parseFloat((1 / (1 / homeOdd + 1 / drawOdd) * 0.95).toFixed(2));
    const dc12 = parseFloat((1 / (1 / homeOdd + 1 / awayOdd) * 0.95).toFixed(2));
    const dcX2 = parseFloat((1 / (1 / drawOdd + 1 / awayOdd) * 0.95).toFixed(2));

    doubleChance = [
      {
        id: `${match.id}-dc-1x`,
        category: 'doubleChance',
        categoryLabel: 'Dupla Chance',
        label: `1X (${match.homeTeam} ou Empate)`,
        odd: Math.max(1.10, Math.min(dc1X, 2.50)),
      },
      {
        id: `${match.id}-dc-12`,
        category: 'doubleChance',
        categoryLabel: 'Dupla Chance',
        label: `12 (${match.homeTeam} ou ${match.awayTeam})`,
        odd: Math.max(1.12, Math.min(dc12, 1.65)),
      },
      {
        id: `${match.id}-dc-x2`,
        category: 'doubleChance',
        categoryLabel: 'Dupla Chance',
        label: `X2 (Empate ou ${match.awayTeam})`,
        odd: Math.max(1.10, Math.min(dcX2, 2.80)),
      },
    ];
  }

  // 3. Ambos Marcam (BTTS)
  let btts: MarketOptionItem[] | undefined;
  if (isSoccer) {
    const bttsYesOdd = match.markets.btts?.yes.odd || 1.85;
    const bttsNoOdd = match.markets.btts?.no.odd || 1.95;
    btts = [
      {
        id: `${match.id}-btts-yes`,
        category: 'btts',
        categoryLabel: 'Ambos os Times Marcam',
        label: 'Ambos Marcam: Sim',
        odd: bttsYesOdd,
      },
      {
        id: `${match.id}-btts-no`,
        category: 'btts',
        categoryLabel: 'Ambos os Times Marcam',
        label: 'Ambos Marcam: Não',
        odd: bttsNoOdd,
      },
    ];
  }

  // 4. Totais (Gols, Pontos, Games ou Mapas)
  const totals: MarketOptionItem[] = [];
  if (isSoccer) {
    totals.push(
      {
        id: `${match.id}-tot-o15`,
        category: 'totals',
        categoryLabel: 'Total de Gols',
        label: 'Mais de 1.5 Gols',
        odd: 1.30,
      },
      {
        id: `${match.id}-tot-u15`,
        category: 'totals',
        categoryLabel: 'Total de Gols',
        label: 'Menos de 1.5 Gols',
        odd: 3.20,
      },
      {
        id: `${match.id}-tot-o25`,
        category: 'totals',
        categoryLabel: 'Total de Gols',
        label: 'Mais de 2.5 Gols',
        odd: match.markets.goals?.over25.odd || 1.90,
      },
      {
        id: `${match.id}-tot-u25`,
        category: 'totals',
        categoryLabel: 'Total de Gols',
        label: 'Menos de 2.5 Gols',
        odd: match.markets.goals?.under25.odd || 1.90,
      },
      {
        id: `${match.id}-tot-o35`,
        category: 'totals',
        categoryLabel: 'Total de Gols',
        label: 'Mais de 3.5 Gols',
        odd: 3.10,
      },
      {
        id: `${match.id}-tot-u35`,
        category: 'totals',
        categoryLabel: 'Total de Gols',
        label: 'Menos de 3.5 Gols',
        odd: 1.33,
      }
    );
  } else if (match.markets.goals) {
    const label = match.markets.goals.label || 'Total';
    totals.push(
      {
        id: `${match.id}-tot-over`,
        category: 'totals',
        categoryLabel: label,
        label: match.markets.goals.over25.label,
        odd: match.markets.goals.over25.odd,
      },
      {
        id: `${match.id}-tot-under`,
        category: 'totals',
        categoryLabel: label,
        label: match.markets.goals.under25.label,
        odd: match.markets.goals.under25.odd,
      }
    );
  }

  // 5. Primeiro Tempo HT (1X2 HT e Gols 1T)
  let firstHalf: MarketOptionItem[] | undefined;
  if (isSoccer) {
    const htHomeOdd = Number((homeOdd * 1.35).toFixed(2));
    const htDrawOdd = Number(Math.max(1.85, Math.min(2.35, drawOdd * 0.70)).toFixed(2));
    const htAwayOdd = Number((awayOdd * 1.35).toFixed(2));

    firstHalf = [
      {
        id: `${match.id}-ht-home`,
        category: 'firstHalf',
        categoryLabel: '1º Tempo (HT)',
        label: `${match.homeTeam} Vence o 1º Tempo`,
        odd: htHomeOdd,
      },
      {
        id: `${match.id}-ht-draw`,
        category: 'firstHalf',
        categoryLabel: '1º Tempo (HT)',
        label: 'Empate no 1º Tempo',
        odd: htDrawOdd,
      },
      {
        id: `${match.id}-ht-away`,
        category: 'firstHalf',
        categoryLabel: '1º Tempo (HT)',
        label: `${match.awayTeam} Vence o 1º Tempo`,
        odd: htAwayOdd,
      },
      {
        id: `${match.id}-1t-o05`,
        category: 'firstHalf',
        categoryLabel: 'Total de Gols 1º Tempo',
        label: 'Mais de 0.5 Gols no 1º Tempo',
        odd: 1.42,
      },
      {
        id: `${match.id}-1t-u05`,
        category: 'firstHalf',
        categoryLabel: 'Total de Gols 1º Tempo',
        label: 'Menos de 0.5 Gols no 1º Tempo',
        odd: 2.70,
      },
      {
        id: `${match.id}-1t-o15`,
        category: 'firstHalf',
        categoryLabel: 'Total de Gols 1º Tempo',
        label: 'Mais de 1.5 Gols no 1º Tempo',
        odd: 2.85,
      },
      {
        id: `${match.id}-1t-u15`,
        category: 'firstHalf',
        categoryLabel: 'Total de Gols 1º Tempo',
        label: 'Menos de 1.5 Gols no 1º Tempo',
        odd: 1.38,
      },
    ];
  }

  // 6. Handicap Asiático e Europeu
  let handicap: MarketOptionItem[] | undefined;
  if (isSoccer) {
    const hcapHomeMinus15 = Number((homeOdd * 1.55).toFixed(2));
    const hcapAwayPlus15 = Number(Math.max(1.22, 1 / (1 - 1 / hcapHomeMinus15) * 0.95).toFixed(2));

    const hcapHomeMinus05 = homeOdd;
    const hcapAwayPlus05 = Number(Math.max(1.15, (1 / (1 / awayOdd + 1 / drawOdd) * 0.95)).toFixed(2));

    handicap = [
      {
        id: `${match.id}-hcap-h15`,
        category: 'handicap',
        categoryLabel: 'Handicap Asiático',
        label: `${match.homeTeam} (-1.5)`,
        odd: hcapHomeMinus15,
      },
      {
        id: `${match.id}-hcap-a15`,
        category: 'handicap',
        categoryLabel: 'Handicap Asiático',
        label: `${match.awayTeam} (+1.5)`,
        odd: hcapAwayPlus15,
      },
      {
        id: `${match.id}-hcap-h05`,
        category: 'handicap',
        categoryLabel: 'Handicap Asiático',
        label: `${match.homeTeam} (-0.5)`,
        odd: hcapHomeMinus05,
      },
      {
        id: `${match.id}-hcap-a05`,
        category: 'handicap',
        categoryLabel: 'Handicap Asiático',
        label: `${match.awayTeam} (+0.5)`,
        odd: hcapAwayPlus05,
      },
    ];
  }

  // 6. Escanteios (Futebol)
  let corners: MarketOptionItem[] | undefined;
  if (isSoccer) {
    corners = [
      {
        id: `${match.id}-crn-o85`,
        category: 'corners',
        categoryLabel: 'Escanteios',
        label: 'Mais de 8.5 Escanteios',
        odd: 1.55,
      },
      {
        id: `${match.id}-crn-o95`,
        category: 'corners',
        categoryLabel: 'Escanteios',
        label: 'Mais de 9.5 Escanteios',
        odd: 1.88,
      },
      {
        id: `${match.id}-crn-o105`,
        category: 'corners',
        categoryLabel: 'Escanteios',
        label: 'Mais de 10.5 Escanteios',
        odd: 2.30,
      },
    ];
  }

  // 7. Cartões (Futebol)
  let cards: MarketOptionItem[] | undefined;
  if (isSoccer) {
    cards = [
      {
        id: `${match.id}-crd-o35`,
        category: 'cards',
        categoryLabel: 'Cartões',
        label: 'Mais de 3.5 Cartões',
        odd: 1.68,
      },
      {
        id: `${match.id}-crd-o45`,
        category: 'cards',
        categoryLabel: 'Cartões',
        label: 'Mais de 4.5 Cartões',
        odd: 2.15,
      },
    ];
  }

  // 8. Jogadores Destaque (Marcadores / Estatísticas)
  let players: MarketOptionItem[] | undefined;
  const homeKey = Object.keys(STAR_PLAYERS_MAP).find(k => match.homeTeam.toLowerCase().includes(k));
  const awayKey = Object.keys(STAR_PLAYERS_MAP).find(k => match.awayTeam.toLowerCase().includes(k));
  const playerList = [
    ...(homeKey ? STAR_PLAYERS_MAP[homeKey] : []),
    ...(awayKey ? STAR_PLAYERS_MAP[awayKey] : []),
  ];

  if (playerList.length > 0) {
    players = playerList.map((p, idx) => ({
      id: `${match.id}-ply-${idx}`,
      category: 'players',
      categoryLabel: isSoccer ? 'Marcador de Gol' : 'Estatísticas de Jogadores',
      label: p.name,
      odd: p.odd,
    }));
  } else if (isSoccer) {
    players = [
      {
        id: `${match.id}-ply-1`,
        category: 'players',
        categoryLabel: 'Marcador de Gol',
        label: `Artilheiro do ${match.homeTeam.split(' ')[0]} marca`,
        odd: 2.60,
      },
      {
        id: `${match.id}-ply-2`,
        category: 'players',
        categoryLabel: 'Marcador de Gol',
        label: `Camisa 9 do ${match.awayTeam.split(' ')[0]} marca`,
        odd: 2.80,
      },
    ];
  }

  // 9. Placar Exato (Futebol)
  let exactScores: MarketOptionItem[] | undefined;
  if (isSoccer) {
    exactScores = [
      { id: `${match.id}-scr-10`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '1 - 0', odd: 6.50 },
      { id: `${match.id}-scr-20`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '2 - 0', odd: 7.20 },
      { id: `${match.id}-scr-21`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '2 - 1', odd: 8.50 },
      { id: `${match.id}-scr-11`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '1 - 1', odd: 5.80 },
      { id: `${match.id}-scr-00`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '0 - 0', odd: 8.00 },
      { id: `${match.id}-scr-01`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '0 - 1', odd: 7.50 },
      { id: `${match.id}-scr-02`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '0 - 2', odd: 11.00 },
      { id: `${match.id}-scr-12`, category: 'exactScores', categoryLabel: 'Placar Exato', label: '1 - 2', odd: 9.50 },
    ];
  }

  return {
    winner,
    doubleChance,
    btts,
    totals,
    firstHalf,
    handicap,
    corners,
    cards,
    players,
    exactScores,
  };
}

/**
 * Cálculo da cotação combinada no Criar Aposta (Bet Builder estilo Betano)
 * Considera correlação entre seleções da mesma partida
 */
export function calculateBuilderOdds(selections: MarketOptionItem[]): number {
  if (selections.length === 0) return 1.0;
  if (selections.length === 1) return selections[0].odd;

  // Multiplicação com fator de correlação da Betano (~0.90 por perna adicional)
  const product = selections.reduce((acc, curr) => acc * curr.odd, 1);
  const correlationFactor = Math.pow(0.91, selections.length - 1);
  const combined = product * correlationFactor;

  // Garante que a odd combinada seja no mínimo 15% superior à maior odd selecionada
  const maxSingleOdd = Math.max(...selections.map(s => s.odd));
  const finalOdd = Math.max(combined, maxSingleOdd * 1.18);

  return parseFloat(finalOdd.toFixed(2));
}
