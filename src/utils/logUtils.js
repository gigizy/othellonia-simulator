// logUtils.js
export const formatLogEntry = (player, playerTurnCount, damage) => {
    const icon = player === 'black' ? '⚫' : '⚪';
    const colorClass = player === 'black' ? 'log-entry-black' : 'log-entry-white';
    return {
      text: `${icon}TURN ${playerTurnCount}：${player === 'black' ? '白' : '黒'}に ${damage} ダメージ`,
      className: colorClass
    };
  };
  