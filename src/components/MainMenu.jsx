import React, { useState, useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { sound } from '../utils/soundEngine';
import './MainMenu.css';

const MainMenu = () => {
    const { startGame, setPhase, aiDifficulty, setAiDifficulty } = useGameState();
    const [muted, setMuted] = useState(sound.isMuted());

    const handleToggleMute = () => {
        const isMutedNow = sound.toggleMute();
        setMuted(isMutedNow);
        if (!isMutedNow) sound.playWaxSealClick();
    };

    const handleStart = (mode) => {
        sound.playWaxSealClick();
        startGame(mode);
    };

    const handleNav = (phaseName) => {
        sound.playWaxSealClick();
        setPhase(phaseName);
    };

    const handleDiffSelect = (level) => {
        sound.playWaxSealClick();
        setAiDifficulty(level);
    };

    // Generate floating ambient embers
    const embers = useMemo(() => {
        return Array.from({ length: 24 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${2 + Math.random() * 4}px`,
            duration: `${5 + Math.random() * 7}s`,
            delay: `${Math.random() * 5}s`,
            opacity: 0.2 + Math.random() * 0.6
        }));
    }, []);

    const difficultyDescriptions = {
        ROOKIE: {
            title: '⚔️ Knight Rookie (Greedy)',
            desc: 'Plays heuristically, selecting its highest fitting stat. Overkills often.'
        },
        PROFESSIONAL: {
            title: '🛡️ Commander (Minimax)',
            desc: 'Analyses moves ahead. Throws away low cards tactically to limit damage.'
        },
        VETERAN: {
            title: '⚜️ Grandmaster (Bayesian)',
            desc: 'Card counter. Estimates your hand based on the initial scouting pool.'
        },
        LEGEND: {
            title: '👑 Sovereign Legend (ISMCTS)',
            desc: 'Simulates thousands of matchups to calculate optimal play paths. Feels human and genius.'
        }
    };

    return (
        <div className="main-menu full-screen flex-center">
            {/* Audio Toggle Control */}
            <div className="audio-toggle-container">
                <button className="audio-toggle-btn" onClick={handleToggleMute}>
                    {muted ? '🔇 Muted' : '🔊 Realm Sound'}
                </button>
            </div>

            {/* Floating Medieval Embers */}
            <div className="embers-container">
                {embers.map(e => (
                    <div
                        key={e.id}
                        className="ember-particle"
                        style={{
                            left: e.left,
                            width: e.size,
                            height: e.size,
                            animationDuration: e.duration,
                            animationDelay: e.delay,
                            opacity: e.opacity
                        }}
                    />
                ))}
            </div>

            {/* Castle Pitch Background */}
            <div className="bg-castle-pitch"></div>

            <div className="menu-content glass-panel">
                <div className="heraldic-header">
                    <span className="heraldic-seal">❖</span>
                    <h1 className="game-title text-gradient-gold">PITCH CONTROL</h1>
                    <span className="heraldic-seal">❖</span>
                </div>
                <p className="game-subtitle">Medieval Sealed Football Card Battles</p>

                {/* AI Difficulty Selector */}
                <div className="difficulty-container">
                    <h3 className="diff-header-title">Select AI Champion Level</h3>
                    <div className="difficulty-selector">
                        {['ROOKIE', 'PROFESSIONAL', 'VETERAN', 'LEGEND'].map((level) => (
                            <button
                                key={level}
                                className={`diff-tab-btn ${aiDifficulty === level ? 'active' : ''}`}
                                onClick={() => handleDiffSelect(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <div className="difficulty-info">
                        <span className="diff-title-highlight">{difficultyDescriptions[aiDifficulty].title}</span>
                        <p className="diff-desc">{difficultyDescriptions[aiDifficulty].desc}</p>
                    </div>
                </div>

                <div className="menu-buttons">
                    <button
                        className="menu-btn btn-wax-seal"
                        onClick={() => handleStart('STANDARD')}
                    >
                        <span className="btn-title">⚔️ Standard Joust</span>
                        <span className="btn-desc">Winston Draft from a 10-card pool. 1 Duel.</span>
                    </button>

                    <button
                        className="menu-btn btn-wax-seal"
                        onClick={() => handleStart('TRI_SQUAD')}
                    >
                        <span className="btn-title">🛡️ Tri-Squad Arena</span>
                        <span className="btn-desc">Open 15 cards. Build 3 Squads. 3 Matches.</span>
                    </button>

                    <button
                        className="menu-btn btn-wax-seal multiplayer-glow"
                        onClick={() => handleNav('MULTIPLAYER_LOBBY')}
                    >
                        <span className="btn-title">🌐 Realm Multiplayer</span>
                        <span className="btn-desc">Duel online against rival managers across the realm.</span>
                    </button>

                    <button
                        className="menu-btn btn-wax-seal lore-binder-glow"
                        onClick={() => handleNav('LORE_BINDER')}
                    >
                        <span className="btn-title">📜 Royal Lore Binder</span>
                        <span className="btn-desc">Inspect 60 Houses across 3 Leagues and your album.</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
