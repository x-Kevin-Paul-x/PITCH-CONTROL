import React from 'react';
import { useGameState } from '../hooks/useGameState';
import './MainMenu.css';

const MainMenu = () => {
    const { startGame } = useGameState();

    return (
        <div className="main-menu full-screen flex-center">
            <div className="menu-content">
                <h1 className="game-title text-gradient">PITCH CONTROL</h1>
                <p className="game-subtitle">Tactical Sealed Football</p>

                <div className="menu-buttons">
                    <button
                        className="menu-btn primary"
                        onClick={() => startGame('STANDARD')}
                    >
                        <span className="btn-title">Standard Duel</span>
                        <span className="btn-desc">Draft from a shared pool. 1 Match.</span>
                    </button>

                    <button
                        className="menu-btn secondary"
                        onClick={() => startGame('TRI_SQUAD')}
                    >
                        <span className="btn-title">Tri-Squad Arena</span>
                        <span className="btn-desc">Open 15 cards. Build 3 Squads. 3 Matches.</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
