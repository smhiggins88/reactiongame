import React from 'react';
import './controls.css';

function Controls({ gameState, onStart, onClick, onRestart, reactionTime }) {
  return (
    <div className="controls">
      {gameState === 'ready' && <button onClick={onStart}>Start</button>}

      {gameState === 'waiting' && <button onClick={onClick}>React!</button>}

      {gameState === 'go' && <button onClick={onClick}>React!</button>}

      {gameState === 'falseStart' && (
        <>
          <p className="result-text">False Start!</p>
          <button onClick={onRestart}>Try Again</button>
        </>
      )}

      {gameState === 'result' && (
        <>
          <p className="result-text">Your time: {reactionTime} ms</p>
          <button onClick={onRestart}>Try Again</button>
        </>
      )}
    </div>
  );
}

export default Controls;
