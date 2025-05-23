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
    const [currentLightIndex, setCurrentLightIndex] = useState(-1); // -1: no lights, 0-4: sequencing, 5: all red

    const reactionStartTime = useRef(null); // Stores the exact timestamp when lights turn off
    const lightTimeoutId = useRef(null); // Used for the next light's timeout
    const goTimeoutId = useRef(null); // Used for the GO! timeout

    // Clears all timers and resets game state to initial
    const resetGame = useCallback(() => {
        clearTimeout(lightTimeoutId.current);
        clearTimeout(goTimeoutId.current);

        setLights(Array(5).fill(false)); // All lights off
        setMessage('Click "Start Game" to begin!');
        setResult('Your Reaction Time: -- ms');
        reactionStartTime.current = null;
        setGameActive(false); // Game is not active
        setGameEnded(false); // Game has not ended (back to initial state)
        setCurrentLightIndex(-1); // Reset light index
    }, []);

    // Core function to schedule the next light or the GO signal
    const scheduleNextLightOrGo = useCallback((index) => {
        const numberOfLights = lights.length;

        // Base delays for individual lights
        const minTimePerLight = 200;
        const maxTimePerLight = 600;

        if (index < numberOfLights) {
            // Schedule the next light to turn on
            const delay = Math.random() * (maxTimePerLight - minTimePerLight) + minTimePerLight;
            lightTimeoutId.current = setTimeout(() => {
                setCurrentLightIndex(index + 1); // Move to the next light
            }, delay);
        } else {
            // All lights are red (index === numberOfLights)
            // Now schedule the GO signal (lights turn off)
            
            // Schedule the GO signal with a random delay
            let delayBeforeLightsOff = Math.random() * 3000 + 1000; // 1 to 4 seconds after all lights are red

            goTimeoutId.current = setTimeout(() => {
                setLights(Array(numberOfLights).fill(false)); // ALL LIGHTS OFF - THIS IS THE SIGNAL!
                setMessage('GO!');
                reactionStartTime.current = Date.now(); // Record the exact moment lights go off
            }, delayBeforeLightsOff);
        }
    }, [lights.length]); // Depends on lights.length for array size

    // Effect to handle the light sequencing and GO signal
    useEffect(() => {
        if (gameActive) {
            if (currentLightIndex === -1) {
                // Initial state for sequencing, start with the first light
                setMessage('Get ready...');
                setCurrentLightIndex(0);
            } else if (currentLightIndex < lights.length) {
                // Turn on the current light
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[currentLightIndex] = true;
                    return newLights;
                });
                // Schedule the next light
                scheduleNextLightOrGo(currentLightIndex);
            } else {
                // All lights are red (currentLightIndex === lights.length)
                // Now, `scheduleNextLightOrGo` was called when the *last* light was scheduled,
                // and it would have set up the `goTimeoutId`. No need to re-schedule here.
            }
        }
    }, [gameActive, currentLightIndex, lights.length, scheduleNextLightOrGo, setLights]);


    // Starts the game sequence
    const startGame = useCallback(() => {
        resetGame(); // Ensure a clean slate
        setGameActive(true); // Set game to active to begin the useEffect flow
    }, [resetGame]);


    // Records the reaction time when the user clicks or presses a key
    const recordReactionTime = useCallback(() => {
        if (!gameActive) return; // Ignore input if game is not in an active playing state

        // Clear all pending timers immediately after reaction
        clearTimeout(lightTimeoutId.current);
        clearTimeout(goTimeoutId.current);

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
        setCurrentLightIndex(-1); // Reset for next game
    }, [gameActive]);

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
            clearTimeout(lightTimeoutId.current);
            clearTimeout(goTimeoutId.current);
        };
    }, [gameActive, recordReactionTime]);

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
                showStart={!gameActive} // Only show the main button if game is NOT active
                showRestart={showRestartButton} // Only show restart if game has ended
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