import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { sound } from '../utils/soundEngine';
import Card from './Card';
import './PackOpening.css';

const PackOpening = () => {
    const { collection, setPhase, gameMode } = useGameState();
    const [packState, setPackState] = useState('closed'); // closed, tearing, opened
    const [flippedStates, setFlippedStates] = useState(
        Array(collection.length).fill(false)
    );
    const [hasTorn, setHasTorn] = useState(false);
    const [shake, setShake] = useState(false);
    const [particles, setParticles] = useState([]);
    const [flashColor, setFlashColor] = useState(null); // 'legend', 'elite', 'rare', or null
    const [dealTriggered, setDealTriggered] = useState(false);
    const [activeMobileIndex, setActiveMobileIndex] = useState(0);

    const containerRef = useRef(null);
    const cardRefs = useRef([]);

    // Calculate card translation offsets for explosive deal animation
    useEffect(() => {
        if (packState === 'opened' && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            cardRefs.current.forEach((cardEl, idx) => {
                if (cardEl) {
                    const cardRect = cardEl.getBoundingClientRect();
                    const cardCenterX = cardRect.left - containerRect.left + cardRect.width / 2;
                    const cardCenterY = cardRect.top - containerRect.top + cardRect.height / 2;
                    
                    const tx = centerX - cardCenterX;
                    const ty = centerY - cardCenterY;

                    cardEl.style.setProperty('--tx', `${tx}px`);
                    cardEl.style.setProperty('--ty', `${ty}px`);
                }
            });

            // Trigger deal animation on next frame
            const timer = setTimeout(() => {
                setDealTriggered(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [packState]);

    const triggerParticles = () => {
        const newParticles = Array.from({ length: 75 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 90 + Math.random() * 280;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            return {
                id: i,
                dx: `${dx}px`,
                dy: `${dy}px`,
                size: `${4 + Math.random() * 10}px`,
                color: ['#ffd700', '#f6ad55', '#a855f7', '#00d2ff', '#ffffff', '#e2e8f0'][Math.floor(Math.random() * 6)],
                delay: `${Math.random() * 0.35}s`,
            };
        });
        setParticles(newParticles);
    };

    const handlePackClick = () => {
        if (packState !== 'closed') return;
        
        sound.playWaxSealClick();
        setPackState('tearing');
        setShake(true);
        triggerParticles();
        
        setTimeout(() => {
            setShake(false);
        }, 600);

        setTimeout(() => {
            setPackState('opened');
            setHasTorn(true);
            sound.playCardFlip();
        }, 1100);
    };

    const handleCardFlip = (index) => {
        if (packState !== 'opened') return;
        if (flippedStates[index]) return;

        sound.playCardFlip();
        const newFlipped = [...flippedStates];
        newFlipped[index] = true;
        setFlippedStates(newFlipped);

        const card = collection[index];
        if (card.rarity === 'LEGEND') {
            setFlashColor('legend');
            setTimeout(() => setFlashColor(null), 850);
        } else if (card.rarity === 'ELITE') {
            setFlashColor('elite');
            setTimeout(() => setFlashColor(null), 650);
        } else if (card.rarity === 'RARE') {
            setFlashColor('rare');
            setTimeout(() => setFlashColor(null), 500);
        }
    };

    const handleFinish = () => {
        if (gameMode === 'TRI_SQUAD') {
            setPhase('SQUAD_BUILDING');
        } else {
            setPhase('DRAFT');
        }
    };

    const handleRevealAll = () => {
        setPackState('opened');
        setHasTorn(true);
        setFlippedStates(Array(collection.length).fill(true));
    };

    const handleFlipAll = () => {
        collection.forEach((card, index) => {
            if (!flippedStates[index]) {
                setTimeout(() => {
                    setFlippedStates(prev => {
                        const newFlipped = [...prev];
                        newFlipped[index] = true;
                        return newFlipped;
                    });
                    
                    if (card.rarity === 'LEGEND') {
                        setFlashColor('legend');
                        setTimeout(() => setFlashColor(null), 850);
                    } else if (card.rarity === 'ELITE') {
                        setFlashColor('elite');
                        setTimeout(() => setFlashColor(null), 650);
                    }
                }, index * 100);
            }
        });
    };

    const allFlipped = flippedStates.every(state => state === true);

    const getHighestRarity = () => {
        if (collection.some(c => c.rarity === 'LEGEND')) return 'legend';
        if (collection.some(c => c.rarity === 'ELITE')) return 'elite';
        if (collection.some(c => c.rarity === 'RARE')) return 'rare';
        return 'common';
    };

    return (
        <div className={`pack-opening-container full-screen flex-center ${shake ? 'shake' : ''}`}>
            {/* Header / Instructions */}
            <div className="pack-header-bar">
                <h1 className="text-gradient">
                    {packState === 'closed' ? 'SCOUTING PACK' : allFlipped ? 'REVEAL COMPLETE' : 'TAP TO REVEAL CARDS'}
                </h1>
                <p className="pack-subtitle">
                    {packState === 'closed' ? 'Tear open the booster pack to recruit your players' : `${flippedStates.filter(Boolean).length} / ${collection.length} Revealed`}
                </p>
            </div>

            {/* Full-screen flash payoff */}
            {flashColor && (
                <div className={`pack-flash-overlay ${flashColor}`} />
            )}

            {/* Particle Explosion */}
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="pack-particle"
                    style={{
                        '--dx': p.dx,
                        '--dy': p.dy,
                        '--size': p.size,
                        '--color': p.color,
                        '--delay': p.delay,
                    }}
                />
            ))}

            {/* Foil Pack Wrapper */}
            {packState !== 'opened' && (
                <div 
                    className={`pack-wrapper ${packState} rarity-${getHighestRarity()}`}
                    onClick={handlePackClick}
                >
                    <div className="pack-light-rays"></div>
                    
                    {/* Top half */}
                    <div className="pack-half pack-top">
                        <div className="pack-foil-glow"></div>
                        <div className="pack-front-art">
                            <div className="pack-logo-large">⚔️</div>
                            <h2 className="pack-title">PITCH CONTROL</h2>
                            <span className="pack-details">SOVEREIGN KNIGHT BOOSTER</span>
                            <div className="pack-contains">{collection.length} RECRUITS</div>
                        </div>
                        <div className="pack-tear-line"></div>
                    </div>

                    {/* Royal Wax Seal */}
                    <div className="pack-wax-seal">
                        <span className="seal-emblem">👑</span>
                    </div>

                    {/* Bottom half */}
                    <div className="pack-half pack-bottom">
                        <div className="pack-foil-glow"></div>
                        <div className="pack-front-art">
                            <div className="pack-logo-large">⚔️</div>
                            <h2 className="pack-title">PITCH CONTROL</h2>
                            <span className="pack-details">SOVEREIGN KNIGHT BOOSTER</span>
                            <div className="pack-contains">{collection.length} RECRUITS</div>
                        </div>
                    </div>
                    <div className="pack-hint-tap">📜 TAP SEAL TO RIP OPEN PACK</div>
                </div>
            )}

            {/* Opened Stage: Grid of Cards */}
            {packState === 'opened' && (
                <>
                    {/* Mobile Navigation Indicator Bar */}
                    <div className="mobile-card-nav-bar">
                        <button 
                            className="nav-arrow-btn" 
                            disabled={activeMobileIndex === 0}
                            onClick={() => { sound.playWaxSealClick(); setActiveMobileIndex(prev => Math.max(0, prev - 1)); }}
                        >
                            ◀ PREV
                        </button>
                        <span className="mobile-card-counter">
                            CARD {activeMobileIndex + 1} OF {collection.length}
                        </span>
                        <button 
                            className="nav-arrow-btn" 
                            disabled={activeMobileIndex === collection.length - 1}
                            onClick={() => { sound.playWaxSealClick(); setActiveMobileIndex(prev => Math.min(collection.length - 1, prev + 1)); }}
                        >
                            NEXT ▶
                        </button>
                    </div>

                    <div ref={containerRef} className="cards-reveal-grid">
                        {collection.map((card, index) => {
                            const isFlipped = flippedStates[index];
                            const isMobileActive = index === activeMobileIndex;
                            return (
                                <div 
                                    key={card.id} 
                                    ref={el => cardRefs.current[index] = el}
                                    className={`reveal-card-wrapper ${dealTriggered ? 'dealing' : 'hidden'} ${isFlipped ? 'revealed' : ''} ${isMobileActive ? 'mobile-active' : 'mobile-hidden'} rarity-${card.rarity.toLowerCase()}`}
                                    style={{ 
                                        '--delay': `${index * 0.08}s`,
                                    }}
                                    onClick={() => {
                                        if (!isFlipped) {
                                            handleCardFlip(index);
                                        } else if (isMobileActive && activeMobileIndex < collection.length - 1) {
                                            setActiveMobileIndex(prev => prev + 1);
                                            sound.playWaxSealClick();
                                        }
                                    }}
                                >
                                    <Card 
                                        data={card} 
                                        isFlipped={isFlipped} 
                                        size="normal" 
                                        className={`pack-card ${isFlipped ? 'flipped' : ''}`}
                                    />
                                    
                                    {/* Aura effect for legends / elites / rares when flipped */}
                                    {isFlipped && (card.rarity === 'LEGEND' || card.rarity === 'ELITE' || card.rarity === 'RARE') && (
                                        <div className={`pack-aura-glow ${card.rarity.toLowerCase()}`}></div>
                                    )}

                                    {/* Mobile Tap Next Hint when card is flipped */}
                                    {isFlipped && isMobileActive && index < collection.length - 1 && (
                                        <div className="mobile-tap-next-hint">TAP FOR NEXT CARD ▶</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Controls */}
            <div className="pack-opening-footer">
                {!hasTorn && (
                    <button className="reveal-all-btn" onClick={handleRevealAll}>
                        QUICK OPEN
                    </button>
                )}
                {hasTorn && !allFlipped && (
                    <button className="reveal-all-btn" onClick={handleFlipAll}>
                        FLIP ALL
                    </button>
                )}
                {hasTorn && allFlipped && (
                    <button className="finish-btn" onClick={handleFinish}>
                        GO TO SQUAD BUILDER
                    </button>
                )}
            </div>
        </div>
    );
};

export default PackOpening;
