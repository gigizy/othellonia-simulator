import React from 'react';

const TurnIndicator = ({ isBlackTurn }) => {
  return (
    <div className="turn-indicator">
      <span className="stone-icon">
        <div className={`stone ${isBlackTurn ? 'stone-black' : 'stone-white'}`} />
      </span>
      {isBlackTurn ? "黒の番です" : "白の番です"}
    </div>
  );
};

export default TurnIndicator;
