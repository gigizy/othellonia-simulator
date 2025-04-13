import React, { useState, useEffect, useRef } from 'react';
import {
  isValidMove,
  getFlippableStones,
  isCorner,
  calculateDamage
} from '../utils/gameLogic';
import '../styles/Board.css';

const SIZE = 6;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0],  [1, 1],
];

const GameBoard = ({
  currentPlayer,
  onMove,
  aiEnabled = false,
  aiColor = null,
  logs,
  updateLogs,
  boardState,
  showReset = false,
  showUndo = false,
  showRedo = false,
  onReset,
  onUndo,
  onRedo,
  history = [],
  future = [],
}) => {
  const [validMoves, setValidMoves] = useState([]);
  const [threatenedMoves, setThreatenedMoves] = useState([]);
  const firstRender = useRef(true);

  const updateValidMoves = (board, player) => {
    const moves = [];
    const threats = [];
    const opponent = player === 'black' ? 'white' : 'black';

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (isValidMove(row, col, board, player)) {
          moves.push([row, col]);
          for (const [dx, dy] of DIRECTIONS) {
            let r = row + dx;
            let c = col + dy;
            let hasOpponentBetween = false;
            while (
              r >= 0 && r < SIZE &&
              c >= 0 && c < SIZE &&
              board[r][c]?.color === opponent
            ) {
              r += dx;
              c += dy;
              hasOpponentBetween = true;
            }
            if (
              hasOpponentBetween &&
              r >= 0 && r < SIZE &&
              c >= 0 && c < SIZE &&
              board[r][c]?.color === player &&
              board[r][c].source === 'placed'
            ) {
              threats.push(`${row}-${col}`);
              break;
            }
          }
        }
      }
    }
    setValidMoves(moves);
    setThreatenedMoves(threats);
    return moves;
  };

  useEffect(() => {
    const currentMoves = updateValidMoves(boardState.board, currentPlayer);

    if (aiEnabled && currentPlayer === aiColor && currentMoves.length > 0) {
      const [row, col] = currentMoves[Math.floor(Math.random() * currentMoves.length)];
      setTimeout(() => onMove(row, col, aiColor), 400);
    }
  }, [boardState.board, currentPlayer]);

  return (
    <>
      <div className="board">
        {boardState.board.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isValid = validMoves.some(([r, c]) => r === rIdx && c === cIdx);
            const isThreat = threatenedMoves.includes(`${rIdx}-${cIdx}`);
            const cellClass = `cell ${
              isCorner(rIdx, cIdx) ? 'corner-cell' : 'normal-cell'
            } ${
              isValid ? (isThreat ? 'threat-highlight' : 'highlight') : ''
            }`;

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={cellClass}
                onClick={() => onMove(rIdx, cIdx)}
              >
                {cell && (
                  <div
                    className={`stone ${cell.color === 'black' ? 'stone-black' : 'stone-white'} ${
                      cell.source === 'placed' ? 'marked' : ''
                    }`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="controls">
        {showReset && <button onClick={onReset}>リセット</button>}
        {showUndo && (
          <button onClick={onUndo} disabled={history.length === 0}>1手戻る</button>
        )}
        {showRedo && (
          <button onClick={onRedo} disabled={future.length === 0}>1手進める</button>
        )}
      </div>
    </>
  );
};

export default GameBoard;
