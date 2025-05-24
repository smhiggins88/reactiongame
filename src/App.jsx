import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Light from './components/light';
import Controls from './components/controls';
import About from './components/about';
import PrivacyPolicy from './components/privacyPolicy';
import Contact from './components/contact';
import './App.css';

function Game() {
  const [gameState, setGameState] = useState('ready');
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const goTimeRef = useRef(null);
  const timeoutRefs = useRef([]);

  const startGame = () => {
    setGameState('waiting');
    setLights([false, false, false, false, false]);
    setReactionTime(null);

    const lightInterval = 300;
    timeoutRefs.current = [];

    for (let i = 0; i < 5; i++) {
      timeoutRefs.current.push(
        setTimeout(() => {
          setLights(prev => {
            const newLights = [...prev];
            newLights[i] = true;
            return newLights;
          });
        }, 500 + i * lightInterval)
      );
    }

    const goDelay = 500 + Math.random() * 1000;
    const goTime = 500 + 5 * lightInterval + goDelay;

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
      setBestTime(prev => (prev === null || time < prev ? time : prev));
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
    return () => cleanupTimers();
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
        bestTime={bestTime}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <Link to="/">Game</Link> | <Link to="/about">About</Link> | <Link to="/privacy">Privacy</Link> | <Link to="/contact">Contact</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
