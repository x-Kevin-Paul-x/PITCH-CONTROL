import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../utils/soundEngine';
import './MatchDie.css';

const MatchDie = ({ rolling, face }) => {
    const [result, setResult] = useState('ATT');
    const [showFlash, setShowFlash] = useState(false);
    const prevRolling = useRef(rolling);

    useEffect(() => {
        let interval;
        if (rolling) {
            sound.playDiceRoll();
            // Rapidly cycle faces for a rolling effect
            interval = setInterval(() => {
                const faces = ['ATT', 'MID', 'DEF', 'GK'];
                setResult(faces[Math.floor(Math.random() * faces.length)]);
            }, 70);
        } else {
            if (face) {
                setResult(face);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [rolling, face]);

    // Handle landing impact flash & rumble
    useEffect(() => {
        if (prevRolling.current === true && rolling === false && face) {
            setShowFlash(true);
            sound.playWaxSealClick();
            const timer = setTimeout(() => setShowFlash(false), 600);
            return () => clearTimeout(timer);
        }
        prevRolling.current = rolling;
    }, [rolling, face]);

    return (
        <div className={`die-container-scene ${showFlash ? 'impact-rumble' : ''}`}>
            {/* Landing flash layer */}
            {showFlash && <div className={`screen-flash-glow face-${result.toLowerCase()}`} />}

            {/* Die shadow */}
            <div className={`die-shadow ${rolling ? 'rolling' : ''}`}></div>

            <div className="scene">
                <div className={`cube ${rolling ? 'rolling' : ''} show-${result}`}>
                    <div className="cube__face cube__face--front">
                        <span className="face-icon">⚔️</span>
                        <span className="face-inner-txt att">ATT</span>
                    </div>
                    <div className="cube__face cube__face--back">
                        <span className="face-icon">🛡️</span>
                        <span className="face-inner-txt def">DEF</span>
                    </div>
                    <div className="cube__face cube__face--right">
                        <span className="face-icon">⚜️</span>
                        <span className="face-inner-txt mid">MID</span>
                    </div>
                    <div className="cube__face cube__face--left">
                        <span className="face-icon">🧤</span>
                        <span className="face-inner-txt gk">GK</span>
                    </div>
                    <div className="cube__face cube__face--top">
                        <span className="face-icon">⚔️</span>
                        <span className="face-inner-txt att-top">ATT</span>
                    </div>
                    <div className="cube__face cube__face--bottom">
                        <span className="face-icon">⚜️</span>
                        <span className="face-inner-txt mid-bottom">MID</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchDie;
