import React, { useState, useEffect, useRef } from 'react';

const SIZE = 6;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0],  [1, 1],
];

export const createInitialBoard = () => {
  const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  board[2][2] = { color: 'white', source: 'initial' };
  board[2][3] = { color: 'black', source: 'initial' };
  board[3][2] = { color: 'black', source: 'initial' };
  board[3][3] = { color: 'white', source: 'initial' };
  return board;
};

export const isValidMove = (row, col, board, player) => {
  if (board[row][col] !== null) return false;

  const isFirstMove = board.flat().filter(cell => cell?.source === 'placed').length === 0;
  if (isFirstMove && player === 'black') {
    if (!(row === 4 && col === 3)) return false; // D5 だけ許可
  }

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

export const getFlippableStones = (row, col, board, player) => {
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

export const isCorner = (row, col) =>
  (row === 0 || row === SIZE - 1) && (col === 0 || col === SIZE - 1);

export const calculateDamage = ({ flipCount, isThreat, baseNs = 1500, baseSs = 1500 }) => {
  const ns = baseNs * Math.pow(1.2, Math.max(flipCount - 1, 0));
  const ss = isThreat ? baseSs + 2500 : baseSs;
  return Math.round(ns + ss);
};


export const formatLogEntry = (player, playerTurnCount, damage) => {
  const icon = player === 'black' ? '⚫' : '⚪';
  const colorClass = player === 'black' ? 'log-entry-black' : 'log-entry-white';
  return {
    text: `${icon} ${player}${playerTurnCount}: ${damage}ダメージ！`,
    className: colorClass
  };
};
