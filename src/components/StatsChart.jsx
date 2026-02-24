import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { RESULTS } from '../constants/gameData';
import { Trophy, Frown, BarChart3, TrendingUp } from 'lucide-react';

export default function StatsChart({ games }) {
  // Agrupar por resultado
  const resultData = RESULTS.map(r => ({
    name: r.label,
    value: games.filter(g => g.result === r.value).length,
    color: r.color
  })).filter(d => d.value > 0);

  // Winrate por campeón oponente (Matchup Intelligence)
  const getMatchupData = () => {
    const matchups = {};
    games.forEach(g => {
      if (!matchups[g.opponent]) matchups[g.opponent] = { total: 0, wins: 0 };
      matchups[g.opponent].total++;
      if (g.result && g.result.startsWith('gane')) matchups[g.opponent].wins++;
    });

    return Object.entries(matchups)
      .map(([name, stats]) => ({
        opponent: name,
        winrate: Math.round((stats.wins / stats.total) * 100),
        partidas: stats.total
      }))
      .sort((a, b) => b.partidas - a.partidas)
      .slice(0, 5); // Top 5 matchups
  };

  const matchupData = getMatchupData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0, color: payload[0].fill }}>{payload[0].name}: {payload[0].value}{payload[0].unit || ''}</p>
        </div>
      );
    }
    return null;
  };

  if (games.length === 0) return null;

  return (
    <div style={{ margin: '24px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 15, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <BarChart3 size={20} color="#00aaff" />
        <h3 style={{ margin: 0 }}>Análisis de Rendimiento</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ height: 250 }}>
          <h4 style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888', marginBottom: 10 }}>Distribución de Resultados</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resultData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" hide />
              <YAxis allowDecimals={false} strike="rgba(255,255,255,0.1)" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Partidas">
                {resultData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ height: 250 }}>
          <h4 style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888', marginBottom: 10 }}>Top Matchups (% Winrate)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={matchupData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="opponent" type="category" width={80} tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="winrate" fill="#00aaff" name="Winrate" unit="%" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
