import React, { useState, useEffect } from 'react';
import GameForm from './components/GameForm';
import GamesTable from './components/GamesTable';
import ChampionOverlay from './components/ChampionOverlay';
import StatsChart from './components/StatsChart';
import ChampionStatsModal from './components/ChampionStatsModal';
import { LANES, RESULTS } from './constants/gameData';
import styles from './App.module.css';
import { PlusCircle, Download, Upload, Moon, Sun, Cloud, HardDrive, Flame, Zap, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // Multiusuario
  const [user, setUser] = useState(() => localStorage.getItem('lolUser') || 'Jugador 1');
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('lolUsers');
    return saved ? JSON.parse(saved) : ['Jugador 1'];
  });
  const [games, setGames] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayTarget, setOverlayTarget] = useState(null);
  const [formValues, setFormValues] = useState({
    champion: '',
    lane: '',
    opponent: '',
    result: '',
    note: '',
    kills: 0,
    deaths: 0,
    assists: 0,
    cs: 0,
    duration: '',
    matchupTip: '',
    lpChange: 0,
    isRanked: false
  });

  // Modal de estadísticas de campeón
  const [selectedChampStats, setSelectedChampStats] = useState(null);

  // Dark/Light mode
  const [theme, setTheme] = useState(() => localStorage.getItem('lolTheme') || 'dark');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('lolTheme', theme);
  }, [theme]);

  // Filtros
  const [filterLane, setFilterLane] = useState('');
  const [filterChampion, setFilterChampion] = useState('');
  const [filterResult, setFilterResult] = useState('');

  // Cargar partidas del usuario activo
  useEffect(() => {
    const saved = localStorage.getItem('lolGames_' + user);
    setGames(saved ? JSON.parse(saved) : []);
    localStorage.setItem('lolUser', user);
  }, [user]);

  // Guardar partidas del usuario activo
  useEffect(() => {
    if (user) {
      localStorage.setItem('lolGames_' + user, JSON.stringify(games));
    }
  }, [games, user]);

  // Guardar lista de usuarios
  useEffect(() => {
    localStorage.setItem('lolUsers', JSON.stringify(users));
  }, [users]);

  // Lógica de Racha
  const currentStreak = (() => {
    let streak = 0;
    for (let i = games.length - 1; i >= 0; i--) {
      if (games[i].result && games[i].result.startsWith('gane')) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  // LP Total del día
  const dailyLP = (() => {
    const today = new Date().toLocaleDateString();
    return games
      .filter(g => g.isRanked && new Date(g.id || Date.now()).toLocaleDateString() === today)
      .reduce((sum, g) => sum + (parseInt(g.lpChange) || 0), 0);
  })();

  // Power Picks (Top 3 campeones con mejor performance)
  const powerPicks = (() => {
    const stats = {};
    games.forEach(g => {
      if (!stats[g.champion]) stats[g.champion] = { total: 0, wins: 0 };
      stats[g.champion].total++;
      if (g.result && g.result.startsWith('gane')) stats[g.champion].wins++;
    });

    return Object.entries(stats)
      .map(([name, s]) => ({
        name,
        winrate: Math.round((s.wins / s.total) * 100),
        total: s.total
      }))
      .filter(p => p.total >= 2) // Mínimo 2 partidas
      .sort((a, b) => b.winrate - a.winrate || b.total - a.total)
      .slice(0, 3);
  })();

  const filteredGames = games.filter(g =>
    (!filterLane || g.lane === filterLane) &&
    (!filterChampion || g.champion.toLowerCase().includes(filterChampion.toLowerCase())) &&
    (!filterResult || g.result === filterResult)
  );

  const wins = filteredGames.filter(g => g.result && g.result.startsWith('gane')).length;
  const losses = filteredGames.filter(g => g.result && g.result.startsWith('perdi')).length;
  const total = filteredGames.length;
  const winrate = total ? Math.round((wins / total) * 100) : 0;

  const handleSubmit = game => {
    const newGame = { ...game, id: game.id || Date.now() };
    if (editingIdx !== null) {
      setGames(games => games.map((g, i) => i === editingIdx ? newGame : g));
      setEditingIdx(null);
    } else {
      setGames(games => [...games, newGame]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormValues({
      champion: '',
      lane: '',
      opponent: '',
      result: '',
      note: '',
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      duration: '',
      matchupTip: '',
      lpChange: 0,
      isRanked: false
    });
  };

  const handleAddUser = () => {
    const nombre = prompt('Nombre del nuevo jugador:');
    if (nombre && !users.includes(nombre)) {
      setUsers([...users, nombre]);
      setUser(nombre);
    }
  };

  const handleEdit = idx => {
    setEditingIdx(idx);
    setFormValues(games[idx]);
  };

  const handleDelete = idx => {
    if (confirm('¿Estás seguro de que quieres eliminar esta partida?')) {
      setGames(games => games.filter((_, i) => i !== idx));
    }
  };

  const handleCancel = () => {
    setEditingIdx(null);
    resetForm();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lolGames_${user}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          if (confirm('¿Deseas reemplazar tus partidas actuales con las importadas?')) {
            setGames(imported);
          }
        }
      } catch (err) {
        alert('Error al importar el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const showOverlay = e => {
    setOverlayVisible(true);
    setOverlayTarget(e.target.name);
  };

  const handleOverlaySelect = champId => {
    setFormValues(values => ({ ...values, [overlayTarget]: champId }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.container} ${styles.glass}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 10 }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>LoL Match Tracker</h1>
        {currentStreak >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={styles.streakBadge}
            title={`${currentStreak} victorias seguidas`}
          >
            <Flame size={24} fill="#ff9100" color="#ff4d00" />
            <span>{currentStreak}</span>
          </motion.div>
        )}
      </div>

      {powerPicks.length > 0 && (
        <div className={styles.powerPicks}>
          <div className={styles.powerTitle}> <Zap size={16} /> Tus Power Picks</div>
          <div className={styles.powerList}>
            {powerPicks.map(p => (
              <div key={p.name} className={styles.powerItem}>
                <img src={getChampionImg(p.name)} alt={p.name} />
                <div className={styles.powerInfo}>
                  <div className={p.winrate >= 60 ? styles.highWinrate : ''}>{p.winrate}% WR</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{p.total} ptds</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={user}
          onChange={e => setUser(e.target.value)}
        >
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <button className={`${styles.button} ${styles.primary}`} onClick={handleAddUser}>
          <PlusCircle size={18} /> Nuevo Jugador
        </button>

        <button className={styles.button} onClick={handleExport}>
          <Download size={18} /> Exportar
        </button>

        <label className={`${styles.button} ${styles.primary}`}>
          <Upload size={18} /> Importar
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>

        <button className={`${styles.button} ${styles.secondary}`} onClick={() => window.open('https://drive.google.com/drive/my-drive', '_blank')}>
          <Cloud size={18} /> Drive
        </button>

        <button className={`${styles.button} ${styles.dropbox}`} onClick={() => window.open('https://www.dropbox.com/home', '_blank')}>
          <HardDrive size={18} /> Dropbox
        </button>

        <button className={`${styles.button} ${styles.themeToggle}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className={`${styles.statsBar} ${styles.glass}`}>
        <div>
          <b>Wins:</b> <span style={{ color: '#4ade80' }}>{wins}</span> &nbsp;
          <b>Losses:</b> <span style={{ color: '#f87171' }}>{losses}</span> &nbsp;
          <b>Winrate:</b> <span style={{ color: '#00aaff' }}>{winrate}%</span> &nbsp;
          {dailyLP !== 0 && (
            <span style={{ fontSize: '0.9rem', opacity: 0.9, marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 5, color: dailyLP > 0 ? '#4ade80' : '#f87171' }}>
              <Trophy size={14} /> <b>Hoy:</b> {dailyLP > 0 ? '+' : ''}{dailyLP} LP
            </span>
          )}
        </div>

        <div className={styles.filters}>
          <select className={styles.select} value={filterLane} onChange={e => setFilterLane(e.target.value)}>
            <option value="">Todas las Líneas</option>
            {LANES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <input
            className={styles.input}
            value={filterChampion}
            onChange={e => setFilterChampion(e.target.value)}
            placeholder="Campeón..."
            style={{ width: 110 }}
          />

          <select className={styles.select} value={filterResult} onChange={e => setFilterResult(e.target.value)}>
            <option value="">Resultados</option>
            {RESULTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <StatsChart games={games} />

      <GameForm
        onSubmit={handleSubmit}
        editingGame={editingIdx !== null ? games[editingIdx] : null}
        onCancel={handleCancel}
        showOverlay={showOverlay}
        formValues={formValues}
        setFormValues={setFormValues}
        games={games}
      />

      <h2 style={{ textAlign: 'center', margin: '30px 0 20px', color: theme === 'dark' ? '#00aaff' : '#005577' }}>Mis Partidas</h2>

      <AnimatePresence mode='wait'>
        {filteredGames.length > 0 ? (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GamesTable
              games={filteredGames}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onChampClick={setSelectedChampStats}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: 40, color: '#888' }}
          >
            No se encontraron partidas. ¡Registra tu primera victoria!
          </motion.div>
        )}
      </AnimatePresence>

      <ChampionOverlay
        visible={overlayVisible}
        onSelect={champId => {
          handleOverlaySelect(champId);
          setOverlayVisible(false);
        }}
        onClose={() => setOverlayVisible(false)}
      />

      <ChampionStatsModal
        champion={selectedChampStats}
        games={games}
        onClose={() => setSelectedChampStats(null)}
      />
    </motion.div>
  );
}

export default App;
