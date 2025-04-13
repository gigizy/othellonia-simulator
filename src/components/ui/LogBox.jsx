import React from 'react';
import '../../styles/Board.css';

const LogBox = ({ logs = [], mode = 'pvc' }) => {
  return (
    <div className="log-box">
      <h3>バトルログ</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {[...logs].reverse().map((entry, index) => (
          <li
            key={index}
            className={`log-entry ${entry.className || ''}`.trim()}
          >
            {typeof entry === 'string' ? entry : entry.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogBox;
