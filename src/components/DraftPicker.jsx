import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import Card from './Card';
import './DraftPicker.css';

const DraftPicker = () => {
    const { collection, setPhase } = useGameState();
    const [playerDeck, setPlayerDeck] = useState([]);
    const [aiDeck, setAiDeck] = useState([]);
    const [currentPickIndex, setCurrentPickIndex] = useState(0);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);

    const totalPicks = 10; // 5 cards each
    const picksPerPlayer = 5;

    const handleCardPick = (card) => {
        if (!isPlayerTurn) return;
        if (playerDeck.length >= picksPerPlayer) return;

        // Add to player deck
        setPlayerDeck([...playerDeck, card]);

        // Remove from available
        const remaining = collection.filter(c =>
            c.id !== card.id &&
            !playerDeck.find(p => p.id === c.id) &&
            !aiDeck.find(a => a.id === c.id)
        );

        // AI picks immediately after
        setTimeout(() => {
            if (aiDeck.length < picksPerPlayer && remaining.length > 0) {
                const aiChoice = remaining[Math.floor(Math.random() * remaining.length)];
                setAiDeck([...aiDeck, aiChoice]);
                setCurrentPickIndex(currentPickIndex + 2);
            }

            // Check if draft is complete
            if (playerDeck.length + 1 >= picksPerPlayer && aiDeck.length + 1 >= picksPerPlayer) {
                setTimeout(() => {
                    setPhase('MATCH');
                }, 1000);
            }
        }, 800);
    };

    const availableCards = collection.filter(c =>
        !playerDeck.find(p => p.id === c.id) &&
        !aiDeck.find(a => a.id === c.id)
    );

    return (
        <div className="draft-picker full-screen">
            <div className="draft-header">
                <h2 className="text-gradient">DRAFT PICKER</h2>
                <p>Pick {picksPerPlayer} cards. You pick first.</p>
                <div className="pick-counter">
                    Pick {currentPickIndex + 1} of {totalPicks}
                </div>
            </div>

            <div className="draft-decks">
                <div className="draft-deck">
                    <h3>Your Deck ({playerDeck.length}/{picksPerPlayer})</h3>
                    <div className="deck-preview">
                        {playerDeck.map(card => (
                            <Card key={card.id} data={card} size="small" isFlipped={true} />
                        ))}
                    </div>
                </div>

                <div className="draft-deck">
                    <h3>Opponent Deck ({aiDeck.length}/{picksPerPlayer})</h3>
                    <div className="deck-preview">
                        {aiDeck.map((card, i) => (
                            <div key={i} className="card-back-small"></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="draft-pool">
                <h3>Available Cards</h3>
                <div className="pool-grid">
                    {availableCards.map(card => (
                        <div
                            key={card.id}
                            className={`draft-card-wrapper ${!isPlayerTurn || playerDeck.length >= picksPerPlayer ? 'disabled' : ''}`}
                            onClick={() => handleCardPick(card)}
                        >
                            <Card data={card} size="small" isFlipped={true} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DraftPicker;
