import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import Card from './Card';
import './PackOpening.css';

const PackOpening = () => {
    const { collection, setPhase, gameMode } = useGameState();
    const [currentIndex, setCurrentIndex] = useState(0); // Start with first card revealed
    const [revealedCards, setRevealedCards] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const totalCards = collection.length;

    const handlePackClick = () => {
        if (isAnimating) return;
        if (currentIndex >= totalCards - 1) return;

        setIsAnimating(true);

        // Move current to revealed pile
        setRevealedCards([...revealedCards, collection[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
        setTimeout(() => setIsAnimating(false), 600);
    };

    const handleFinish = () => {
        if (gameMode === 'TRI_SQUAD') {
            setPhase('SQUAD_BUILDING');
        } else {
            setPhase('DRAFT'); // Should not happen in Standard based on current logic
        }
    };

    const handleRevealAll = () => {
        setRevealedCards(collection);
        setCurrentIndex(totalCards - 1);
        setIsAnimating(false); // Force animation to stop so we finish immediately
    };

    const currentCard = currentIndex >= 0 && currentIndex < totalCards ? collection[currentIndex] : null;
    const isFinished = currentIndex >= totalCards - 1 && !isAnimating;

    return (
        <div className="pack-opening-container full-screen flex-center">

            {/* Progress Indicator */}
            <div className="pack-progress">
                {currentIndex + 1} / {totalCards}
            </div>

            {/* The Pack (Clickable - Skip All) */}
            {currentIndex < totalCards - 1 && (
                <div
                    className={`pack-wrapper ${currentIndex === -1 ? 'initial' : 'active'}`}
                    onClick={handleRevealAll}
                    title="Click to Reveal All"
                >
                    <div className="pack-visual">
                        <div className="pack-label">PITCH CONTROL</div>
                        <div className="pack-sub">PREMIUM PACK</div>
                    </div>
                    <div className="pack-hint">{currentIndex === -1 ? 'TAP TO REVEAL' : 'SKIP >>'}</div>
                </div>
            )}

            {/* Active Card Reveal (Click to Next) */}
            {currentCard && (
                <div
                    className={`revealed-card-stage ${isAnimating ? 'animating' : ''}`}
                    onClick={handlePackClick}
                >
                    <Card
                        data={currentCard}
                        isFlipped={true}
                        size="large"
                        className="hero-card"
                    />
                    {/* Ray effects for rare cards */}
                    {(currentCard.rarity === 'LEGEND' || currentCard.rarity === 'ELITE') && (
                        <div className={`god-rays ${currentCard.rarity.toLowerCase()}`}></div>
                    )}
                </div>
            )}

            {/* Next Button (if revealed) */}
            {!isAnimating && currentIndex >= 0 && currentIndex < totalCards - 1 && (
                <button className="next-card-btn" onClick={handlePackClick}>
                    NEXT CARD
                </button>
            )}

            {/* Finish Button */}
            {isFinished && (
                <div className="finish-stage">
                    <h2 className="text-gradient-gold">PACK COMPLETE</h2>
                    <div className="cards-grid-preview">
                        {collection.map((c, i) => (
                            <div key={c.id} className="mini-card-preview" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className={`rarity-indicator ${c.rarity.toLowerCase()}`}></div>
                            </div>
                        ))}
                    </div>
                    <button className="finish-btn" onClick={handleFinish}>
                        GO TO SQUAD BUILDER
                    </button>
                </div>
            )}
        </div>
    );
};

export default PackOpening;
