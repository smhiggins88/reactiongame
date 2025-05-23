import React from 'react';
import './light.css';

function Light({ lights }) {
  return (
    <div className="light-container">
      {lights.map((on, index) => (
        <div
          key={index}
          className={`light ${on ? 'on' : ''}`}
        />
      ))}
    </div>
  );
}

export default Light;
