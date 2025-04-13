import React from 'react';
import Board from './components/Board';
import './App.css'; 

function App() {
  return (
    <div className="container">
      <h1 className="title">オセロニア<br />シミュレーション</h1>
      <Board />
    </div>
  );
}

export default App;
