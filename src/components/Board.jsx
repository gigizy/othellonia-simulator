import React, { useState, useEffect, useRef } from 'react';
import './Board.css';

const SIZE = 6;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0],  [1, 1],
];

// ======== 初期化ロジック =========
const createInitialBoard = () => {
  const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  board[2][2] = { color: 'white', source: 'initial' };
  board[2][3] = { color: 'black', source: 'initial' };
  board[3][2] = { color: 'black', source: 'initial' };
  board[3][3] = { color: 'white', source: 'initial' };
  return board;
};

// ======== ゲームロジック =========
const isValidMove = (row, col, board, player) => {
  if (board[row][col] !== null) return false;
  const opponent = player === 'black' ? 'white' : 'black';

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
      board[r][c]?.color === player
    ) {
      return true;
    }
  }

  return false;
};

const getFlippableStones = (row, col, board, player) => {
  const opponent = player === 'black' ? 'white' : 'black';
  let toFlip = [];

  for (const [dx, dy] of DIRECTIONS) {
    let r = row + dx;
    let c = col + dy;
    let path = [];

    while (
      r >= 0 && r < SIZE &&
      c >= 0 && c < SIZE &&
      board[r][c]?.color === opponent
    ) {
      path.push([r, c]);
      r += dx;
      c += dy;
    }

    if (
      path.length > 0 &&
      r >= 0 && r < SIZE &&
      c >= 0 && c < SIZE &&
      board[r][c]?.color === player
    ) {
      toFlip = toFlip.concat(path);
    }
  }

  return toFlip;
};

const calculateDamage = ({ flipCount, isThreat, baseNs = 1500, baseSs = 1500 }) => {
  const ns = baseNs * Math.pow(1.2, Math.max(flipCount - 1, 0));
  const ss = isThreat ? baseSs + 2500 : baseSs;
  return Math.round(ns + ss);
};

const isCorner = (row, col) => 
  (row === 0 || row === SIZE - 1) && (col === 0 || col === SIZE - 1);

// ======== Board コンポーネント =========
const Board = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [validMoves, setValidMoves] = useState([]);
  const [threatenedMoves, setThreatenedMoves] = useState([]);
  const [blackScore, setBlackScore] = useState(30000);
  const [whiteScore, setWhiteScore] = useState(30000);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [turnCount, setTurnCount] = useState(1);
  const firstRender = useRef(true);

  const updateValidMoves = (board, player) => {
    const moves = [];
    const threats = [];
    const opponent = player === 'black' ? 'white' : 'black';

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (isValidMove(row, col, board, player)) {
          moves.push(`${row}-${col}`);
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

  const handleClick = (row, col) => {
    const player = isBlackTurn ? 'black' : 'white';
    if (!isValidMove(row, col, board, player)) return;

    const flipped = getFlippableStones(row, col, board, player);
    const newBoard = board.map((r) => r.slice());

    newBoard[row][col] = { color: player, source: 'placed' };
    flipped.forEach(([r, c]) => {
      newBoard[r][c] = { color: player, source: 'flipped' };
    });

    setHistory(prev => [...prev, board]);
    setFuture([]);

    const flipCount = flipped.length;
    const isThreat = threatenedMoves.includes(`${row}-${col}`);
    const damage = calculateDamage({ flipCount, isThreat });

    if (player === 'black') {
      setWhiteScore(prev => Math.max(0, prev - damage));
      setLogs(prev => [`${turnCount}ターン目：黒が白に ${damage} ダメージ`, ...prev]);
    } else {
      setBlackScore(prev => Math.max(0, prev - damage));
      setLogs(prev => [`${turnCount}ターン目：白が黒に ${damage} ダメージ`, ...prev]);
    }

    setBoard(newBoard);
    setIsBlackTurn(!isBlackTurn);
    setTurnCount(prev => prev + 1);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setFuture(prev => [board, ...prev]);
    setBoard(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
    setIsBlackTurn(prev => !prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    setHistory(prev => [...prev, board]);
    setBoard(future[0]);
    setFuture(prev => prev.slice(1));
    setIsBlackTurn(prev => !prev);
  };

  const handleReset = () => {
    setBoard(createInitialBoard());
    setIsBlackTurn(true);
    setHistory([]);
    setFuture([]);
    setBlackScore(30000);
    setWhiteScore(30000);
    setLogs([]);
    setMessage(null);
    setTurnCount(1);
  };

  // ======== エフェクト処理 =========
  useEffect(() => {
    updateValidMoves(board, isBlackTurn ? 'black' : 'white');
  }, [board, isBlackTurn]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const currentMoves = updateValidMoves(board, isBlackTurn ? 'black' : 'white');
    if (currentMoves.length === 0) {
      const opponent = isBlackTurn ? 'white' : 'black';
      const opponentMoves = updateValidMoves(board, opponent);

      if (opponentMoves.length > 0) {
        setMessage({
          text: `${isBlackTurn ? '黒' : '白'}は打てないのでパスされました`,
          showOk: true,
          onOk: () => {
            setMessage(null);
            setIsBlackTurn(!isBlackTurn);
          }
        });
      } else {
        setMessage({
          text: "どちらも打てないのでゲーム終了！",
          showOk: true,
          onOk: () => setMessage(null)
        });
      }
    }
  }, [board, isBlackTurn]);

  useEffect(() => {
    if (blackScore <= 0 || whiteScore <= 0) {
      setMessage({
        text: `${blackScore <= 0 ? '黒' : '白'}のスコアが0になったため、ゲーム終了です`,
        showOk: true,
        onOk: () => setMessage(null)
      });
    }
  }, [blackScore, whiteScore]);

  // ======== JSX描画 =========
  return (
    <div className="container">
      <div className="scoreboard">
        <div>黒スコア: {blackScore}</div>
        <div>白スコア: {whiteScore}</div>
      </div>

      <div className="turn-indicator">
        <span className="stone-icon">
          <div className={`stone ${isBlackTurn ? 'stone-black' : 'stone-white'}`} />
        </span>
        {isBlackTurn ? "黒の番です" : "白の番です"}
      </div>

      {message && (
        <div className="message-box">
          <div>{message.text}</div>
          {message.showOk && (
            <button
              onClick={() => {
                message.onOk?.();
                setMessage(null);
              }}
            >OK</button>
          )}
        </div>
      )}

      <div className="board">
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`cell ${isCorner(rIdx, cIdx) ? 'corner-cell' : 'normal-cell'} ${
                validMoves.includes(`${rIdx}-${cIdx}`)
                  ? threatenedMoves.includes(`${rIdx}-${cIdx}`) ? 'threat-highlight' : 'highlight'
                  : ''
              }`}
              onClick={() => handleClick(rIdx, cIdx)}
            >
              {cell && (
                <div
                  className={`stone ${cell.color === 'black' ? 'stone-black' : 'stone-white'} ${
                    cell.source === 'placed' ? 'marked' : ''
                  }`}
                />
              )}
            </div>
          ))
        )}
      </div>

      <div className="controls">
        <button onClick={handleReset}>リセット</button>
        <button onClick={handleUndo} disabled={history.length === 0}>1手戻る</button>
        <button onClick={handleRedo} disabled={future.length === 0}>1手進める</button>
      </div>

      <div className="log-box">
        <h3>バトルログ</h3>
        <ul>
          {logs.map((log, idx) => (
            <li key={idx}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Board;
