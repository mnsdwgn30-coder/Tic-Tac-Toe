/**
 * TIC-TAC-TOE MASTER PORTAL - STORAGE MANAGER (storage.js)
 * Manages stats, game history, and user settings with LocalStorage.
 */

const StorageManager = {
  getStats() {
    const stats = localStorage.getItem('ttt_stats');
    if (!stats) {
      return {
        classic: { xWins: 0, oWins: 0, draws: 0 },
        ai: { playerWins: 0, aiWins: 0, draws: 0, winStreak: 0 },
        infinite: { xWins: 0, oWins: 0, draws: 0 },
        ultimate: { xWins: 0, oWins: 0, draws: 0 },
        wild: { p1Wins: 0, p2Wins: 0, draws: 0 },
        numerical: { p1Wins: 0, p2Wins: 0, draws: 0 },
        matches: []
      };
    }
    try {
      return JSON.parse(stats);
    } catch (e) {
      return {};
    }
  },

  saveStats(stats) {
    localStorage.setItem('ttt_stats', JSON.stringify(stats));
  },

  recordMatch(mode, result, details = '') {
    const stats = this.getStats();
    if (!stats[mode]) {
      stats[mode] = { wins: 0, losses: 0, draws: 0 };
    }

    if (result === 'win' || result === 'x') {
      if (mode === 'ai') {
        stats.ai.playerWins++;
        stats.ai.winStreak++;
      } else if (stats[mode].xWins !== undefined) {
        stats[mode].xWins++;
      }
    } else if (result === 'loss' || result === 'o') {
      if (mode === 'ai') {
        stats.ai.aiWins++;
        stats.ai.winStreak = 0;
      } else if (stats[mode].oWins !== undefined) {
        stats[mode].oWins++;
      }
    } else if (result === 'draw') {
      if (stats[mode].draws !== undefined) {
        stats[mode].draws++;
      }
    }

    if (!stats.matches) stats.matches = [];
    stats.matches.unshift({
      id: Date.now(),
      mode,
      result,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Keep last 30 matches
    if (stats.matches.length > 30) stats.matches.pop();
    this.saveStats(stats);
    return stats;
  },

  clearStats() {
    localStorage.removeItem('ttt_stats');
  }
};

window.StorageManager = StorageManager;
