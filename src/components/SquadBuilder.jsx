import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import Card from './Card';
import { sound } from '../utils/soundEngine';
import './SquadBuilder.css';

const SquadBuilder = () => {
    const { collection, triSquads, setTriSquads, assignToSquad, removeFromSquad, isSquadsReady, setPhase } = useGameState();
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [posFilter, setPosFilter] = useState('ALL');

    // Helper to check if card is in any squad
    const getCardSquad = (cardId) => {
        if (triSquads.set1.some(c => c.id === cardId)) return 1;
        if (triSquads.set2.some(c => c.id === cardId)) return 2;
        if (triSquads.set3.some(c => c.id === cardId)) return 3;
        return null;
    };

    const handleCardClick = (card) => {
        sound.playWaxSealClick();
        if (selectedCardId === card.id) {
            setSelectedCardId(null);
        } else {
            setSelectedCardId(card.id);
        }
    };

    const handleSquadClick = (squadIndex) => {
        if (selectedCardId) {
            const card = collection.find(c => c.id === selectedCardId);
            if (card) {
                assignToSquad(card, squadIndex);
                setSelectedCardId(null);
                sound.playCardFlip();
            }
        }
    };

    const handleRemoveFromSquad = (e, card) => {
        if (selectedCardId) return;
        e.stopPropagation();
        removeFromSquad(card);
        sound.playCardFlip();
    };

    const handleStartMatch = () => {
        if (isSquadsReady()) {
            sound.playWaxSealClick();
            setPhase('MATCH');
        }
    };

    const handleClearAll = () => {
        sound.playWaxSealClick();
        setTriSquads({ set1: [], set2: [], set3: [] });
    };

    const handleBalancedAutoBuild = () => {
        sound.playCardFlip();
        // Clear all first
        const sorted = [...collection].sort((a, b) => b.rating - a.rating);
        const s1 = [];
        const s2 = [];
        const s3 = [];

        // Snake draft distribution for optimal balance
        sorted.forEach((card, idx) => {
            const cycle = idx % 6;
            if (cycle === 0 || cycle === 5) s1.push(card);
            else if (cycle === 1 || cycle === 4) s2.push(card);
            else s3.push(card);
        });

        setTriSquads({
            set1: s1.slice(0, 5),
            set2: s2.slice(0, 5),
            set3: s3.slice(0, 5)
        });
    };

    // Calculate Set Stats
    const getSetMetrics = (setNum) => {
        const squad = triSquads[`set${setNum}`];
        if (squad.length === 0) return { avgRating: 0, hasGK: false, hasDF: false, hasFW: false };

        const avgRating = Math.round(squad.reduce((sum, c) => sum + c.rating, 0) / squad.length);
        const hasGK = squad.some(c => c.position === 'GK');
        const hasDF = squad.some(c => c.position === 'DF');
        const hasFW = squad.some(c => c.position === 'FW');

        return { avgRating, hasGK, hasDF, hasFW };
    };

    // Filter unassigned cards for the pool view
    const unassignedCards = collection
        .filter(c => getCardSquad(c.id) === null)
        .filter(c => posFilter === 'ALL' || c.position === posFilter)
        .sort((a, b) => b.rating - a.rating);

    return (
        <div className="squad-builder-container full-screen">
            <div className="sb-header">
                <div className="sb-title-group">
                    <h2 className="text-gradient">TRI-SQUAD COMMAND</h2>
                    <p className="sb-subtitle">Distribute 15 cards into 3 balanced 5-card battle squads.</p>
                </div>
                
                <div className="sb-actions">
                    <button className="auto-build-btn" onClick={handleBalancedAutoBuild}>
                        ⚖️ AUTO-BALANCE
                    </button>
                    <button className="clear-build-btn" onClick={handleClearAll}>
                        🔄 RESET
                    </button>
                    <button
                        className={`start-match-btn ${isSquadsReady() ? 'ready' : ''}`}
                        disabled={!isSquadsReady()}
                        onClick={handleStartMatch}
                    >
                        {isSquadsReady() ? 'ENTER ARENA ➔' : 'FILL ALL SETS (15/15)'}
                    </button>
                </div>
            </div>

            {/* 3 Tactical Sets Area */}
            <div className="squads-area">
                {[1, 2, 3].map(i => {
                    const metrics = getSetMetrics(i);
                    const squad = triSquads[`set${i}`];

                    return (
                        <div
                            key={i}
                            className={`squad-column ${selectedCardId ? 'highlight-target' : ''}`}
                            onClick={() => handleSquadClick(i)}
                        >
                            <div className="squad-header">
                                <div className="squad-title-box">
                                    <h3>SET {i} SQUAD</h3>
                                    {squad.length > 0 && (
                                        <span className="set-avg-badge">PWR: {metrics.avgRating}</span>
                                    )}
                                </div>
                                <span className={`count ${squad.length === 5 ? 'full' : ''}`}>
                                    {squad.length}/5
                                </span>
                            </div>

                            {/* Squad Slots */}
                            <div className="squad-slots">
                                {squad.map(card => (
                                    <div key={card.id} className="squad-card-slot-filled" onClick={(e) => handleRemoveFromSquad(e, card)}>
                                        <Card data={card} size="small" isFlipped={true} />
                                    </div>
                                ))}
                                {Array.from({ length: 5 - squad.length }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="empty-slot">
                                        <span>+ ADD</span>
                                    </div>
                                ))}
                            </div>

                            {/* Tactical Balance Hints */}
                            {squad.length === 5 && (
                                <div className="squad-balance-bar">
                                    {!metrics.hasGK && <span className="bal-warn" title="Missing Goalkeeper for GK contests">⚠️ No GK</span>}
                                    {!metrics.hasDF && <span className="bal-warn" title="Missing Defender for Defense contests">⚠️ No DF</span>}
                                    {!metrics.hasFW && <span className="bal-warn" title="Missing Forward for Attack contests">⚠️ No FW</span>}
                                    {metrics.hasGK && metrics.hasDF && metrics.hasFW && <span className="bal-ok">🛡️ Balanced Squad</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Recruits Pool Area */}
            <div className="pool-area">
                <div className="pool-controls">
                    <span className="pool-label">UNASSIGNED RECRUITS ({collection.filter(c => getCardSquad(c.id) === null).length})</span>
                    <div className="pos-filter-group">
                        {['ALL', 'FW', 'MF', 'DF', 'GK'].map(pos => (
                            <button
                                key={pos}
                                className={`pos-pill ${posFilter === pos ? 'active' : ''}`}
                                onClick={() => { sound.playWaxSealClick(); setPosFilter(pos); }}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pool-grid">
                    {unassignedCards.map(card => (
                        <div key={card.id} className={`pool-card-wrapper ${selectedCardId === card.id ? 'selected' : ''}`}>
                            <Card
                                data={card}
                                size="small"
                                isFlipped={true}
                                onClick={() => handleCardClick(card)}
                                className={selectedCardId === card.id ? 'selected-card' : ''}
                            />
                        </div>
                    ))}
                    {unassignedCards.length === 0 && (
                        <div className="empty-pool-msg">
                            {collection.filter(c => getCardSquad(c.id) === null).length === 0 
                                ? "✨ All 15 Recruits have been deployed across your 3 Squads!" 
                                : "No unassigned cards matching this position filter."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SquadBuilder;
