import React, { useState } from 'react';
import GameBoard from './GameBoard';
import {
  createInitialBoard,
  getFlippableStones,
  isValidMove,
  calculateDamage,
} from '../utils/gameLogic';
import { formatLogEntry } from '../utils/logUtils';
import ScoreBoard from './ui/ScoreBoard';
import TurnIndicator from './ui/TurnIndicator';
import LogBox from './ui/LogBox';

const PvPBoard = ({ onBack }) => {
  const [board, setBoard] = useState(createInitialBoard());
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [blackScore, setBlackScore] = useState(30000);
  const [whiteScore, setWhiteScore] = useState(30000);
  const [logs, setLogs] = useState([]);
  const [turnCount, setTurnCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const currentPlayer = isBlackTurn ? 'black' : 'white';

  const createSnapshot = () => ({
    board: board.map(row => row.map(cell => (cell ? { ...cell } : null))),
    isBlackTurn,
    blackScore,
    whiteScore,
    logs: [...logs],
    turnCount
  });

  const restoreSnapshot = (snap) => {
    setBoard(snap.board.map(row => row.map(cell => (cell ? { ...cell } : null))));
    setIsBlackTurn(snap.isBlackTurn);
    setBlackScore(snap.blackScore);
    setWhiteScore(snap.whiteScore);
    setLogs([...snap.logs]);
    setTurnCount(snap.turnCount);
  };

  const handleClick = (row, col) => {
    if (!isValidMove(row, col, board, currentPlayer)) return;

    setHistory(prev => [...prev, createSnapshot()]);
    setFuture([]);

    const flipped = getFlippableStones(row, col, board, currentPlayer);
    const newBoard = board.map(row => row.slice());
    newBoard[row][col] = { color: currentPlayer, source: 'placed' };
    flipped.forEach(([r, c]) => {
      newBoard[r][c] = { color: currentPlayer, source: 'flipped' };
    });

    const flipCount = flipped.length;
    const isThreat = false;
    const damage = calculateDamage({ flipCount, isThreat });

    const turnNum = Math.ceil(turnCount / 2);
    const log = formatLogEntry(currentPlayer, turnNum, damage);
    setLogs(prev => [...prev, log]);

    if (currentPlayer === 'black') {
      setWhiteScore(prev => Math.max(0, prev - damage));
    } else {
      setBlackScore(prev => Math.max(0, prev - damage));
    }

    setBoard(newBoard);
    setIsBlackTurn(prev => !prev);
    setTurnCount(prev => prev + 1);
  };

  const handleReset = () => {
    setBoard(createInitialBoard());
    setTurnCount(1);
    setIsBlackTurn(true);
    setBlackScore(30000);
    setWhiteScore(30000);
    setLogs([]);
    setHistory([]);
    setFuture([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture(f => [createSnapshot(), ...f]);
    setHistory(h => h.slice(0, -1));
    restoreSnapshot(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(h => [...h, createSnapshot()]);
    setFuture(f => f.slice(1));
    restoreSnapshot(next);
  };

  return (
    <div className="container">
      <ScoreBoard black={blackScore} white={whiteScore} />
      <TurnIndicator isBlackTurn={isBlackTurn} showOpeningHint={true} turnCount={turnCount} />
      <GameBoard
        currentPlayer={currentPlayer}
        onMove={handleClick}
        aiEnabled={false}
        aiColor={null}
        logs={logs}
        updateLogs={setLogs}
        boardState={{ board, turnCount }}
        showReset={true}
        showUndo={true}
        showRedo={true}
        onReset={handleReset}
        onUndo={handleUndo}
        onRedo={handleRedo}
        history={history}
        future={future}
      />
      <button onClick={onBack}>← メニューに戻る</button>
      <LogBox logs={logs} />
    </div>
  );
};

export default PvPBoard;
