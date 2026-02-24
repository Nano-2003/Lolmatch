import React, { useEffect } from 'react';
import styles from '../styles/GameForm.module.css';
import { LANES, RESULTS } from '../constants/gameData';
import { Clock, Sword, UserX, MessageSquare, Target, Trophy } from 'lucide-react';

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

export default function GameForm({ onSubmit, editingGame, onCancel, showOverlay, formValues, setFormValues }) {
  useEffect(() => {
    if (editingGame) {
      setFormValues(editingGame);
    }
  }, [editingGame, setFormValues]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value);
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
