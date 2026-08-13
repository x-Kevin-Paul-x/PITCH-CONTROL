import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../utils/soundEngine';
import './MatchDie.css';

const MatchDie = ({ rolling, face }) => {
    const [result, setResult] = useState('ATT');
    const [showImpact, setShowImpact] = useState(false);
    const prevRolling = useRef(rolling);

    useEffect(() => {
        let interval;
        if (rolling) {
            sound.playDiceRoll();
            // Rapidly cycle faces for a rolling effect
            interval = setInterval(() => {
                const faces = ['ATT', 'MID', 'DEF', 'GK'];
                setResult(faces[Math.floor(Math.random() * faces.length)]);
            }, 60);
        } else {
            if (face) {
                setResult(face);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [rolling, face]);

    // Handle landing impact flash, rumble, and shockwave ring
    useEffect(() => {
        if (prevRolling.current === true && rolling === false && face) {
            setShowImpact(true);
            sound.playWaxSealClick();
            const timer = setTimeout(() => setShowImpact(false), 700);
            return () => clearTimeout(timer);
        }
        prevRolling.current = rolling;
    }, [rolling, face]);

    const getFaceThemeName = (cat) => {
        switch (cat) {
            case 'ATT': return 'Attack Duel (ATT)';
            case 'MID': return 'Midfield Clash (MID)';
            case 'DEF': return 'Defense Bastion (DEF)';
            case 'GK': return 'Goalkeeper Trial (GK)';
            default: return cat;
        }
    };

    return (
        <div className={`die-arena-plinth ${showImpact ? 'impact-rumble' : ''}`}>
            {/* Arena plinth base markings */}
            <div className="plinth-base-ring"></div>
            <div className={`plinth-energy-well ${rolling ? 'surging' : ''} face-${result.toLowerCase()}`}></div>

            {/* Landing flash layer */}
            {showImpact && <div className={`screen-flash-glow face-${result.toLowerCase()}`} />}
            {showImpact && <div className="die-impact-shockwave" />}

            {/* Die shadow */}
            <div className={`die-shadow ${rolling ? 'rolling-shadow' : ''}`}></div>

            <div className="scene">
                <div className={`cube ${rolling ? 'rolling-tumble' : ''} show-${result}`}>
                    <div className="cube__face cube__face--front">
                        <div className="face-filigree-corner tl"></div>
                        <div className="face-filigree-corner tr"></div>
                        <div className="face-filigree-corner bl"></div>
                        <div className="face-filigree-corner br"></div>
                        <span className="face-icon">⚔️</span>
                        <span className="face-inner-txt att">ATT</span>
                        <span className="face-sub-label">STRIKE</span>
                    </div>
                    <div className="cube__face cube__face--back">
                        <div className="face-filigree-corner tl"></div>
                        <div className="face-filigree-corner tr"></div>
                        <div className="face-filigree-corner bl"></div>
                        <div className="face-filigree-corner br"></div>
                        <span className="face-icon">🛡️</span>
                        <span className="face-inner-txt def">DEF</span>
                        <span className="face-sub-label">AEGIS</span>
                    </div>
                    <div className="cube__face cube__face--right">
                        <div className="face-filigree-corner tl"></div>
                        <div className="face-filigree-corner tr"></div>
                        <div className="face-filigree-corner bl"></div>
                        <div className="face-filigree-corner br"></div>
                        <span className="face-icon">⚜️</span>
                        <span className="face-inner-txt mid">MID</span>
                        <span className="face-sub-label">CONTROL</span>
                    </div>
                    <div className="cube__face cube__face--left">
                        <div className="face-filigree-corner tl"></div>
                        <div className="face-filigree-corner tr"></div>
                        <div className="face-filigree-corner bl"></div>
                        <div className="face-filigree-corner br"></div>
                        <span className="face-icon">🧤</span>
                        <span className="face-inner-txt gk">GK</span>
                        <span className="face-sub-label">KEEP</span>
                    </div>
                    <div className="cube__face cube__face--top">
                        <div className="face-filigree-corner tl"></div>
                        <div className="face-filigree-corner tr"></div>
                        <div className="face-filigree-corner bl"></div>
                        <div className="face-filigree-corner br"></div>
                        <span className="face-icon">⚔️</span>
                        <span className="face-inner-txt att-top">ATT</span>
                        <span className="face-sub-label">STRIKE</span>
                    </div>
                    <div className="cube__face cube__face--bottom">
                        <div className="face-filigree-corner tl"></div>
                        <div className="face-filigree-corner tr"></div>
                        <div className="face-filigree-corner bl"></div>
                        <div className="face-filigree-corner br"></div>
                        <span className="face-icon">⚜️</span>
                        <span className="face-inner-txt mid-bottom">MID</span>
                        <span className="face-sub-label">CONTROL</span>
                    </div>
                </div>
            </div>

            {/* Active Contest Category Label Pill */}
            {!rolling && face && (
                <div className={`die-result-pill ${result.toLowerCase()}`}>
                    {getFaceThemeName(result)}
                </div>
            )}
        </div>
    );
};

export default MatchDie;
