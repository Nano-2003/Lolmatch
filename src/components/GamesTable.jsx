import React, { useState } from 'react';
import styles from '../styles/GamesTable.module.css';
import { RESULTS, getChampionImg } from '../constants/gameData';
import { MessageSquare, Clock, Target, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function GamesTable({ games, onEdit, onDelete, onChampClick }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const getResultLabel = (val) => {
    const res = RESULTS.find(r => r.value === val);
    return res ? res.label : val;
  };

  const getResultColor = (val) => {
    const res = RESULTS.find(r => r.value === val);
    return res ? res.color : 'inherit';
  };

  const calculateKDA = (k, d, a) => {
    if (d === 0) return (k + a).toFixed(1);
    return ((k + a) / d).toFixed(2);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Campeón</th>
            <th>KDA / CS</th>
            <th>Línea</th>
            <th>Oponente</th>
            <th>Estado</th>
            <th style={{ textAlign: 'center' }}>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, idx) => (
            <React.Fragment key={idx}>
              <tr className={expandedIdx === idx ? styles.expandedRow : ''}>
                <td>
                  <div className={`${styles.champCell} ${styles.clickable}`} onClick={() => onChampClick(game.champion)}>
                    <img
                      src={getChampionImg(game.champion)}
                      alt={game.champion}
                      className={styles.champIcon}
                    />
                    <span>{game.champion}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.statsCell}>
                    <div className={styles.kdaText}>
                      <span className={styles.kills}>{game.kills || 0}</span> /
                      <span className={styles.deaths}>{game.deaths || 0}</span> /
                      <span className={styles.assists}>{game.assists || 0}</span>
                    </div>
                    <div className={styles.ratioText}>
                      {calculateKDA(game.kills || 0, game.deaths || 0, game.assists || 0)} KDA
                    </div>
                    <div className={styles.csText}>
                      <Target size={12} /> {game.cs || 0} CS
                    </div>
                  </div>
                </td>
                <td>
                  {game.lane && laneIcons[game.lane] && (
                    <img
                      src={laneIcons[game.lane]}
                      alt={game.lane}
                      title={game.lane}
                      className={styles.laneIconImg}
                    />
                  )}
                </td>
                <td>
                  <div className={styles.champCell}>
                    <img
                      src={getChampionImg(game.opponent)}
                      alt={game.opponent}
                      className={styles.champIcon}
                    />
                    <span>{game.opponent}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                  <div style={{ color: getResultColor(game.result) }}>{getResultLabel(game.result)}</div>
                  {game.isRanked && (
                    <div className={styles.lpTag} style={{ color: (game.lpChange >= 0 ? '#4ade80' : '#f87171') }}>
                      <Trophy size={10} /> {game.lpChange > 0 ? '+' : ''}{game.lpChange} LP
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className={styles.expandBtn}
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    {expandedIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </td>
                <td className={styles.actionsCell}>
                  <button className={styles.editBtn} onClick={() => onEdit(idx)}>Editar</button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(idx)}>Borrar</button>
                </td>
              </tr>
              <AnimatePresence>
                {expandedIdx === idx && (
                  <tr>
                    <td colSpan="7" style={{ padding: 0 }}>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.detailsContent}
                      >
                        <div className={styles.detailsGrid}>
                          <div className={styles.detailItem}>
                            <div className={styles.detailLabel}><Clock size={14} /> Duración</div>
                            <div className={styles.detailValue}>{game.duration || '--:--'}</div>
                          </div>
                          <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                            <div className={styles.detailLabel}><MessageSquare size={14} /> Tip del Matchup</div>
                            <div className={styles.tipText}>{game.matchupTip || 'Sin consejos guardados para este enfrentamiento.'}</div>
                          </div>
                          <div className={styles.detailItem} style={{ gridColumn: 'span 3' }}>
                            <div className={styles.detailLabel}>Nota de la Partida</div>
                            <div className={styles.noteText}>{game.note || 'Sin nota.'}</div>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
