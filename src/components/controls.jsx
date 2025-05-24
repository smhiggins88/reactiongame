import React from 'react';
import './controls.css';

function Controls({ gameState, onStart, onClick, onRestart, reactionTime, bestTime }) {
  return (
    <div className="controls">
      {gameState === 'ready' && (
        <button onClick={onStart}>Start</button>
      )}

      {gameState === 'waiting' && (
        <button onClick={onClick}>Get ready...</button>
      )}

      {gameState === 'go' && (
        <button onClick={onClick}>GO!</button>
      )}

      {gameState === 'falseStart' && (
        <>
          <p className="result-text" style={{ color: 'red' }}>False Start!</p>
          <button onClick={onRestart}>Try Again</button>
        </>
      )}

      {gameState === 'result' && (
        <>
          <p className="result-text">Your time: {reactionTime} ms</p>
          <p className="f1-benchmark">Average F1 driver: 250 ms</p>
          {bestTime !== null && (
            <p className="best-time">Your best: {bestTime} ms</p>
          )}
          <button onClick={onRestart}>Try Again</button>
        </>
      )}
    </div>
  );
}

export default Controls;
