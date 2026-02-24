import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Skull, Sword, UserX, Award } from 'lucide-react';
import styles from '../styles/ChampionStatsModal.module.css';
import { getChampionImg } from '../constants/gameData';

export default function ChampionStatsModal({ champion, games, onClose }) {
    if (!champion) return null;

    const stats = (() => {
        const champGames = games.filter(g => g.champion === champion);
        const total = champGames.length;
        const wins = champGames.filter(g => g.result && g.result.startsWith('gane')).length;
        const winrate = total ? Math.round((wins / total) * 100) : 0;

        const kills = champGames.reduce((sum, g) => sum + (g.kills || 0), 0);
        const deaths = champGames.reduce((sum, g) => sum + (g.deaths || 0), 0);
        const assists = champGames.reduce((sum, g) => sum + (g.assists || 0), 0);
        const kda = deaths === 0 ? (kills + assists).toFixed(1) : ((kills + assists) / deaths).toFixed(2);

        // Oponente más difícil
        const opponents = {};
        champGames.forEach(g => {
            if (!opponents[g.opponent]) opponents[g.opponent] = { total: 0, losses: 0 };
            opponents[g.opponent].total++;
            if (g.result && g.result.startsWith('perdi')) opponents[g.opponent].losses++;
        });

        const hardest = Object.entries(opponents)
            .map(([name, s]) => ({ name, lossrate: (s.losses / s.total) * 100 }))
            .sort((a, b) => b.lossrate - a.lossrate)
            .slice(0, 1)[0];

        return { total, wins, winrate, kda, kills, deaths, assists, hardest };
    })();

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

                    <div className={styles.header}>
                        <img src={getChampionImg(champion)} alt={champion} className={styles.champImg} />
                        <div>
                            <h2 className={styles.title}>{champion}</h2>
                            <p className={styles.subtitle}>Perfil de Rendimiento</p>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <TrendingUp className={styles.statIcon} color="#00aaff" />
                            <div className={styles.statLabel}>Winrate</div>
                            <div className={styles.statValue}>{stats.winrate}%</div>
                            <div className={styles.statSub}>{stats.wins}W - {stats.total - stats.wins}L</div>
                        </div>

                        <div className={styles.statCard}>
                            <Sword className={styles.statIcon} color="#4ade80" />
                            <div className={styles.statLabel}>KDA Promedio</div>
                            <div className={styles.statValue}>{stats.kda}</div>
                            <div className={styles.statSub}>{Math.round(stats.kills / stats.total)} / {Math.round(stats.deaths / stats.total)} / {Math.round(stats.assists / stats.total)}</div>
                        </div>

                        <div className={styles.statCard}>
                            <UserX className={styles.statIcon} color="#ef4444" />
                            <div className={styles.statLabel}>Counter Pick</div>
                            <div className={styles.statValue}>{stats.hardest ? stats.hardest.name : 'N/A'}</div>
                            <div className={styles.statSub}>Más derrotas vs ellos</div>
                        </div>

                        <div className={styles.statCard}>
                            <Award className={styles.statIcon} color="#fbbf24" />
                            <div className={styles.statLabel}>Total Partidas</div>
                            <div className={styles.statValue}>{stats.total}</div>
                            <div className={styles.statSub}>Historial completo</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
