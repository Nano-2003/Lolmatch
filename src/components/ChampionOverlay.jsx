import React, { useState, useEffect } from 'react';
import styles from '../styles/ChampionOverlay.module.css';
import { getChampionDataUrl, getChampionImg } from '../constants/gameData';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export default function ChampionOverlay({ visible, onSelect, onClose }) {
  const [champions, setChampions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && champions.length === 0) {
      setLoading(true);
      fetch(getChampionDataUrl())
        .then(res => res.json())
        .then(data => {
          setChampions(Object.values(data.data));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [visible, champions.length]);

  const filtered = champions.filter(
    champ => champ.name.toLowerCase().includes(search.toLowerCase()) ||
      champ.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.inner}
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className={styles.header}>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  className={styles.search}
                  placeholder="Buscar campeón..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.grid}>
              {loading ? (
                <div className={styles.message}>Cargando campeones...</div>
              ) : filtered.length > 0 ? (
                filtered.map(champ => (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={styles.champ}
                    key={champ.id}
                    onClick={() => { onSelect(champ.id); onClose(); }}
                  >
                    <img
                      src={getChampionImg(champ.id)}
                      alt={champ.name}
                      title={champ.title}
                    />
                    <span>{champ.name}</span>
                  </motion.div>
                ))
              ) : (
                <div className={styles.message}>No se encontró al campeón "{search}"</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
