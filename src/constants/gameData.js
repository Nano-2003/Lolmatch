export const LANES = ['Top', 'Jungla', 'Mid', 'ADC', 'Soporte'];

export const RESULTS = [
  { value: 'gane_paliza', label: 'Gané de paliza', color: '#4ade80' },
  { value: 'gane_mal', label: 'Gané mal', color: '#a3e635' },
  { value: 'perdi_bien', label: 'Perdí jugando bien', color: '#fbbf24' },
  { value: 'perdi_paliza', label: 'Perdí de paliza', color: '#f87171' }
];

export const DDRAGON_VERSION = '14.4.1'; // Fallback version
export const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';

export const getChampionImg = (champId) => `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/img/champion/${champId}.png`;
export const getChampionDataUrl = (lang = 'es_ES') => `${DDRAGON_BASE_URL}/${DDRAGON_VERSION}/data/${lang}/champion.json`;
