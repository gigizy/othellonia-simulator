import React from 'react';
const ScoreBoard = ({ black, white }) => {
  return (
    <div className="scoreboard">
      <div>黒スコア: {black}</div>
      <div>白スコア: {white}</div>
    </div>
  );
};

export default ScoreBoard;
