import React from 'react';
import './Light.css'; // Styles specific to the light component

const Light = ({ isActive }) => {
    return (
        <div className={`light ${isActive ? 'red' : ''}`}></div>
    );
};

export default Light;