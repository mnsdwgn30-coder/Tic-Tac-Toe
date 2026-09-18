/**
 * TIC-TAC-TOE MASTER PORTAL - CORE GAME ENGINE (game-engine.js)
 * Implements Classic, Minimax AI (all difficulties), NxN, and Infinite modes.
 */

class TicTacToeEngine {
  constructor(size = 3, targetWin = 3, mode = 'classic') {
    this.size = size;
    this.targetWin = targetWin;
    this.mode = mode; // 'classic', 'ai', 'infinite'
    this.board = Array(size * size).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.winningLine = null;
    this.history = [];
    this.xMovesQueue = []; // For Infinite mode
    this.oMovesQueue = []; // For Infinite mode
    this.aiDifficulty = 'unbeatable'; // 'easy', 'medium', 'hard', 'unbeatable'
    this.isAiThinking = false;
    this.onStateChange = null;
  }

  reset() {
    this.board = Array(this.size * this.size).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.winningLine = null;
    this.history = [];
    this.xMovesQueue = [];
    this.oMovesQueue = [];
    this.isAiThinking = false;
    if (this.onStateChange) this.onStateChange();
  }

  makeMove(index) {
    if (this.winner || this.board[index] !== null || this.isAiThinking) {
      return false;
    }

    // Save previous state for history
    this.history.push({
      board: [...this.board],
      player: this.currentPlayer,
      xQueue: [...this.xMovesQueue],
      oQueue: [...this.oMovesQueue]
    });

    // Handle Infinite mode piece queueing
    if (this.mode === 'infinite') {
      const activeQueue = this.currentPlayer === 'X' ? this.xMovesQueue : this.oMovesQueue;
      if (activeQueue.length >= 3) {
        const oldestIndex = activeQueue.shift();
        this.board[oldestIndex] = null;
      }
      activeQueue.push(index);
    }

    this.board[index] = this.currentPlayer;

    // Check winner
    const winResult = this.checkWin(this.board, this.currentPlayer);
    if (winResult) {
      this.winner = this.currentPlayer;
      this.winningLine = winResult.line;
    } else if (this.isBoardFull() && this.mode !== 'infinite') {
      this.winner = 'draw';
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    if (this.onStateChange) this.onStateChange();

    // Trigger AI turn if applicable
    if (!this.winner && this.mode === 'ai' && this.currentPlayer === 'O') {
      this.triggerAiMove();
    }

    return true;
  }

  triggerAiMove() {
    this.isAiThinking = true;
    if (this.onStateChange) this.onStateChange();

    setTimeout(() => {
      const bestMove = this.calculateAiMove();
      this.isAiThinking = false;
      if (bestMove !== -1) {
        this.makeMove(bestMove);
      }
    }, 400 + Math.random() * 300);
  }

  calculateAiMove() {
    const available = this.getAvailableMoves(this.board);
    if (available.length === 0) return -1;

    // Easy AI: 80% random
    if (this.aiDifficulty === 'easy') {
      if (Math.random() < 0.8) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }

    // Medium AI: 40% random, else smart block/win
    if (this.aiDifficulty === 'medium') {
      if (Math.random() < 0.4) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }

    // Hard AI: 15% mistake
    if (this.aiDifficulty === 'hard') {
      if (Math.random() < 0.15) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }

    // Unbeatable / Smart: Minimax for 3x3, Heuristic for NxN
    if (this.size === 3 && this.mode !== 'infinite') {
      let bestScore = -Infinity;
      let move = available[0];
      for (let i of available) {
        this.board[i] = 'O';
        let score = this.minimax(this.board, 0, false, -Infinity, Infinity);
        this.board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
      return move;
    }

    // Heuristic for larger boards / Infinite:
    // 1. Can AI win in 1 move?
    for (let i of available) {
      this.board[i] = 'O';
      if (this.checkWin(this.board, 'O')) {
        this.board[i] = null;
        return i;
      }
      this.board[i] = null;
    }

    // 2. Must AI block opponent immediate win?
    for (let i of available) {
      this.board[i] = 'X';
      if (this.checkWin(this.board, 'X')) {
        this.board[i] = null;
        return i;
      }
      this.board[i] = null;
    }

    // 3. Center preference
    const center = Math.floor((this.size * this.size) / 2);
    if (available.includes(center)) return center;

    // 4. Corners preference
    const corners = [0, this.size - 1, this.size * (this.size - 1), this.size * this.size - 1].filter(c => available.includes(c));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  minimax(board, depth, isMaximizing, alpha, beta) {
    const oWin = this.checkWin(board, 'O');
    if (oWin) return 10 - depth;
    const xWin = this.checkWin(board, 'X');
    if (xWin) return depth - 10;
    if (this.getAvailableMoves(board).length === 0 || depth >= 7) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of this.getAvailableMoves(board)) {
        board[move] = 'O';
        let evaluation = this.minimax(board, depth + 1, false, alpha, beta);
        board[move] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of this.getAvailableMoves(board)) {
        board[move] = 'X';
        let evaluation = this.minimax(board, depth + 1, true, alpha, beta);
        board[move] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  getAvailableMoves(board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) moves.push(i);
    }
    return moves;
  }

  isBoardFull() {
    return this.board.every(cell => cell !== null);
  }

  checkWin(board, player) {
    const n = this.size;
    const target = this.targetWin;

    // Rows
    for (let r = 0; r < n; r++) {
      for (let c = 0; c <= n - target; c++) {
        let line = [];
        let win = true;
        for (let k = 0; k < target; k++) {
          const idx = r * n + (c + k);
          line.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return { winner: player, line };
      }
    }

    // Columns
    for (let c = 0; c < n; c++) {
      for (let r = 0; r <= n - target; r++) {
        let line = [];
        let win = true;
        for (let k = 0; k < target; k++) {
          const idx = (r + k) * n + c;
          line.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return { winner: player, line };
      }
    }

    // Diagonals (top-left to bottom-right)
    for (let r = 0; r <= n - target; r++) {
      for (let c = 0; c <= n - target; c++) {
        let line = [];
        let win = true;
        for (let k = 0; k < target; k++) {
          const idx = (r + k) * n + (c + k);
          line.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return { winner: player, line };
      }
    }

    // Anti-diagonals (top-right to bottom-left)
    for (let r = 0; r <= n - target; r++) {
      for (let c = target - 1; c < n; c++) {
        let line = [];
        let win = true;
        for (let k = 0; k < target; k++) {
          const idx = (r + k) * n + (c - k);
          line.push(idx);
          if (board[idx] !== player) {
            win = false;
            break;
          }
        }
        if (win) return { winner: player, line };
      }
    }

    return null;
  }
}

window.TicTacToeEngine = TicTacToeEngine;
