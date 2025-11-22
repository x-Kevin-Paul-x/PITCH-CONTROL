import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import Card from './Card';
import './SquadBuilder.css';

const SquadBuilder = () => {
    const { collection, triSquads, assignToSquad, removeFromSquad, isSquadsReady, setPhase } = useGameState();
    const [selectedCardId, setSelectedCardId] = useState(null);

    // Helper to check if card is in any squad
    const getCardSquad = (cardId) => {
        if (triSquads.set1.some(c => c.id === cardId)) return 1;
        if (triSquads.set2.some(c => c.id === cardId)) return 2;
        if (triSquads.set3.some(c => c.id === cardId)) return 3;
        return null;
    };

    const handleCardClick = (card) => {
        if (selectedCardId === card.id) {
            setSelectedCardId(null); // Deselect
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
            }
        }
    };

    const handleRemoveFromSquad = (e, card) => {
        // If a card is selected, clicking an existing squad card should add the NEW card to the squad (bubble event),
        // NOT remove the existing one.
        if (selectedCardId) return;

        e.stopPropagation();
        removeFromSquad(card);
    };

    const handleStartMatch = () => {
        if (isSquadsReady()) {
            setPhase('MATCH');
        }
    };

    const handleQuickBuild = () => {
        // Get all currently unassigned cards
        let available = [...collection.filter(c => getCardSquad(c.id) === null)];

        // Iterate sets and fill them
        [1, 2, 3].forEach(setNum => {
            const currentSquad = triSquads[`set${setNum}`];
            const needed = 5 - currentSquad.length;

            if (needed > 0 && available.length >= needed) {
                const toAdd = available.slice(0, needed);
                // Remove from local available pool to avoid duplicates in this loop
                available = available.slice(needed);

                // Assign each
                toAdd.forEach(card => {
                    assignToSquad(card, setNum);
                });
            }
        });
    };

    // Filter unassigned cards for the pool view
    const unassignedCards = collection.filter(c => getCardSquad(c.id) === null);

    return (
        <div className="squad-builder-container full-screen">
            <div className="sb-header">
                <h2 className="text-gradient">SQUAD BUILDER</h2>
                <div className="sb-actions">
                    <button className="quick-build-btn" onClick={handleQuickBuild}>
                        QUICK BUILD
                    </button>
                    <button
                        className={`start-match-btn ${isSquadsReady() ? 'ready' : ''}`}
                        disabled={!isSquadsReady()}
                        onClick={handleStartMatch}
                    >
                        START MATCH
                    </button>
                </div>
            </div>

            <div className="squads-area">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`squad-column ${selectedCardId ? 'highlight-target' : ''}`}
                        onClick={() => handleSquadClick(i)}
                    >
                        <div className="squad-header">
                            <h3>SET {i}</h3>
                            <span className={`count ${triSquads[`set${i}`].length === 5 ? 'full' : ''}`}>
                                {triSquads[`set${i}`].length}/5
                            </span>
                        </div>
                        <div className="squad-slots">
                            {triSquads[`set${i}`].map(card => (
                                <div key={card.id} className="squad-card-slot-filled" onClick={(e) => handleRemoveFromSquad(e, card)}>
                                    <Card data={card} size="small" isFlipped={true} />
                                </div>
                            ))}
                            {/* Empty slots */}
                            {Array.from({ length: 5 - triSquads[`set${i}`].length }).map((_, idx) => (
                                <div key={`empty-${idx}`} className="empty-slot"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pool-area">
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
                        <div className="empty-pool-msg">All cards assigned!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SquadBuilder;
