import React, { useState, useEffect, useRef, useCallback } from 'react';
import Light from './components/Light';
import Controls from './components/Controls';
import './App.css';

function App() {
    const [lights, setLights] = useState(Array(5).fill(false)); // true for red, false for off
    const [message, setMessage] = useState('Click "Start Game" to begin!');
    const [result, setResult] = useState('Your Reaction Time: -- ms');
    const [gameActive, setGameActive] = useState(false); // True when lights are sequencing or waiting for GO
    const [gameEnded, setGameEnded] = useState(false); // True when a game has completed (too soon or success)

    // useRef is used for values that persist across renders but don't cause re-renders
    const reactionStartTime = useRef(null); // Stores the exact timestamp when lights turn off
    const lightSequenceTimeouts = useRef([]); // Stores IDs for timeouts that turn lights ON
    const goTimeoutRef = useRef(null); // Stores the ID for the timeout that triggers GO!

    // Clears all timers and resets game state to initial
    const resetGame = useCallback(() => {
        // Clear any existing timeouts to prevent old sequences from running
        lightSequenceTimeouts.current.forEach(id => clearTimeout(id));
        lightSequenceTimeouts.current = [];
        clearTimeout(goTimeoutRef.current);

        setLights(Array(5).fill(false)); // All lights off
        setMessage('Click "Start Game" to begin!');
        setResult('Your Reaction Time: -- ms');
        reactionStartTime.current = null;
        setGameActive(false); // Game is not active
        setGameEnded(false); // Game has not ended (back to initial state)
    }, []);

    // Starts the game sequence
    const startGame = useCallback(() => {
        resetGame(); // Always start with a clean slate
        setMessage('Get ready...');
        setGameActive(true); // Game sequence is now active (lights are coming)
        setGameEnded(false); // Reset game ended state

        const numberOfLights = lights.length;
        const maxTotalWaitTime = 4500; // Max total time from start to GO! (4.5 seconds)
        const minTimePerLight = 200; // Minimum time for each light to turn on
        const maxTimePerLight = 600; // Maximum time for each light to turn on

        let accumulatedLightOnTime = 0;
        const currentLightTimeouts = []; // To store timeouts for the current sequence

        // Schedule individual lights to turn on
        for (let i = 0; i < numberOfLights; i++) {
            const delay = Math.random() * (maxTimePerLight - minTimePerLight) + minTimePerLight;
            accumulatedLightOnTime += delay; // Sum up the delays for total light-on time

            // *** CRITICAL FIX HERE ***
            // Schedule the light to turn on after accumulated time
            const timeoutId = setTimeout((indexToTurnOn) => {
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[indexToTurnOn] = true; // Turn the specific light red
                    return newLights;
                });
            }, accumulatedLightOnTime, i); // Pass 'i' as an argument to setTimeout's callback

            currentLightTimeouts.push(timeoutId);
        }
        lightSequenceTimeouts.current = currentLightTimeouts; // Save all light-on timeouts

        // Calculate the final delay before lights go off (GO!)
        let delayBeforeLightsOff = Math.max(500, maxTotalWaitTime - accumulatedLightOnTime);
        // Add some small randomness to the final "GO" delay within the remaining time
        delayBeforeLightsOff = delayBeforeLightsOff * 0.5 + Math.random() * (delayBeforeLightsOff * 0.5);
        delayBeforeLightsOff = Math.max(500, Math.min(2000, delayBeforeLightsOff)); // Cap between 0.5s and 2s for controlled feel

        // Schedule the "GO!" signal (lights off)
        goTimeoutRef.current = setTimeout(() => {
            setLights(Array(numberOfLights).fill(false)); // ALL LIGHTS OFF - THIS IS THE SIGNAL!
            setMessage('GO!');
            reactionStartTime.current = Date.now(); // Record the exact moment lights go off
        }, accumulatedLightOnTime + delayBeforeLightsOff); // Total time from start of sequence to GO!

    }, [lights.length, resetGame]); // Dependencies for useCallback

    // Records the reaction time when the user clicks or presses a key
    const recordReactionTime = useCallback(() => {
        if (!gameActive) return; // Ignore input if game is not in an active playing state

        // Clear all pending timers immediately after reaction
        lightSequenceTimeouts.current.forEach(id => clearTimeout(id));
        lightSequenceTimeouts.current = [];
        clearTimeout(goTimeoutRef.current);

        // Check if the click happened before the lights turned off (too early)
        if (!reactionStartTime.current) {
            setMessage('Too soon! You reacted before the lights went out.');
            setResult('Your Reaction Time: -- ms');
            setLights(Array(5).fill(false)); // Ensure lights are off after early click
        } else {
            // Calculate and display reaction time
            const reactionTime = Date.now() - reactionStartTime.current;
            setResult(`Your Reaction Time: ${reactionTime} ms`);
            setMessage('Well done!');
        }

        setGameActive(false); // Game over
        setGameEnded(true); // Mark game as ended
    }, [gameActive]); // Dependencies for useCallback

    // Effect hook for handling keyboard input (Space or Enter key)
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
            // Crucial: clear any active timeouts if the component unmounts unexpectedly
            lightSequenceTimeouts.current.forEach(id => clearTimeout(id));
            clearTimeout(goTimeoutRef.current);
        };
    }, [gameActive, recordReactionTime]); // Dependencies for useEffect

    // Determine button text and visibility
    const mainButtonText = gameActive ? 'Click to react' : 'Start Game';
    const showRestartButton = gameEnded; // Only show restart button if game has ended

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
                showStart={!gameActive} // Always show this button unless game is active (i.e., lights are sequencing)
                showRestart={showRestartButton} // Only show if game has ended
                buttonText={mainButtonText}
            />

            {/* Ad placeholder - you'll replace this with actual ad code */}
            <div className="ad-container">
                <p>[Your Ad Will Go Here]</p>
            </div>
        </div>
    );
}

export default App;