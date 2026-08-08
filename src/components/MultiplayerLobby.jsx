import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';
import { useGameState } from '../hooks/useGameState';
import { CLUBS } from '../utils/cardsDatabase';
import ClubBadge from './ClubBadge';
import { sound } from '../utils/soundEngine';
import './MultiplayerLobby.css';

const MultiplayerLobby = () => {
    const { setPhase } = useGameState();
    const [desiredMode, setDesiredMode] = useState('STANDARD');
    const [status, setStatus] = useState('idle'); // idle, searching, creating, joining, matched
    const [roomCode, setRoomCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('Sir ' + ['Tristan', 'Percival', 'Bors', 'Lancelot', 'Gawain'][Math.floor(Math.random() * 5)]);
    const [selectedClubId, setSelectedClubId] = useState('ignis');
    const [copied, setCopied] = useState(false);

    const selectedClub = CLUBS.find(c => c.id === selectedClubId) || CLUBS[0];

    useEffect(() => {
        const socket = socketService.connect();

        socket.on('matched', (data) => {
            sound.playWaxSealClick();
            setStatus('matched');
            setTimeout(() => {
                setPhase('MULTIPLAYER_MATCH');
            }, 800);
        });

        socket.on('room_created', ({ roomId }) => {
            sound.playWaxSealClick();
            setRoomCode(roomId);
            setStatus('waiting_private');
        });

        socket.on('room_error', ({ message }) => {
            setError(message);
            setStatus('idle');
        });

        return () => {
            socket.off('matched');
            socket.off('room_created');
            socket.off('room_error');
        };
    }, []);

    const handleQuickMatch = () => {
        sound.playWaxSealClick();
        setStatus('searching');
        socketService.joinLobby(username, desiredMode);
    };

    const handleCreateRoom = () => {
        sound.playWaxSealClick();
        setStatus('creating');
        socketService.createPrivateRoom(username, desiredMode);
    };

    const handleJoinRoom = () => {
        if (!joinCode) return;
        sound.playWaxSealClick();
        setStatus('joining');
        socketService.joinPrivateRoom(username, joinCode);
    };

    const handleCopyCode = () => {
        if (!roomCode) return;
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        sound.playWaxSealClick();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="multiplayer-lobby full-screen flex-center">
            <div className="war-room-container glass-panel animated-fade-in">
                
                {/* Header Banner */}
                <div className="war-room-header">
                    <span className="realm-subtitle">REALM MULTIPLAYER ARENA</span>
                    <h1 className="war-room-title text-gradient-gold">⚔️ SOVEREIGN WAR ROOM ⚔️</h1>
                    <p className="war-room-desc">Challenge rival managers across Aurelia in real-time tactical duels.</p>
                </div>

                {status === 'idle' && (
                    <div className="war-room-body">
                        {/* Player Profile & House Banner Selector */}
                        <div className="profile-config-card glass-card">
                            <div className="profile-badge-preview">
                                <ClubBadge club={selectedClub} size="medium" />
                            </div>
                            <div className="profile-inputs">
                                <div className="input-group">
                                    <label>KNIGHT TITLE:</label>
                                    <input
                                        type="text"
                                        className="knight-name-input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        maxLength={20}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>SOVEREIGN HOUSE:</label>
                                    <select 
                                        className="house-select-dropdown"
                                        value={selectedClubId} 
                                        onChange={(e) => setSelectedClubId(e.target.value)}
                                    >
                                        {CLUBS.map(club => (
                                            <option key={club.id} value={club.id}>
                                                {club.name} ({club.focusAttribute} Focus)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Game Mode Selector Cards */}
                        <div className="mode-cards-grid">
                            <div 
                                className={`mode-card ${desiredMode === 'STANDARD' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setDesiredMode('STANDARD'); }}
                            >
                                <span className="mode-icon">⚔️</span>
                                <h4>1v1 Standard Duel</h4>
                                <p>5-round attribute battle using your custom drafted squad.</p>
                            </div>
                            <div 
                                className={`mode-card ${desiredMode === 'DRAFT' ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setDesiredMode('DRAFT'); }}
                            >
                                <span className="mode-icon">📜</span>
                                <h4>Winston Draft Duel</h4>
                                <p>Split and draft cards from a shared pool before fighting.</p>
                            </div>
                        </div>

                        {/* Matchmaking Actions */}
                        <div className="matchmaking-actions-grid">
                            {/* Quick Match */}
                            <button className="quick-match-btn btn-wax-seal" onClick={handleQuickMatch}>
                                🗡️ FIND QUICK MATCH
                            </button>

                            {/* Private Room Controls */}
                            <div className="private-room-box glass-card">
                                <h3>PRIVATE WAR ROOM</h3>
                                <div className="private-btn-group">
                                    <button className="create-room-btn" onClick={handleCreateRoom}>
                                        👑 CREATE ROOM
                                    </button>
                                    <div className="join-room-input-group">
                                        <input
                                            type="text"
                                            placeholder="ENTER ROOM CODE (e.g. REALM-12)"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        />
                                        <button className="join-room-btn" onClick={handleJoinRoom}>
                                            JOIN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && <p className="error-banner">{error}</p>}
                    </div>
                )}

                {/* Searching Radar State */}
                {status === 'searching' && (
                    <div className="status-radar-box">
                        <div className="radar-spinner">
                            <span className="radar-emblem">⚔️</span>
                        </div>
                        <h3>SEARCHING AURELIA FOR RIVAL MANAGERS...</h3>
                        <p>Scanning all five sovereign houses for active opponents.</p>
                    </div>
                )}

                {/* Private Room Waiting State */}
                {status === 'waiting_private' && (
                    <div className="status-waiting-box">
                        <h3>YOUR WAR ROOM IS OPEN!</h3>
                        <p>Share this royal room code with your friend to connect instantly:</p>
                        
                        <div className="gold-room-code-box">
                            <span className="code-text">{roomCode}</span>
                            <button className="copy-code-btn" onClick={handleCopyCode}>
                                {copied ? '✓ COPIED!' : '📋 COPY CODE'}
                            </button>
                        </div>
                        
                        <div className="private-action-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', width: '100%', alignItems: 'center' }}>
                            <button 
                                className="quick-match-btn btn-wax-seal" 
                                style={{ maxWidth: '320px' }}
                                onClick={() => {
                                    sound.playWaxSealClick();
                                    socketService.joinLobby(username, desiredMode);
                                }}
                            >
                                ⚔️ START BATTLE NOW (VS RIVAL)
                            </button>
                            <span className="waiting-subtext" style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                                Searching for connected friends...
                            </span>
                        </div>

                        <div className="loader-pulse"></div>
                    </div>
                )}

                {/* Matched State */}
                {status === 'matched' && (
                    <div className="status-matched-box">
                        <span className="matched-icon">⚔️</span>
                        <h2 className="text-gradient-gold">OPPONENT LOCATED!</h2>
                        <p>Entering the Sovereign Arena...</p>
                    </div>
                )}

                {/* Footer Back Button */}
                <div className="war-room-footer">
                    <button className="back-to-menu-btn" onClick={() => { sound.playWaxSealClick(); setPhase('MENU'); }}>
                        📜 BACK TO ROYAL MENU
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MultiplayerLobby;