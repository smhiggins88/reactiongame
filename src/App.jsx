import React, { useState, useEffect, useRef, useCallback } from 'react';
import Light from './components/Light';
import Controls from './components/Controls';
import './App.css';

function App() {
    const [lights, setLights] = useState(Array(5).fill(false)); // true for red, false for off
    const [message, setMessage] = useState('Click "Start Game" to begin!');
    const [result, setResult] = useState('Your Reaction Time: -- ms');
    const [gamePhase, setGamePhase] = useState('idle'); // 'idle', 'sequencing', 'go-wait', 'result', 'too-soon'

    const reactionStartTime = useRef(null); // Stores the exact timestamp when lights turn off
    const allTimeouts = useRef([]); // To hold all setTimeout IDs for clearing

    // Clears all timers and resets game state
    const resetGame = useCallback(() => {
        allTimeouts.current.forEach(id => clearTimeout(id));
        allTimeouts.current = []; // Clear the stored IDs

        setLights(Array(5).fill(false)); // All lights off
        setMessage('Click "Start Game" to begin!');
        setResult('Your Reaction Time: -- ms');
        reactionStartTime.current = null;
        setGamePhase('idle'); // Back to idle state
    }, []);

    // Starts the game sequence
    const startGame = useCallback(() => {
        resetGame(); // Ensure a clean slate
        setGamePhase('sequencing'); // Game is starting, lights will sequence

        const numberOfLights = lights.length;
        const maxTotalWaitTime = 4500; // Max total time from start to GO! (4.5 seconds)
        const minTimePerLight = 200; // Minimum time for each light to turn on
        const maxTimePerLight = 600; // Maximum time for each light to turn on

        let accumulatedDelay = 0;
        const tempTimeouts = []; // Collect timeouts for this specific sequence

        setMessage('Get ready...');

        // Schedule individual lights to turn on
        for (let i = 0; i < numberOfLights; i++) {
            const delay = Math.random() * (maxTimePerLight - minTimePerLight) + minTimePerLight;
            accumulatedDelay += delay;

            const timeoutId = setTimeout((indexToTurnOn) => {
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[indexToTurnOn] = true; // Turn the specific light red
                    return newLights;
                });
            }, accumulatedDelay, i); // Pass 'i' as an argument to setTimeout's callback
            tempTimeouts.push(timeoutId);
        }

        // Calculate the final delay before lights go off (GO!)
        let delayBeforeLightsOff = Math.random() * 1500 + 500; // Random pause after all lights are red (0.5 to 2 seconds)
        // Ensure total time is within maxTotalWaitTime
        const actualGoTime = accumulatedDelay + delayBeforeLightsOff;
        if (actualGoTime > maxTotalWaitTime) {
            delayBeforeLightsOff = maxTotalWaitTime - accumulatedDelay;
            // Ensure minimum if cut short
            if (delayBeforeLightsOff < 500) delayBeforeLightsOff = 500;
        }


        // Schedule the "GO!" signal (ALL lights turn off)
        const goSignalTimeoutId = setTimeout(() => {
            setLights(Array(numberOfLights).fill(false)); // ALL LIGHTS OFF - THIS IS THE SIGNAL!
            setMessage('GO!');
            reactionStartTime.current = Date.now(); // Record the exact moment lights go off
            setGamePhase('go-wait'); // Now waiting for user reaction
        }, accumulatedDelay + delayBeforeLightsOff); // Total time from start of sequence to GO!
        tempTimeouts.push(goSignalTimeoutId);

        allTimeouts.current = tempTimeouts; // Save all timeouts for clearing
    }, [lights.length, resetGame]);

    // Records the reaction time when the user clicks or presses a key
    const recordReactionTime = useCallback(() => {
        // Only react if the game is in 'sequencing' (too soon) or 'go-wait' phase
        if (gamePhase === 'idle' || gamePhase === 'result' || gamePhase === 'too-soon') {
             // If clicking after game ended, and it's the restart button,
             // the Controls component will handle it.
             // If clicking container when no game is active, just ignore.
            return;
        }

        // Clear all pending timers immediately after reaction
        allTimeouts.current.forEach(id => clearTimeout(id));
        allTimeouts.current = [];

        if (reactionStartTime.current === null || gamePhase === 'sequencing') {
            // Clicked too early (before "GO!" signal, which is when reactionStartTime is set)
            setMessage('Too soon! You reacted before the lights went out.');
            setResult('Your Reaction Time: -- ms');
            setLights(Array(5).fill(false)); // Ensure lights are off after early click
            setGamePhase('too-soon'); // Set game phase to 'too-soon'
        } else if (gamePhase === 'go-wait') {
            // Valid reaction after "GO!"
            const reactionTime = Date.now() - reactionStartTime.current;
            setResult(`Your Reaction Time: ${reactionTime} ms`);
            setMessage('Well done!');
            setGamePhase('result'); // Set game phase to 'result'
        }

        // No need to set gameActive to false here, gamePhase handles it
        // setGameActive(false); // This was previously problematic
    }, [gamePhase]);

    // Effect hook for handling keyboard input (Space or Enter key)
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (gamePhase === 'sequencing' || gamePhase === 'go-wait') {
                if (event.code === 'Space' || event.code === 'Enter') {
                    recordReactionTime();
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        // Cleanup function: runs when component unmounts or before effect re-runs
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            allTimeouts.current.forEach(id => clearTimeout(id));
            allTimeouts.current = [];
        };
    }, [gamePhase, recordReactionTime]); // Dependencies for useEffect

    // Determine button text and visibility based on gamePhase
    const showStartButton = (gamePhase === 'idle' || gamePhase === 'result' || gamePhase === 'too-soon');
    const mainButtonText = (gamePhase === 'sequencing' || gamePhase === 'go-wait') ? 'Click to react' : 'Start Game';
    const showRestartButton = (gamePhase === 'result' || gamePhase === 'too-soon');

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
                showStart={showStartButton}
                showRestart={showRestartButton}
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