import React, { useEffect, useMemo } from 'react';
import styles from '../styles/GameForm.module.css';
import { LANES, RESULTS } from '../constants/gameData';
import { Clock, Sword, UserX, MessageSquare, Target, Trophy, Sparkles, Gauge, ShieldAlert, Flag } from 'lucide-react';

import topIcon from '../assets/roles/top.png';
import jungleIcon from '../assets/roles/jungle.png';
import midIcon from '../assets/roles/mid.png';
import adcIcon from '../assets/roles/adc.png';
import supportIcon from '../assets/roles/support.png';

const laneIcons = {
  Top: topIcon,
  Jungla: jungleIcon,
  Mid: midIcon,
  ADC: adcIcon,
  Soporte: supportIcon,
};

export default function GameForm({ onSubmit, editingGame, onCancel, showOverlay, formValues, setFormValues, games }) {
  useEffect(() => {
    if (editingGame) {
      setFormValues(editingGame);
    }
  }, [editingGame, setFormValues]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value);
    setFormValues({ ...formValues, [name]: finalValue });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!formValues.champion || !formValues.lane || !formValues.opponent || !formValues.result) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    onSubmit(formValues);
  };

  const aiInsight = useMemo(() => {
    const champion = formValues.champion?.trim().toLowerCase();
    if (!champion || !Array.isArray(games) || games.length === 0) return null;

    const championGames = games.filter(g => g.champion?.trim().toLowerCase() === champion);
    if (championGames.length < 2) {
      return {
        type: 'info',
        headline: 'Aún hay poca data para este campeón',
        recommendation: 'Registra al menos 2 partidas más para recibir recomendaciones confiables.',
      };
    }

    const wins = championGames.filter(g => g.result?.startsWith('gane')).length;
    const winrate = Math.round((wins / championGames.length) * 100);
    const avgCs = Math.round(championGames.reduce((sum, g) => sum + (g.cs || 0), 0) / championGames.length);
    const avgDeaths = +(championGames.reduce((sum, g) => sum + (g.deaths || 0), 0) / championGames.length).toFixed(1);

    const avgDurationSeconds = championGames
      .map(g => {
        const [m = 0, s = 0] = String(g.duration || '').split(':').map(n => parseInt(n, 10));
        return Number.isNaN(m) ? null : (m * 60 + (Number.isNaN(s) ? 0 : s));
      })
      .filter(v => typeof v === 'number' && !Number.isNaN(v));

    const avgDurationMin = avgDurationSeconds.length
      ? Math.round(avgDurationSeconds.reduce((a, b) => a + b, 0) / avgDurationSeconds.length / 60)
      : null;

    const csGoal = avgCs > 0 ? avgCs + 10 : null;

    const checklist = [];
    if (winrate < 50) {
      checklist.push('Juega fase de líneas más segura y evita pelear sin visión.');
    } else {
      checklist.push('Con ventaja, fuerza objetivos antes que kills sueltas.');
    }

    if (avgDeaths >= 6) {
      checklist.push('Tu promedio de muertes es alto: respeta cooldowns clave antes de tradear.');
    }

    if (csGoal) {
      checklist.push(`Meta de farmeo sugerida para esta partida: ${csGoal} CS.`);
    }

    if (avgDurationMin) {
      checklist.push(`Tus partidas suelen durar ${avgDurationMin} min; planifica pico de poder para mid game.`);
    }

    const recommendation = checklist.slice(0, 2).join(' ');

    return {
      type: winrate >= 55 ? 'positive' : 'neutral',
      headline: `${championGames.length} partidas con ${formValues.champion} · ${winrate}% WR`,
      recommendation,
      metrics: {
        winrate,
        games: championGames.length,
        avgDeaths,
        avgCs,
        avgDurationMin,
      },
      checklist,
    };
  }, [formValues.champion, games]);

  const applySuggestionToTip = () => {
    if (!aiInsight?.recommendation) return;
    setFormValues({
      ...formValues,
      matchupTip: formValues.matchupTip ? `${formValues.matchupTip} | ${aiInsight.recommendation}` : aiInsight.recommendation
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.topRow}>
        <div className={styles.rankedCheck}>
          <input
            type="checkbox"
            name="isRanked"
            id="isRanked"
            checked={formValues.isRanked || false}
            onChange={handleChange}
          />
          <label htmlFor="isRanked"><Trophy size={14} /> Partida de Ranked</label>
        </div>
        {formValues.isRanked && (
          <div className={styles.lpField}>
            <label>LP +/-:</label>
            <input
              type="number"
              name="lpChange"
              value={formValues.lpChange || 0}
              onChange={handleChange}
              placeholder="Ej: 25 o -18"
              className={styles.lpInput}
            />
          </div>
        )}
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label><Sword size={14} /> Campeón:</label>
          <input
            name="champion"
            value={formValues.champion}
            onFocus={showOverlay}
            onChange={handleChange}
            placeholder="Selecciona..."
            required
          />
        </div>
        <div className={styles.field}>
          <label><UserX size={14} /> Oponente:</label>
          <input
            name="opponent"
            value={formValues.opponent}
            onFocus={showOverlay}
            onChange={handleChange}
            placeholder="Selecciona..."
            required
          />
        </div>
      </div>

      <label>Línea:</label>
      <div className={styles.laneIconsRow}>
        {LANES.map(l => (
          <button
            key={l}
            type="button"
            className={styles.laneIconBtn + (formValues.lane === l ? ' ' + styles.selected : '')}
            onClick={() => setFormValues({ ...formValues, lane: l })}
            title={l}
          >
            <img src={laneIcons[l]} alt={l} className={styles.laneIconImg} />
          </button>
        ))}
      </div>
      <input type="hidden" name="lane" value={formValues.lane} required />

      <div className={styles.kdaSection}>
        <label>KDA & Farm:</label>
        <div className={styles.kdaGrid}>
          <input type="number" name="kills" value={formValues.kills} onChange={handleChange} placeholder="K" title="Kills" min="0" />
          <input type="number" name="deaths" value={formValues.deaths} onChange={handleChange} placeholder="D" title="Deaths" min="0" />
          <input type="number" name="assists" value={formValues.assists} onChange={handleChange} placeholder="A" title="Assists" min="0" />
          <div className={styles.csWrapper}>
            <Target size={14} className={styles.innerIcon} />
            <input type="number" name="cs" value={formValues.cs} onChange={handleChange} placeholder="CS" title="Farm" min="0" />
          </div>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label><Clock size={14} /> Duración:</label>
          <input name="duration" value={formValues.duration} onChange={handleChange} placeholder="25:30" />
        </div>
        <div className={styles.field}>
          <label>Estado:</label>
          <select name="result" value={formValues.result} onChange={handleChange} required>
            <option value="">Selecciona...</option>
            {RESULTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <label><MessageSquare size={14} /> Tip Matchup (Consejo clave):</label>

      {aiInsight && (
        <section className={`${styles.aiInsight} ${styles[aiInsight.type] || ''}`}>
          <div className={styles.aiHeader}>
            <div className={styles.aiInsightTitle}>
              <Sparkles size={14} /> Recomendación IA
            </div>
            <span className={styles.aiBadge}>{aiInsight.type === 'positive' ? 'Buen momento' : aiInsight.type === 'neutral' ? 'Ajuste fino' : 'Recolectando data'}</span>
          </div>

          <p className={styles.aiHeadline}>{aiInsight.headline}</p>

          {aiInsight.metrics && (
            <div className={styles.aiMetrics}>
              <div className={styles.metricCard}>
                <Gauge size={14} />
                <span>WR</span>
                <b>{aiInsight.metrics.winrate}%</b>
              </div>
              <div className={styles.metricCard}>
                <Flag size={14} />
                <span>CS prom.</span>
                <b>{aiInsight.metrics.avgCs}</b>
              </div>
              <div className={styles.metricCard}>
                <ShieldAlert size={14} />
                <span>Muertes prom.</span>
                <b>{aiInsight.metrics.avgDeaths}</b>
              </div>
            </div>
          )}

          <p>{aiInsight.recommendation}</p>

          {!!aiInsight.checklist?.length && (
            <ul className={styles.aiChecklist}>
              {aiInsight.checklist.slice(0, 3).map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          <button type="button" className={styles.applySuggestionBtn} onClick={applySuggestionToTip}>
            Usar recomendación en tip
          </button>
        </section>
      )}

      <textarea
        name="matchupTip"
        value={formValues.matchupTip || ''}
        onChange={handleChange}
        placeholder="Ej: Jugar safe nivel 3, baitear su R..."
        className={styles.note}
        rows={2}
      />

      <label>Nota general:</label>
      <textarea
        name="note"
        value={formValues.note || ''}
        onChange={handleChange}
        placeholder="Comentario extra..."
        className={styles.note}
        rows={1}
      />

      <div className={styles.buttons}>
        <button type="submit" className={styles.submitBtn}>{editingGame ? 'Actualizar' : 'Guardar Partida'}</button>
        {editingGame && <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancelar</button>}
      </div>
    </form>
  );
}
