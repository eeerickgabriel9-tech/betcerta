// =========================================================================
// SERVIÇO OFICIAL THE ODDS API — BETCERTA
// Integração direta com a API: https://api.the-odds-api.com/v4/
// Chave da Banca: 214db3becf7831f0ede7e7bbf4fb0ddb
// =========================================================================

import { Match } from '@/data/mockMatches';

export const THE_ODDS_API_KEY = '214db3becf7831f0ede7e7bbf4fb0ddb';
export const BASE_URL = 'https://api.the-odds-api.com/v4';

export interface TheOddsApiMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: 'h2h' | 'totals' | 'spreads';
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}

/**
 * Converte o horário UTC da The Odds API para o formato de data brasileiro
 * Exemplos: "Hoje, 16:00", "Amanhã, 20:00", "Dom 18/10, 16:00", "Seg 19/10, 20:00"
 */
export function formatToBrazilDate(utcString: string): string {
  const dateUtc = new Date(utcString);
  // Horário oficial de Brasília (UTC-3)
  const d = new Date(dateUtc.getTime() - 3 * 60 * 60 * 1000);

  const now = new Date();
  const nowBr = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  const dMidnight = new Date(d);
  dMidnight.setHours(0, 0, 0, 0);
  const nowMidnight = new Date(nowBr);
  nowMidnight.setHours(0, 0, 0, 0);

  const daysDiff = Math.round((dMidnight.getTime() - nowMidnight.getTime()) / (1000 * 60 * 60 * 24));

  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayOfWeek = weekDays[d.getUTCDay()];
  const dayOfMonth = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');

  if (daysDiff === 0) {
    return `Hoje, ${timeStr}`;
  } else if (daysDiff === 1) {
    return `Amanhã, ${timeStr}`;
  } else {
    return `${dayOfWeek} ${dayOfMonth}/${month}, ${timeStr}`;
  }
}

/**
 * Mapeia o sport_key da The Odds API para os metadados do BetCerta
 */
export function getLeagueMetadata(sportKey: string) {
  const map: Record<string, { league: string; leagueKey: string; leagueIcon: string; sport: Match['sport'] }> = {
    soccer_brazil_campeonato: { league: 'Brasileirão Série A', leagueKey: 'brasileirao', leagueIcon: '🇧🇷', sport: 'futebol' },
    soccer_brazil_serie_b: { league: 'Brasileirão Série B', leagueKey: 'serie-b', leagueIcon: '🇧🇷', sport: 'futebol' },
    soccer_epl: { league: 'Premier League', leagueKey: 'premier-league', leagueIcon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sport: 'futebol' },
    soccer_spain_la_liga: { league: 'La Liga', leagueKey: 'la-liga', leagueIcon: '🇪🇸', sport: 'futebol' },
    soccer_italy_serie_a: { league: 'Serie A Italiana', leagueKey: 'serie-a', leagueIcon: '🇮🇹', sport: 'futebol' },
    soccer_germany_bundesliga: { league: 'Bundesliga', leagueKey: 'bundesliga', leagueIcon: '🇩🇪', sport: 'futebol' },
    soccer_france_ligue_one: { league: 'Ligue 1', leagueKey: 'ligue-1', leagueIcon: '🇫🇷', sport: 'futebol' },
    soccer_uefa_champs_league: { league: 'UEFA Champions League', leagueKey: 'champions-league', leagueIcon: '🏆', sport: 'futebol' },
    soccer_uefa_europa_league: { league: 'UEFA Europa League', leagueKey: 'europa-league', leagueIcon: '🇪🇺', sport: 'futebol' },
    soccer_conmebol_copa_libertadores: { league: 'Copa Libertadores', leagueKey: 'libertadores', leagueIcon: '🌎', sport: 'futebol' },
    soccer_conmebol_copa_sudamericana: { league: 'Copa Sudamericana', leagueKey: 'sul-americana', leagueIcon: '🌎', sport: 'futebol' },
    soccer_portugal_primeira_liga: { league: 'Liga Portugal', leagueKey: 'liga-portugal', leagueIcon: '🇵🇹', sport: 'futebol' },
    soccer_netherlands_eredivisie: { league: 'Eredivisie Holandesa', leagueKey: 'eredivisie', leagueIcon: '🇳🇱', sport: 'futebol' },
    soccer_turkey_super_league: { league: 'Süper Lig Turca', leagueKey: 'super-lig', leagueIcon: '🇹🇷', sport: 'futebol' },
    soccer_saudi_arabia_pro_league: { league: 'Saudi Pro League', leagueKey: 'saudi-pro-league', leagueIcon: '🇸🇦', sport: 'futebol' },
    soccer_argentina_primera_division: { league: 'Liga Profesional Argentina', leagueKey: 'liga-argentina', leagueIcon: '🇦🇷', sport: 'futebol' },
    soccer_mexico_ligamx: { league: 'Liga MX México', leagueKey: 'liga-mx', leagueIcon: '🇲🇽', sport: 'futebol' },
    soccer_usa_mls: { league: 'Major League Soccer', leagueKey: 'mls', leagueIcon: '🇺🇸', sport: 'futebol' },
    soccer_efl_champ: { league: 'EFL Championship', leagueKey: 'championship', leagueIcon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sport: 'futebol' },
    basketball_nba: { league: 'NBA', leagueKey: 'nba', leagueIcon: '🏀', sport: 'basquete' },
    basketball_euroleague: { league: 'EuroLeague', leagueKey: 'euroleague', leagueIcon: '🏀', sport: 'basquete' },
    americanfootball_nfl: { league: 'NFL', leagueKey: 'nfl', leagueIcon: '🏈', sport: 'futebol-americano' },
    tennis_atp_shanghai_masters: { league: 'ATP Masters', leagueKey: 'atp', leagueIcon: '🎾', sport: 'tenis' },
    tennis_wta_wuhan_open: { league: 'WTA 1000', leagueKey: 'wta', leagueIcon: '🎾', sport: 'tenis' },
  };

  return map[sportKey] || {
    league: 'Competição Oficial',
    leagueKey: 'geral',
    leagueIcon: '⚽',
    sport: 'futebol' as Match['sport']
  };
}

/**
 * Busca partidas em tempo real para uma liga específica
 */
export async function fetchLiveOddsForSport(sportKey: string): Promise<TheOddsApiMatch[]> {
  const url = `${BASE_URL}/sports/${sportKey}/odds/?apiKey=${THE_ODDS_API_KEY}&regions=eu&markets=h2h,totals`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Falha ao consultar The Odds API: ${res.statusText}`);
  }
  return res.json();
}
