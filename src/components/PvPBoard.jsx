import React, { useState } from 'react';
import GameBoard from './GameBoard';
import {
  createInitialBoard,
  getFlippableStones,
  isValidMove,
  calculateDamage,
  hasValidMoves
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
  const [passCount, setPassCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

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

  const checkGameEnd = (nextPass, newBlackScore, newWhiteScore) => {
    if (newBlackScore <= 0 || newWhiteScore <= 0) {
      const winner = newBlackScore <= 0 ? '白' : '黒';
      setWinner(`${winner}の勝ち！（相手のスコアが0）`);
      setGameOver(true);
      return true;
    } else if (nextPass >= 2) {
      if (newBlackScore === newWhiteScore) {
        setWinner('引き分け！');
      } else {
        const winner = newBlackScore > newWhiteScore ? '黒' : '白';
        setWinner(`${winner}の勝ち！（両者パス）`);
      }
      setGameOver(true);
      return true;
    }
    return false;
  };

  const handleClick = (row, col, isThreat = false, threatLevel = 1) => {
    if (gameOver) return;
  
    const isPass = row === null && col === null || !isValidMove(row, col, board, currentPlayer);
    let newBoard = board;
    let flipped = [];
    let flipCount = 0;
    let damage = 0;
  
    if (!isPass) {
      setHistory(prev => [...prev, createSnapshot()]);
      setFuture([]);
  
      flipped = getFlippableStones(row, col, board, currentPlayer);
      newBoard = board.map(row => row.slice());
      newBoard[row][col] = { color: currentPlayer, source: 'placed' };
      flipped.forEach(([r, c]) => {
        newBoard[r][c] = { color: currentPlayer, source: 'flipped' };
      });
  
      flipCount = flipped.length;
      damage = calculateDamage({ flipCount, isThreat, threatLevel });
  
      const turnNum = Math.ceil(turnCount / 2);
      const log = formatLogEntry(currentPlayer, turnNum, damage);
      setLogs(prev => [...prev, log]);
    }
  
    let newBlack = blackScore;
    let newWhite = whiteScore;
  
    if (!isPass) {
      if (currentPlayer === 'black') {
        newWhite = Math.max(0, whiteScore - damage);
        setWhiteScore(newWhite);
      } else {
        newBlack = Math.max(0, blackScore - damage);
        setBlackScore(newBlack);
      }
    }
  
    const newPassCount = isPass ? passCount + 1 : 0;

    if (!isPass) {
      setBoard(newBoard);
    }

    const gameEnded = checkGameEnd(newPassCount, newBlack, newWhite);
    if (gameEnded) return;
  
    setIsBlackTurn(prev => !prev);
    setTurnCount(prev => prev + 1);
    setPassCount(newPassCount);
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
    setPassCount(0);
    setGameOver(false);
    setWinner(null);
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
      {gameOver && (
        <div className="result-banner">
          <h2>ゲーム終了</h2>
          <p>{winner}</p>
        </div>
      )}
      <button onClick={onBack}>← メニューに戻る</button>
      <LogBox logs={logs} />
    </div>
  );
};

export default PvPBoard;
