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

const PvCBoard = ({ aiColor = 'white', onBack }) => {
  const [board, setBoard] = useState(createInitialBoard());
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [blackScore, setBlackScore] = useState(30000);
  const [whiteScore, setWhiteScore] = useState(30000);
  const [logs, setLogs] = useState([]);
  const [turnCount, setTurnCount] = useState(1);

  const currentPlayer = isBlackTurn ? 'black' : 'white';

  const handleClick = (row, col, forcedColor = null) => {
    const player = forcedColor || currentPlayer;
    if (!isValidMove(row, col, board, player)) return;

    const flipped = getFlippableStones(row, col, board, player);
    const newBoard = board.map(row => row.slice());
    newBoard[row][col] = { color: player, source: 'placed' };
    flipped.forEach(([r, c]) => {
      newBoard[r][c] = { color: player, source: 'flipped' };
    });

    const flipCount = flipped.length;
    const isThreat = false; // optional: threat logic
    const damage = calculateDamage({ flipCount, isThreat });

    const turnNum = Math.ceil(turnCount / 2);
    const log = formatLogEntry(player, turnNum, damage);
    setLogs(prev => [...prev, log]);

    if (player === 'black') {
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
  };

  return (
    <div className="container">
      <ScoreBoard black={blackScore} white={whiteScore} />
      <TurnIndicator isBlackTurn={isBlackTurn} />
      <GameBoard
        currentPlayer={currentPlayer}
        onMove={handleClick}
        aiEnabled={true}
        aiColor={aiColor}
        logs={logs}
        updateLogs={setLogs}
        boardState={{ board, turnCount }}
        setBoardState={({ board, turnCount }) => {
          setBoard(board);
          setTurnCount(turnCount);
        }}
        setLogs={setLogs}
        setIsBlackTurn={setIsBlackTurn}
        setTurnCount={setTurnCount}
        setBlackScore={setBlackScore}
        setWhiteScore={setWhiteScore}
        showReset={true}
        onReset={handleReset}
      />

      <div className="controls">
        <button onClick={onBack}>← メニューに戻る</button>
      </div>
      <LogBox logs={logs} />
    </div>
  );
};

export default PvCBoard;
