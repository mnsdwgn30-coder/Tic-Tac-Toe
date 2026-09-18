/**
 * TIC-TAC-TOE MASTER PORTAL - TOOLS SUITE (tools.js)
 * Implements 5 interactive calculators, analyzers, and generators.
 */

// 1. Move Simulator & Board Analyzer
class BoardAnalyzer {
  constructor(board = Array(9).fill(null)) {
    this.board = [...board];
  }

  setCell(index, val) {
    this.board[index] = val;
  }

  reset() {
    this.board = Array(9).fill(null);
  }

  analyze() {
    const xCount = this.board.filter(c => c === 'X').length;
    const oCount = this.board.filter(c => c === 'O').length;
    const turn = xCount <= oCount ? 'X' : 'O';

    const winner = this.checkWin();
    if (winner) {
      return {
        status: `${winner.player} has won!`,
        evalScore: winner.player === 'X' ? 100 : -100,
        bestMove: -1,
        forks: [],
        lines: winner.line
      };
    }

    if (this.board.every(c => c !== null)) {
      return {
        status: 'Game is a Draw',
        evalScore: 0,
        bestMove: -1,
        forks: [],
        lines: []
      };
    }

    // Minimax Evaluation & Best Move
    const moves = this.getAvailableMoves();
    let bestMove = -1;
    let bestEval = turn === 'X' ? -Infinity : Infinity;

    for (let move of moves) {
      this.board[move] = turn;
      let score = this.minimax(this.board, 0, turn !== 'X', -Infinity, Infinity);
      this.board[move] = null;

      if (turn === 'X' && score > bestEval) {
        bestEval = score;
        bestMove = move;
      } else if (turn === 'O' && score < bestEval) {
        bestEval = score;
        bestMove = move;
      }
    }

    // Detect Forks (opportunities to create 2 winning threats simultaneously)
    const forks = this.detectForks(turn);

    let statusText = 'Equal position (Draw with optimal play)';
    if (bestEval > 0) statusText = `Advantage X (+${bestEval * 10}%)`;
    else if (bestEval < 0) statusText = `Advantage O (${bestEval * 10}%)`;

    return {
      status: statusText,
      evalScore: bestEval * 10,
      bestMove,
      forks,
      nextTurn: turn,
      availableMoves: moves.length
    };
  }

  detectForks(player) {
    const forks = [];
    const available = this.getAvailableMoves();
    for (let move of available) {
      this.board[move] = player;
      let winningThreats = 0;
      for (let next of this.getAvailableMoves()) {
        this.board[next] = player;
        if (this.checkWin()?.player === player) {
          winningThreats++;
        }
        this.board[next] = null;
      }
      this.board[move] = null;
      if (winningThreats >= 2) {
        forks.push(move);
      }
    }
    return forks;
  }

  minimax(board, depth, isMaximizing, alpha, beta) {
    const win = this.checkWinOnBoard(board);
    if (win?.player === 'X') return 10 - depth;
    if (win?.player === 'O') return depth - 10;
    if (board.every(c => c !== null) || depth >= 6) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          let score = this.minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = this.minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return minScore;
    }
  }

  checkWin() {
    return this.checkWinOnBoard(this.board);
  }

  checkWinOnBoard(b) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let l of lines) {
      if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) {
        return { player: b[l[0]], line: l };
      }
    }
    return null;
  }

  getAvailableMoves() {
    return this.board.map((v, i) => (v === null ? i : null)).filter(v => v !== null);
  }
}

