/**
 * TIC-TAC-TOE MASTER PORTAL - VARIANT ENGINES (variant-engines.js)
 * Implements Wild, Numerical (Sum 15), and Misère modes.
 */

// Wild Tic-Tac-Toe Engine
class WildEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 1; // Player 1 or Player 2
    this.selectedMark = 'X'; // 'X' or 'O'
    this.winner = null;
    this.winningLine = null;
    this.onStateChange = null;
  }

  setSelectedMark(mark) {
    this.selectedMark = mark;
    if (this.onStateChange) this.onStateChange();
  }

  makeMove(index) {
    if (this.winner || this.board[index] !== null) return false;

    this.board[index] = this.selectedMark;

    // Check if either 'X' or 'O' has a 3-in-a-row
    const xWin = this.checkWin('X');
    const oWin = this.checkWin('O');

    if (xWin) {
      this.winner = `Player ${this.currentPlayer}`;
      this.winningLine = xWin.line;
    } else if (oWin) {
      this.winner = `Player ${this.currentPlayer}`;
      this.winningLine = oWin.line;
    } else if (this.board.every(c => c !== null)) {
      this.winner = 'draw';
    } else {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    if (this.onStateChange) this.onStateChange();
    return true;
  }

  checkWin(mark) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let line of lines) {
      const [a,b,c] = line;
      if (this.board[a] === mark && this.board[b] === mark && this.board[c] === mark) {
        return { line };
      }
    }
    return null;
  }
}

// Numerical Tic-Tac-Toe (Sum to 15) Engine
class NumericalEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 1; // 1 = Odds (1,3,5,7,9), 2 = Evens (2,4,6,8)
    this.p1Numbers = [1, 3, 5, 7, 9];
    this.p2Numbers = [2, 4, 6, 8];
    this.selectedNumber = 1;
    this.winner = null;
    this.winningLine = null;
    this.onStateChange = null;
  }

  selectNumber(num) {
    const pool = this.currentPlayer === 1 ? this.p1Numbers : this.p2Numbers;
    if (pool.includes(num)) {
      this.selectedNumber = num;
      if (this.onStateChange) this.onStateChange();
    }
  }

  makeMove(index) {
    if (this.winner || this.board[index] !== null || this.selectedNumber === null) return false;

    this.board[index] = this.selectedNumber;

    // Remove used number
    if (this.currentPlayer === 1) {
      this.p1Numbers = this.p1Numbers.filter(n => n !== this.selectedNumber);
      this.selectedNumber = this.p2Numbers[0] || null;
    } else {
      this.p2Numbers = this.p2Numbers.filter(n => n !== this.selectedNumber);
      this.selectedNumber = this.p1Numbers[0] || null;
    }

    // Check sum 15
    const winResult = this.checkSum15();
    if (winResult) {
      this.winner = `Player ${this.currentPlayer}`;
      this.winningLine = winResult.line;
    } else if (this.board.every(c => c !== null) || (this.p1Numbers.length === 0 && this.p2Numbers.length === 0)) {
      this.winner = 'draw';
    } else {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      const pool = this.currentPlayer === 1 ? this.p1Numbers : this.p2Numbers;
      this.selectedNumber = pool[0] || null;
    }

    if (this.onStateChange) this.onStateChange();
    return true;
  }

  checkSum15() {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    for (let line of lines) {
      const [a,b,c] = line;
      if (this.board[a] !== null && this.board[b] !== null && this.board[c] !== null) {
        if (this.board[a] + this.board[b] + this.board[c] === 15) {
          return { line };
        }
      }
    }
    return null;
  }
}

window.WildEngine = WildEngine;
window.NumericalEngine = NumericalEngine;
