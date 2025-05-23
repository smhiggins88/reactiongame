import React, { useState, useEffect, useRef, useCallback } from 'react';
import Light from './components/Light';
import Controls from './components/Controls'; // Although we'll reuse the button, the component name remains useful
import './App.css'; // Main styles for the app

function App() {
    const [lights, setLights] = useState(Array(5).fill(false)); // true for red, false for off
    const [message, setMessage] = useState('Wait for the lights to go out...');
    const [result, setResult] = useState('Your Reaction Time: -- ms');
    const [gameActive, setGameActive] = useState(false); // True when lights are sequence or waiting for GO
    const [gameStarted, setGameStarted] = useState(false); // True once "Start Game" is pressed initially

    // useRef is used for values that persist across renders but don't cause re-renders
    const reactionStartTime = useRef(null); // Stores the exact timestamp when lights turn off
    const lightIntervalRef = useRef(null); // Stores the interval ID for lights turning on
    const timeoutBeforeOffRef = useRef(null); // Stores the timeout ID for lights turning off

    // Resets the game to its initial state
    const resetGame = useCallback(() => {
        clearInterval(lightIntervalRef.current);
        clearTimeout(timeoutBeforeOffRef.current);
        setLights(Array(5).fill(false)); // All lights off
        setMessage('Wait for the lights to go out...');
        setResult('Your Reaction Time: -- ms');
        reactionStartTime.current = null;
        setGameActive(false); // Not actively playing
        setGameStarted(false); // Back to pre-game state
    }, []);

    // Starts the game sequence
    const startGame = useCallback(() => {
        resetGame(); // Ensure a clean slate
        setGameStarted(true); // Game has been initiated
        setMessage('Get ready...');
        setGameActive(true); // Game sequence is now active (lights are coming)

        let lightIndex = 0;
        // Interval for turning on lights one by one
        lightIntervalRef.current = setInterval(() => {
            if (lightIndex < lights.length) {
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[lightIndex] = true; // Turn current light red
                    return newLights;
                });
                lightIndex++;
            } else {
                // All lights are red, clear this interval
                clearInterval(lightIntervalRef.current);
                // Now, wait a random time (1.5 to 4.5 seconds) before turning them all off
                const delayBeforeOff = Math.random() * 3000 + 1500;
                timeoutBeforeOffRef.current = setTimeout(() => {
                    setLights(Array(5).fill(false)); // Turn all lights off
                    setMessage('GO!');
                    reactionStartTime.current = Date.now(); // Record the GO time
                }, delayBeforeOff);
            }
        }, Math.random() * 500 + 500); // Random delay between lights turning on (0.5 to 1 second)
    }, [lights.length, resetGame]); // Dependencies for useCallback

    // Records the reaction time when the user clicks or presses a key
    const recordReactionTime = useCallback(() => {
        if (!gameActive) return; // Ignore input if game is not in an active playing state

        // Check if the click happened before the lights turned off (too early)
        if (!reactionStartTime.current) {
            setMessage('Too soon! You reacted before the lights went out.');
            setResult('Your Reaction Time: -- ms');
            setGameActive(false); // Game over due to early click
            // Clear any pending timers
            clearInterval(lightIntervalRef.current);
            clearTimeout(timeoutBeforeOffRef.current);
            setLights(Array(5).fill(false)); // Ensure lights are off
            return;
        }

        // Calculate and display reaction time
        const reactionTime = Date.now() - reactionStartTime.current;
        setResult(`Your Reaction Time: ${reactionTime} ms`);
        setMessage('Well done!');
        setGameActive(false); // Game over, result displayed
        // Clear timers to prevent further game actions
        clearInterval(lightIntervalRef.current);
        clearTimeout(timeoutBeforeOffRef.current);
    }, [gameActive]); // Dependencies for useCallback

    // Effect hook for keyboard input (Space or Enter key)
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (gameActive && (event.code === 'Space' || event.code === 'Enter')) {
                recordReactionTime();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        // Cleanup function: runs when component unmounts or before effect re-runs
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            // Crucial: clear any active timers to prevent memory leaks or unexpected behavior
            clearInterval(lightIntervalRef.current);
            clearTimeout(timeoutBeforeOffRef.current);
        };
    }, [gameActive, recordReactionTime]); // Dependencies for useEffect

    return (
        <div className="container" onClick={recordReactionTime}>
            <h1>Reaction Time Test</h1>
            <div className="light-container">
                {lights.map((isActive, index) => (
                    <Light key={index} isActive={isActive} />
                ))}
            </div>
            <p id="message">{message}</p>
            <p id="result">{result}</p>

            <Controls
                onStart={startGame}
                onRestart={resetGame}
                // Conditional rendering and text for the button
                showStart={!gameStarted || (!gameActive && reactionStartTime.current !== null)} // Show start if not started or if game ended successfully
                showRestart={!gameActive && reactionStartTime.current !== null} // Show restart if game has ended (either too soon or success)
                buttonText={gameActive ? 'Click to react' : 'Start Game'} // Change button text based on game state
            />

            {/* Ad placeholder - you'll replace this with actual ad code */}
            <div className="ad-container">
                <p>[Your Ad Will Go Here]</p>
            </div>
        </div>
    );
}

export default App;