// 2. Probability Calculator
function calculateProbabilities(board) {
  const analyzer = new BoardAnalyzer(board);
  const win = analyzer.checkWin();
  if (win) {
    return win.player === 'X' 
      ? { x: 100, o: 0, draw: 0 } 
      : { x: 0, o: 100, draw: 0 };
  }
  if (board.every(c => c !== null)) {
    return { x: 0, o: 0, draw: 100 };
  }

  // Count terminal states with Monte Carlo simulation
  let xWins = 0, oWins = 0, draws = 0;
  const simulations = 1200;

  for (let i = 0; i < simulations; i++) {
    const simBoard = [...board];
    let turn = simBoard.filter(c => c === 'X').length <= simBoard.filter(c => c === 'O').length ? 'X' : 'O';

    while (true) {
      const avail = simBoard.map((c, idx) => (c === null ? idx : null)).filter(c => c !== null);
      if (avail.length === 0) {
        draws++;
        break;
      }

      // Random playout
      const move = avail[Math.floor(Math.random() * avail.length)];
      simBoard[move] = turn;

      const currentWin = analyzer.checkWinOnBoard(simBoard);
      if (currentWin) {
        if (currentWin.player === 'X') xWins++;
        else oWins++;
        break;
      }

      turn = turn === 'X' ? 'O' : 'X';
    }
  }

  const total = simulations;
  return {
    x: Math.round((xWins / total) * 100),
    o: Math.round((oWins / total) * 100),
    draw: Math.round((draws / total) * 100)
  };
}

// 3. First-Player Coin Spinner
function flipFirstPlayer(onResult) {
  if (window.soundManager) window.soundManager.playCoinFlip();
  const coin = document.getElementById('coin-spinner');
  if (!coin) return;

  const isX = Math.random() < 0.5;
  const spins = 5 + Math.floor(Math.random() * 4);
  const finalDeg = spins * 360 + (isX ? 0 : 180);

  coin.style.transform = `rotateY(${finalDeg}deg)`;

  setTimeout(() => {
    const winner = isX ? 'Player X (Blue)' : 'Player O (Pink)';
    if (onResult) onResult(winner, isX ? 'X' : 'O');
  }, 3000);
}

// 4. Printable Sheet HTML Generator
function generatePrintableBoards(count = 6, title = 'Tic-Tac-Toe Championship') {
  let boardsHtml = '';
  for (let i = 1; i <= count; i++) {
    boardsHtml += `
      <div style="border: 2px solid #333; padding: 15px; border-radius: 8px; text-align: center; page-break-inside: avoid;">
        <div style="font-weight: bold; margin-bottom: 8px;">Game #${i}</div>
        <table style="margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td style="width: 50px; height: 50px; border-right: 3px solid #000; border-bottom: 3px solid #000;"></td>
            <td style="width: 50px; height: 50px; border-right: 3px solid #000; border-bottom: 3px solid #000;"></td>
            <td style="width: 50px; height: 50px; border-bottom: 3px solid #000;"></td>
          </tr>
          <tr>
            <td style="width: 50px; height: 50px; border-right: 3px solid #000; border-bottom: 3px solid #000;"></td>
            <td style="width: 50px; height: 50px; border-right: 3px solid #000; border-bottom: 3px solid #000;"></td>
            <td style="width: 50px; height: 50px; border-bottom: 3px solid #000;"></td>
          </tr>
          <tr>
            <td style="width: 50px; height: 50px; border-right: 3px solid #000;"></td>
            <td style="width: 50px; height: 50px; border-right: 3px solid #000;"></td>
            <td style="width: 50px; height: 50px;"></td>
          </tr>
        </table>
        <div style="margin-top: 10px; font-size: 12px; color: #555;">Winner: [  ] X &nbsp; [  ] O &nbsp; [  ] Draw</div>
      </div>
    `;
  }
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #000; background: #fff;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 5px;">${title}</h1>
      <p style="text-align: center; color: #666; margin-bottom: 25px;">Player 1: ____________________ &nbsp;&nbsp;&nbsp; Player 2: ____________________</p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        ${boardsHtml}
      </div>
    </div>
  `;
}

window.BoardAnalyzer = BoardAnalyzer;
window.calculateProbabilities = calculateProbabilities;
window.flipFirstPlayer = flipFirstPlayer;
window.generatePrintableBoards = generatePrintableBoards;
