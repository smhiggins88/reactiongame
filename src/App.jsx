import React, { useState, useEffect, useRef, useCallback } from 'react';
import Light from './components/Light';
import Controls from './components/Controls';
import './App.css';

function App() {
    const [lights, setLights] = useState(Array(5).fill(false));
    const [message, setMessage] = useState('Wait for the lights to go out...');
    const [result, setResult] = useState('Your Reaction Time: -- ms');
    const [gameActive, setGameActive] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const reactionStartTime = useRef(null);
    const lightIntervalRef = useRef(null);
    const timeoutBeforeOffRef = useRef(null);

    const resetGame = useCallback(() => {
        clearInterval(lightIntervalRef.current);
        clearTimeout(timeoutBeforeOffRef.current);
        setLights(Array(5).fill(false));
        setMessage('Wait for the lights to go out...');
        setResult('Your Reaction Time: -- ms');
        reactionStartTime.current = null;
        setGameActive(false);
        setGameStarted(false);
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        setGameStarted(true);
        setMessage('Get ready...');
        setGameActive(true);

        // --- TIMING ADJUSTMENTS START HERE ---
        const numberOfLights = lights.length;
        const maxTotalWaitTime = 3000; // Maximum total time in milliseconds (3 seconds)
        const minTimePerLight = 200; // Minimum time for each light to turn on
        const maxTimePerLight = 600; // Maximum time for each light to turn on

        let accumulatedLightOnTime = 0;
        const lightDelays = [];

        // Determine delays for each light to turn on
        for (let i = 0; i < numberOfLights; i++) {
            const delay = Math.random() * (maxTimePerLight - minTimePerLight) + minTimePerLight;
            lightDelays.push(delay);
            accumulatedLightOnTime += delay;
        }

        // The time remaining after all lights have turned on, before they all go off
        // Ensure this remaining time is at least a reasonable minimum (e.g., 500ms)
        let delayBeforeLightsOff = Math.max(500, maxTotalWaitTime - accumulatedLightOnTime);
        // Add some small randomness to the final "GO" delay within the remaining time
        delayBeforeLightsOff = delayBeforeLightsOff * 0.5 + Math.random() * (delayBeforeLightsOff * 0.5);
        delayBeforeLightsOff = Math.max(500, Math.min(2000, delayBeforeLightsOff)); // Cap between 0.5s and 2s for more controlled feel


        let lightIndex = 0;

        // Sequence for turning lights ON
        lightIntervalRef.current = setInterval(() => {
            if (lightIndex < numberOfLights) {
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[lightIndex] = true;
                    return newLights;
                });
                lightIndex++;
            } else {
                clearInterval(lightIntervalRef.current); // All lights are red
                // Now, set the final timeout for lights to go off
                timeoutBeforeOffRef.current = setTimeout(() => {
                    setLights(Array(numberOfLights).fill(false)); // All lights off (GO!)
                    setMessage('GO!');
                    reactionStartTime.current = Date.now(); // Record the GO time
                }, delayBeforeLightsOff);
            }
        }, minTimePerLight); // This interval sets the minimum pace, individual light delays fine-tune it

        // To make the light sequence more precisely timed, we need to use nested timeouts
        // instead of a single setInterval for the lights turning on.
        // Let's re-implement this part for better control over cumulative timing.

        let currentLightDelaySum = 0;
        lightDelays.forEach((delay, index) => {
            currentLightDelaySum += delay;
            setTimeout(() => {
                setLights(prevLights => {
                    const newLights = [...prevLights];
                    newLights[index] = true;
                    return newLights;
                });
            }, currentLightDelaySum);
        });

        // This ensures the "GO!" signal happens at the precise calculated total time.
        // It should happen after all lights have turned on.
        timeoutBeforeOffRef.current = setTimeout(() => {
            setLights(Array(numberOfLights).fill(false)); // All lights off (GO!)
            setMessage('GO!');
            reactionStartTime.current = Date.now(); // Record the GO time
        }, accumulatedLightOnTime + delayBeforeLightsOff); // Total time from start to GO!

        // --- TIMING ADJUSTMENTS END HERE ---

    }, [lights.length, resetGame]);


    const recordReactionTime = useCallback(() => {
        if (!gameActive) return;

        if (!reactionStartTime.current) {
            setMessage('Too soon! You reacted before the lights went out.');
            setResult('Your Reaction Time: -- ms');
            setGameActive(false);
            clearInterval(lightIntervalRef.current);
            clearTimeout(timeoutBeforeOffRef.current);
            setLights(Array(5).fill(false));
            return;
        }

        const reactionTime = Date.now() - reactionStartTime.current;
        setResult(`Your Reaction Time: ${reactionTime} ms`);
        setMessage('Well done!');
        setGameActive(false);
        clearInterval(lightIntervalRef.current);
        clearTimeout(timeoutBeforeOffRef.current);
    }, [gameActive]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (gameActive && (event.code === 'Space' || event.code === 'Enter')) {
                recordReactionTime();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            clearInterval(lightIntervalRef.current);
            clearTimeout(timeoutBeforeOffRef.current);
        };
    }, [gameActive, recordReactionTime]);

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
                showStart={!gameStarted || (!gameActive && reactionStartTime.current !== null)}
                showRestart={!gameActive && reactionStartTime.current !== null}
                buttonText={gameActive ? 'Click to react' : 'Start Game'}
            />

            <div className="ad-container">
                <p>[Your Ad Will Go Here]</p>
            </div>
        </div>
    );
}

export default App;