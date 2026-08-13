import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { sound } from '../utils/soundEngine';
import Card from './Card';
import './PackOpening.css';

const PackOpening = () => {
    const { collection, setPhase, gameMode } = useGameState();
    const [packState, setPackState] = useState('closed'); // 'closed', 'tearing', 'opened'
    const [flippedStates, setFlippedStates] = useState(
        Array(collection.length).fill(false)
    );
    const [shake, setShake] = useState(false);
    const [particles, setParticles] = useState([]);
    const [dealTriggered, setDealTriggered] = useState(false);
    const [legendAlert, setLegendAlert] = useState(null); // Non-disruptive banner for high tier pulls
    const [inspectCard, setInspectCard] = useState(null); // Full-screen inspection on clicking revealed card
    const [activeMobileIndex, setActiveMobileIndex] = useState(0);

    const containerRef = useRef(null);
    const cardRefs = useRef([]);

    // Calculate card translation offsets for explosive deal animation
    useEffect(() => {
        if (packState === 'opened' && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            cardRefs.current.forEach((cardEl) => {
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

            const timer = setTimeout(() => {
                setDealTriggered(true);
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [packState]);

    const triggerBurstParticles = () => {
        const newParticles = Array.from({ length: 80 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 260;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            return {
                id: i,
                dx: `${dx}px`,
                dy: `${dy}px`,
                size: `${4 + Math.random() * 10}px`,
                color: ['#ffd700', '#f59e0b', '#c084fc', '#00d2ff', '#ffffff', '#ff4500'][Math.floor(Math.random() * 6)],
                delay: `${Math.random() * 0.3}s`,
            };
        });
        setParticles(newParticles);
    };

    const handlePackClick = () => {
        if (packState !== 'closed') return;
        
        sound.playPackTear();
        setPackState('tearing');
        setShake(true);
        triggerBurstParticles();
        
        setTimeout(() => {
            setShake(false);
        }, 500);

        setTimeout(() => {
            setPackState('opened');
            sound.playCardFlip();
        }, 900);
    };

    const handleCardClick = (index) => {
        if (packState !== 'opened') return;
        const card = collection[index];

        // If card is not flipped yet -> Reveal it!
        if (!flippedStates[index]) {
            const newFlipped = [...flippedStates];
            newFlipped[index] = true;
            setFlippedStates(newFlipped);

            if (card.rarity === 'LEGEND') {
                sound.playLegendFanfare();
                triggerBurstParticles();
                setLegendAlert({ name: card.name, rarity: 'LEGEND', rating: card.rating });
                setTimeout(() => setLegendAlert(null), 3000);
            } else if (card.rarity === 'ELITE') {
                sound.playEliteReveal();
                setLegendAlert({ name: card.name, rarity: 'ELITE', rating: card.rating });
                setTimeout(() => setLegendAlert(null), 2500);
            } else {
                sound.playCardFlip();
            }
        } else {
            // Already revealed -> Open inspection showcase
            sound.playWaxSealClick();
            setInspectCard(card);
        }
    };

    const handleFlipAll = () => {
        // Sequentially flip all unflipped cards with wave sound
        collection.forEach((card, index) => {
            if (!flippedStates[index]) {
                setTimeout(() => {
                    setFlippedStates(prev => {
                        const newFlipped = [...prev];
                        newFlipped[index] = true;
                        return newFlipped;
                    });
                    sound.playCardWave(index);

                    // If last card or contains legend
                    if (index === collection.length - 1) {
                        setTimeout(() => sound.playCrowdCheer(0.2, 0.8), 300);
                    }
                }, index * 70);
            }
        });
    };

    const handleQuickOpen = () => {
        sound.playPackTear();
        setPackState('opened');
        setFlippedStates(Array(collection.length).fill(true));
        sound.playLegendFanfare();
    };

    const handleFinish = () => {
        sound.playWaxSealClick();
        if (gameMode === 'TRI_SQUAD') {
            setPhase('SQUAD_BUILDING');
        } else {
            setPhase('DRAFT');
        }
    };

    const allFlipped = flippedStates.every(state => state === true);
    const revealedCards = collection.filter((_, idx) => flippedStates[idx]);
    const revealedLegends = revealedCards.filter(c => c.rarity === 'LEGEND').length;
    const revealedElites = revealedCards.filter(c => c.rarity === 'ELITE').length;
    const revealedRares = revealedCards.filter(c => c.rarity === 'RARE').length;

    return (
        <div className={`pack-opening-container full-screen ${shake ? 'shake' : ''}`}>
            {/* Ambient Background Radial Glow */}
            <div className="pack-ambient-halo"></div>

            {/* Header / Instructions */}
            <div className="pack-header-bar">
                <h1 className="text-gradient">
                    {packState === 'closed' ? 'SCOUTING PACK' : allFlipped ? 'RECRUITS DISCOVERED' : 'TAP CARDS TO REVEAL'}
                </h1>
                
                {/* Live Non-Spoiler Discovery Ribbon */}
                {packState !== 'closed' && (
                    <div className="pack-discovery-ribbon">
                        {revealedLegends > 0 && <span className="stat-pill legend">👑 {revealedLegends} Legend{revealedLegends > 1 ? 's' : ''}</span>}
                        {revealedElites > 0 && <span className="stat-pill elite">⚔️ {revealedElites} Elite{revealedElites > 1 ? 's' : ''}</span>}
                        {revealedRares > 0 && <span className="stat-pill rare">🛡️ {revealedRares} Rare{revealedRares > 1 ? 's' : ''}</span>}
                        <span className="stat-pill total">{revealedCards.length} / {collection.length} Revealed</span>
                    </div>
                )}
            </div>

            {/* Non-Disruptive High-Tier Pull Alert Toast */}
            {legendAlert && (
                <div className={`legend-pull-toast ${legendAlert.rarity.toLowerCase()}`}>
                    <span className="toast-crest">{legendAlert.rarity === 'LEGEND' ? '👑' : '⚔️'}</span>
                    <div className="toast-text-box">
                        <span className="toast-tier">{legendAlert.rarity} RECRUIT PULL!</span>
                        <strong className="toast-name">{legendAlert.name}</strong>
                    </div>
                    <span className="toast-rating-badge">{legendAlert.rating} OVR</span>
                </div>
            )}

            {/* Full-Screen Card Inspection Modal (Optional when clicking revealed card) */}
            {inspectCard && (
                <div className="card-inspect-modal-backdrop" onClick={() => setInspectCard(null)}>
                    <div className="inspect-showcase-box" onClick={(e) => e.stopPropagation()}>
                        <div className="inspect-header-row">
                            <span className="inspect-badge">{inspectCard.rarity} RECRUIT</span>
                            <button className="inspect-close-btn" onClick={() => setInspectCard(null)}>✕</button>
                        </div>
                        <div className="inspect-card-wrap">
                            <Card data={inspectCard} isFlipped={true} size="normal" />
                        </div>
                        <div className="inspect-details-row">
                            <h3>{inspectCard.name}</h3>
                            <p>House {inspectCard.house?.name || 'Valor'} • {inspectCard.position} • {inspectCard.rating} Power</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Particle Burst Elements */}
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

            {/* 3D Booster Pack Stage */}
            {packState !== 'opened' && (
                <div className="pack-stage-container">
                    <div 
                        className={`pack-wrapper ${packState}`}
                        onClick={handlePackClick}
                    >
                        <div className="pack-light-rays"></div>
                        <div className="pack-foil-holograph"></div>
                        
                        {/* Top Foil Half */}
                        <div className="pack-half pack-top">
                            <div className="foil-crimp top-crimp"></div>
                            <div className="pack-front-art">
                                <div className="pack-emblem-crest">⚜️</div>
                                <h2 className="pack-title">PITCH CONTROL</h2>
                            </div>
                        </div>

                        {/* Royal Wax Seal */}
                        <div className={`pack-wax-seal ${packState === 'tearing' ? 'seal-break' : ''}`}>
                            <div className="seal-ring"></div>
                            <span className="seal-emblem">👑</span>
                        </div>

                        {/* Bottom Foil Half */}
                        <div className="pack-half pack-bottom">
                            <div className="pack-bottom-art">
                                <span className="pack-sub-text">SOVEREIGN KNIGHT BOOSTER</span>
                                <div className="pack-count-badge">{collection.length} ROYAL RECRUITS</div>
                            </div>
                            <div className="foil-crimp bottom-crimp"></div>
                        </div>

                        {/* Laser Tear Beam */}
                        {packState === 'tearing' && <div className="pack-tear-fissure"></div>}

                        <div className="pack-hint-tap">📜 TAP SEAL TO RIP OPEN</div>
                    </div>

                    <button className="quick-open-link-btn" onClick={handleQuickOpen}>
                        ⚡ Quick Open All
                    </button>
                </div>
            )}

            {/* Opened Stage: Clean Responsive 15-Card Grid (Fits full screen with no scroll) */}
            {packState === 'opened' && (
                <>
                    {/* Mobile Carousel Navigation (Only visible on small phones) */}
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
                                    className={`reveal-card-wrapper ${dealTriggered ? 'dealing' : 'hidden'} ${isFlipped ? 'revealed' : 'face-down'} ${isMobileActive ? 'mobile-active' : 'mobile-hidden'} rarity-${card.rarity.toLowerCase()}`}
                                    style={{ 
                                        '--delay': `${index * 0.04}s`,
                                    }}
                                    onClick={() => handleCardClick(index)}
                                >
                                    <Card 
                                        data={card} 
                                        isFlipped={isFlipped} 
                                        size="responsive" 
                                        className={`pack-card ${isFlipped ? 'flipped' : ''}`}
                                    />
                                    
                                    {/* Radiant Aura for High Rarity Cards */}
                                    {isFlipped && (card.rarity === 'LEGEND' || card.rarity === 'ELITE' || card.rarity === 'RARE') && (
                                        <div className={`pack-aura-glow ${card.rarity.toLowerCase()}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Footer Action Controls */}
            {packState === 'opened' && (
                <div className="pack-opening-footer">
                    {!allFlipped && (
                        <button className="reveal-all-btn" onClick={handleFlipAll}>
                            ✨ FLIP ALL RECRUITS
                        </button>
                    )}
                    {allFlipped && (
                        <button className="finish-btn" onClick={handleFinish}>
                            COMMAND SQUADS ({collection.length} RECRUITS) ➔
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PackOpening;
