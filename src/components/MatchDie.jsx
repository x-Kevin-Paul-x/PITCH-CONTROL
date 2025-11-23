import React, { useEffect, useState } from 'react';
import './MatchDie.css';

const MatchDie = ({ onRollComplete, rolling, face }) => {
    const [result, setResult] = useState('ATT');

    useEffect(() => {
        let interval;
        if (rolling) {
            // Simulate rolling animation
            interval = setInterval(() => {
                const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
                setResult(faces[Math.floor(Math.random() * faces.length)]);
            }, 100);
        } else {
            if (face) {
                setResult(face);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [rolling, face]);

    // We need the parent to tell us what the final face is to rotate correctly
    // For now, let's just accept a prop `face` which is the target

    return (
        <div className="scene">
            <div className={`cube ${rolling ? 'rolling' : ''} show-${result}`}>
                <div className="cube__face cube__face--front">ATT</div>
                <div className="cube__face cube__face--back">DEF</div>
                <div className="cube__face cube__face--right">MID</div>
                <div className="cube__face cube__face--left">GK</div>
                <div className="cube__face cube__face--top">ATT</div>
                <div className="cube__face cube__face--bottom">MID</div>
            </div>
        </div>
    );
};

export default MatchDie;
