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
    const currentTimeout = useRef(null); // To hold the ID of the currently active setTimeout

    // Clears any active timer and resets game state
    const resetGame = useCallback(() => {
        clearTimeout(currentTimeout.current); // Clear the single active timeout
        currentTimeout.current = null;

        setLights(Array(5).fill(false)); // All lights off
        setMessage('Click "Start Game" to begin!');
        setResult('Your Reaction Time: -- ms');
        reactionStartTime.current = null;
        setGamePhase('idle'); // Back to idle state
    }, []);

    // Function to handle the game's sequencing logic
    const handleGameSequence = useCallback((currentIndex = 0, accumulatedDelay = 0) => {
        const numberOfLights = lights.length;
        // --- ADJUST THESE VALUES TO SPEED UP LIGHTS ---
        const minTimePerLight = 100; // Was 200ms
        const maxTimePerLight = 300; // Was 600ms
        // --- END ADJUSTMENT ---

        const maxTotalWaitTime = 4500; // Max total time from start to GO! (4.5 seconds)

        if (currentIndex < numberOfLights) {
            // Phase: Sequencing lights ON
            const delay = Math.random() * (maxTimePerLight - minTimePerLight) + minTimePerLight;
            const newAccumulatedDelay = accumulatedDelay + delay;

            currentTimeout.current = setTimeout(() => {
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[currentIndex] = true; // Turn the current light red
                    return newLights;
                });
                // Recursively call for the next light
                handleGameSequence(currentIndex + 1, newAccumulatedDelay);
            }, delay); // Schedule based on the *individual* delay for this light
        } else {
            // Phase: All lights are red, now schedule the "GO!" signal
            setGamePhase('go-wait'); // Transition to waiting for GO
            setMessage('GO!'); // Prepare message for GO, even if lights are still red momentarily

            let delayBeforeLightsOff = Math.random() * 1000 + 300; // Adjusted: 0.3 to 1.3 seconds after all lights are red
            const expectedGoTime = accumulatedDelay + delayBeforeLightsOff;

            // Adjust final delay if it pushes total time beyond maxTotalWaitTime
            if (expectedGoTime > maxTotalWaitTime) {
                delayBeforeLightsOff = maxTotalWaitTime - accumulatedDelay;
                if (delayBeforeLightsOff < 300) delayBeforeLightsOff = 300; // Ensure minimum
            }

            currentTimeout.current = setTimeout(() => {
                setLights(Array(numberOfLights).fill(false)); // ALL LIGHTS OFF - THIS IS THE SIGNAL!
                reactionStartTime.current = Date.now(); // Record the exact moment lights go off
            }, delayBeforeLightsOff);
        }
    }, [lights.length, setLights, setGamePhase]);


    // Effect to manage the game flow based on gamePhase
    useEffect(() => {
        if (gamePhase === 'sequencing') {
            setMessage('Get ready...');
            setLights(Array(lights.length).fill(false)); // Ensure all lights are off before starting sequence
            handleGameSequence(); // Start the first light's sequence
        }

        // Cleanup on unmount or phase change
        return () => {
            clearTimeout(currentTimeout.current);
            currentTimeout.current = null;
        };
    }, [gamePhase, lights.length, handleGameSequence]); // Dependencies for useEffect


    // Starts the game. Only transitions the phase.
    const startGame = useCallback(() => {
        resetGame(); // Ensure a clean slate
        setGamePhase('sequencing'); // Start the sequencing phase
    }, [resetGame]);

    // Records the reaction time when the user clicks or presses a key
    const recordReactionTime = useCallback(() => {
        // Only react if the game is in 'sequencing' (too soon) or 'go-wait' phase
        if (gamePhase === 'idle' || gamePhase === 'result' || gamePhase === 'too-soon') {
            return; // Ignore clicks if not in an active play phase
        }

        clearTimeout(currentTimeout.current); // Clear any active timer immediately
        currentTimeout.current = null;

        if (gamePhase === 'sequencing') {
            // Clicked too early (before "GO!" signal)
            setMessage('Too soon! You reacted before the lights went out.');
            setResult('Your Reaction Time: -- ms');
            setLights(Array(5).fill(false)); // Ensure lights are off
            setGamePhase('too-soon'); // Set game phase to 'too-soon'
        } else if (gamePhase === 'go-wait') {
            // Valid reaction after "GO!"
            const reactionTime = Date.now() - reactionStartTime.current;
            setResult(`Your Reaction Time: ${reactionTime} ms`);
            setMessage('Well done!');
            setGamePhase('result'); // Set game phase to 'result'
        }
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

        // Cleanup function for event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
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
                showStart={showStartButton} // Use the calculated boolean
                showRestart={showRestartButton} // Use the calculated boolean
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