import React from 'react';

const Controls = ({ onStart, onRestart, showStart, showRestart, buttonText }) => {
    return (
        <div className="controls">
            {showStart && (
                // This button now serves dual purpose
                <button onClick={onStart}>{buttonText}</button>
            )}
            {/* The restart button logic remains similar, but it will only appear after a game completes */}
            {showRestart && (
                <button onClick={onRestart}>Restart Game</button>
            )}
        </div>
    );
};

export default Controls;