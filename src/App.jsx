import React, { useState } from 'react';
import PvCBoard from './components/PvCBoard';
import PvPBoard from './components/PvPBoard';
import './styles/Board.css';

function App() {
  const [screen, setScreen] = useState("menu");
  const [aiColor, setAIColor] = useState("white");

  if (screen === "menu") {
    return (
      <div className="container">
        <h1 className="title" style={{ textAlign: 'center' }}>オセロニア<br />シミュレーション</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={() => setScreen("pvp")}>PvP</button>
          <button onClick={() => setScreen("choose-ai")}>PvC</button>
        </div>
      </div>
    );
  }

  if (screen === "choose-ai") {
    return (
      <div className="container">
        <h2>先後を選択してください</h2>
        <div className="button-group">
          <button onClick={() => {
            setAIColor("white");
            setScreen("pvc");
          }}>先手</button>
          <button onClick={() => {
            setAIColor("black");
            setScreen("pvc");
          }}>後手</button>
        </div>
        <button onClick={() => setScreen("menu")}>← メニューに戻る</button>
      </div>
    );
  }

  if (screen === "pvp") {
    return (
      <div className="container">
        <PvPBoard onBack={() => setScreen("menu")} />
      </div>
    );
  }

  if (screen === "pvc") {
    return (
      <div className="container">
        <PvCBoard aiColor={aiColor} onBack={() => setScreen("menu")} />
      </div>
    );
  }

  return null;
}

export default App;
