import React, { useState, useEffect, useRef } from 'react';
import {
  isValidMove,
  getFlippableStones,
  isCorner,
  calculateDamage,
  hasValidMoves
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
  const [threatConnections, setThreatConnections] = useState({});
  const [isPassDialogVisible, setIsPassDialogVisible] = useState(false);
  const [passMessage, setPassMessage] = useState('');
  const firstRender = useRef(true);

  const updateValidMoves = (board, player) => {
    const moves = [];
    const threats = [];
    const connections = {};
    const opponent = player === 'black' ? 'white' : 'black';

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (isValidMove(row, col, board, player)) {
          moves.push([row, col]);
          for (const [dx, dy] of DIRECTIONS) {
            let r = row + dx;
            let c = col + dy;
            let hasOpponentBetween = false;
            let connectionCount = 0;
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
              const key = `${row}-${col}`;
              threats.push(key);
              connections[key] = (connections[key] || 0) + 1;
            }
          }
        }
      }
    }
    setValidMoves(moves);
    setThreatenedMoves(threats);
    setThreatConnections(connections);
    return moves;
  };

  useEffect(() => {
    const currentMoves = updateValidMoves(boardState.board, currentPlayer);

    if (currentMoves.length === 0) {
      const message = currentPlayer === 'black'
        ? 'あなた（黒）がパスしました'
        : '相手（白）がパスしました';
      setPassMessage(message);
      setIsPassDialogVisible(true);
      return;
    }

    if (aiEnabled && currentPlayer === aiColor && currentMoves.length > 0) {
      const [row, col] = currentMoves[Math.floor(Math.random() * currentMoves.length)];
      const key = `${row}-${col}`;
      const isThreat = threatenedMoves.includes(key);
      const threatLevel = threatConnections[key] || 1;
      setTimeout(() => onMove(row, col, isThreat, threatLevel), 400);
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
                onClick={() => {
                  if (isValid) {
                    const key = `${rIdx}-${cIdx}`;
                    const isThreat = threatenedMoves.includes(key);
                    const threatLevel = threatConnections[key] || 1;
                    onMove(rIdx, cIdx, isThreat, threatLevel);
                  }
                }}
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

      {isPassDialogVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{passMessage}</p>
            <button
              onClick={() => {
                setIsPassDialogVisible(false);
                onMove(null, null, false, 1);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameBoard;
