import React, { useState, useEffect, useRef } from 'react';
import Light from './components/light';
import Controls from './components/controls';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('ready'); // ready, waiting, go, falseStart, result
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [reactionTime, setReactionTime] = useState(null);
  const goTimeRef = useRef(null);
  const timeoutRefs = useRef([]);

  const startGame = () => {
    setGameState('waiting');
    setLights([false, false, false, false, false]);
    setReactionTime(null);

    // Sequential light-up
    timeoutRefs.current = [];
    for (let i = 0; i < 5; i++) {
      timeoutRefs.current.push(
        setTimeout(() => {
          setLights(prev => {
            const newLights = [...prev];
            newLights[i] = true;
            return newLights;
          });
        }, 1000 + i * 800)
      );
    }

    // Random go time after last light
    const goDelay = 1000 + Math.random() * 2000;
    const goTime = 1000 + 5 * 800 + goDelay;

    timeoutRefs.current.push(
      setTimeout(() => {
        setLights([false, false, false, false, false]);
        setGameState('go');
        goTimeRef.current = Date.now();
      }, goTime)
    );
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      cleanupTimers();
      setGameState('falseStart');
    } else if (gameState === 'go') {
      const time = Date.now() - goTimeRef.current;
      setReactionTime(time);
      setGameState('result');
    }
  };

  const restartGame = () => {
    cleanupTimers();
    setGameState('ready');
    setLights([false, false, false, false, false]);
    setReactionTime(null);
  };

  const cleanupTimers = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return () => cleanupTimers(); // Clean on unmount
  }, []);

  return (
    <div className="app">
      <h1>F1 Reaction Test</h1>
      <Light lights={lights} />
      <Controls
        gameState={gameState}
        onStart={startGame}
        onClick={handleClick}
        onRestart={restartGame}
        reactionTime={reactionTime}
      />
    </div>
  );
}

export default App;
