/**
 * TIC-TAC-TOE MASTER PORTAL - ULTIMATE ENGINE (ultimate-engine.js)
 * Implements full 9-grid Ultimate Tic-Tac-Toe rules.
 */

class UltimateEngine {
  constructor() {
    this.reset();
  }

  reset() {
    // 9 sub-boards of 9 cells each
    this.subBoards = Array(9).fill(null).map(() => Array(9).fill(null));
    // Macro board tracking winner of each sub-board ('X', 'O', 'T' for tie, or null)
    this.macroBoard = Array(9).fill(null);
    this.activeBoard = null; // null means player can choose any active board
    this.currentPlayer = 'X';
    this.winner = null;
    this.winningMacroLine = null;
    this.onStateChange = null;
  }

  makeMove(boardIndex, cellIndex) {
    if (this.winner) return false;

    // Check if this sub-board is allowed
    if (this.activeBoard !== null && this.activeBoard !== boardIndex) {
      return false;
    }

    // Check if cell is occupied or sub-board is already won
    if (this.subBoards[boardIndex][cellIndex] !== null || this.macroBoard[boardIndex] !== null) {
      return false;
    }

    // Record move
    this.subBoards[boardIndex][cellIndex] = this.currentPlayer;

    // Check if sub-board was won
    const subWin = this.check3x3(this.subBoards[boardIndex], this.currentPlayer);
    if (subWin) {
      this.macroBoard[boardIndex] = this.currentPlayer;
    } else if (this.isSubBoardFull(boardIndex)) {
      this.macroBoard[boardIndex] = 'T'; // Tie
    }

    // Check if Macro board was won
    const macroWin = this.check3x3(this.macroBoard, this.currentPlayer);
    if (macroWin) {
      this.winner = this.currentPlayer;
      this.winningMacroLine = macroWin.line;
    } else if (this.macroBoard.every(b => b !== null)) {
      this.winner = 'draw';
    } else {
      // Determine next active board
      // If targeted board is already resolved or full, player can choose any board (activeBoard = null)
      if (this.macroBoard[cellIndex] !== null || this.isSubBoardFull(cellIndex)) {
        this.activeBoard = null;
      } else {
        this.activeBoard = cellIndex;
      }

      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    if (this.onStateChange) this.onStateChange();
    return true;
  }

  isSubBoardFull(boardIdx) {
    return this.subBoards[boardIdx].every(c => c !== null);
  }

  check3x3(arr, player) {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // cols
      [0,4,8], [2,4,6]           // diags
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (arr[a] === player && arr[b] === player && arr[c] === player) {
        return { winner: player, line };
      }
    }
    return null;
  }
}

window.UltimateEngine = UltimateEngine;
