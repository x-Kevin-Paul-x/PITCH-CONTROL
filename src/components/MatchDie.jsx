import React, { useEffect, useState } from 'react';
import './MatchDie.css';

const MatchDie = ({ onRollComplete, rolling }) => {
    const [result, setResult] = useState('ATT');

    useEffect(() => {
        if (rolling) {
            // Simulate rolling time
            const duration = 2000;
            const interval = setInterval(() => {
                const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
                setResult(faces[Math.floor(Math.random() * faces.length)]);
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                // Final result is determined by parent usually, but here we can just generate it
                // Actually parent should pass the target result to ensure sync
            }, duration);
        }
    }, [rolling]);

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
