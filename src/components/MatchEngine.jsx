import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { generatePack } from '../utils/cardGenerator';
import Card from './Card';
import MatchDie from './MatchDie';
import './MatchEngine.css';
import './BattleOverlay.css';

const MatchEngine = () => {
    const { triSquads, setPhase } = useGameState();

    // Match State
    const [currentSet, setCurrentSet] = useState(1);
    const [round, setRound] = useState(1);
    const [turnPhase, setTurnPhase] = useState('ROLL'); // ROLL, SELECT, REVEAL, RESOLVE, SET_OVER, MATCH_OVER

    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);

    const [dieResult, setDieResult] = useState('ATT');
    const [duoType, setDuoType] = useState(null); // e.g. ['ATT', 'MID']
    const [isRolling, setIsRolling] = useState(false);

    const [selectedCard, setSelectedCard] = useState(null);
    const [aiCard, setAiCard] = useState(null);

    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [roundWinner, setRoundWinner] = useState(null);

    // Initialize Set
    useEffect(() => {
        startSet(1);
    }, []);

    const startSet = (setNum) => {
        const p1Squad = triSquads[`set${setNum}`];
        const p2Squad = generatePack(5); // AI Squad
        setP1Hand([...p1Squad]);
        setP2Hand(p2Squad);
        setRound(1);
        setTurnPhase('ROLL');
    };

    const rollDie = () => {
        setIsRolling(true);
        setTurnPhase('ROLLING');

        setTimeout(() => {
            const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
            // Force Duo once per set (e.g. Round 3)
            let result;
            if (round === 3) {
                result = 'DUO';
                // Pick random single attribute for Duo
                const stats = ['ATT', 'MID', 'DEF'];
                const s1 = stats[Math.floor(Math.random() * stats.length)];
                setDuoType(s1); // Single attribute
            } else {
                result = faces[Math.floor(Math.random() * faces.length)];
                setDuoType(null);
            }

            setDieResult(result);
            setIsRolling(false);
            setTurnPhase('SELECT');

            // AI Selection
            if (result === 'DUO') {
                // AI picks 2 random cards
                const aiHand = [...p2Hand];
                const c1 = aiHand.splice(Math.floor(Math.random() * aiHand.length), 1)[0];
                const c2 = aiHand.splice(Math.floor(Math.random() * aiHand.length), 1)[0];
                setAiCard([c1, c2]);
            } else {
                const aiC = p2Hand[Math.floor(Math.random() * p2Hand.length)];
                setAiCard(aiC);
            }

        }, 2000);
    };

    const handleCardSelect = (card) => {
        if (turnPhase !== 'SELECT') return;

        if (dieResult === 'DUO') {
            // Toggle selection for Duo (allow 2)
            setSelectedCard(prev => {
                const current = Array.isArray(prev) ? prev : [];
                if (current.find(c => c.id === card.id)) {
                    return current.filter(c => c.id !== card.id);
                }
                if (current.length < 2) {
                    return [...current, card];
                }
                return current;
            });
        } else {
            setSelectedCard(card);
        }
    };

    const confirmSelection = () => {
        if (dieResult === 'DUO') {
            if (!Array.isArray(selectedCard) || selectedCard.length !== 2) return;
        } else {
            if (!selectedCard) return;
        }

        setTurnPhase('REVEAL');

        setTimeout(() => {
            resolveRound();
        }, 1000);
    };

    const resolveRound = () => {
        let p1Val = 0;
        let p2Val = 0;

        if (dieResult === 'DUO') {
            // Sum of 2 cards for 1 attribute
            p1Val = selectedCard[0].stats[duoType] + selectedCard[1].stats[duoType];
            p2Val = aiCard[0].stats[duoType] + aiCard[1].stats[duoType];
        } else {
            p1Val = selectedCard.stats[dieResult];
            p2Val = aiCard.stats[dieResult];
        }

        let winner = 'DRAW';
        if (p1Val > p2Val) {
            winner = 'P1';
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
        } else if (p2Val > p1Val) {
            winner = 'P2';
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
        }

        setRoundWinner(winner);
        setTurnPhase('RESOLVE');
    };

    const nextRound = () => {
        // Remove played cards
        if (dieResult === 'DUO') {
            const selectedIds = selectedCard.map(c => c.id);
            const aiIds = aiCard.map(c => c.id);
            setP1Hand(prev => prev.filter(c => !selectedIds.includes(c.id)));
            setP2Hand(prev => prev.filter(c => !aiIds.includes(c.id)));
        } else {
            setP1Hand(prev => prev.filter(c => c.id !== selectedCard.id));
            setP2Hand(prev => prev.filter(c => c.id !== aiCard.id));
        }

        setSelectedCard(null);
        setAiCard(null);
        setRoundWinner(null);
        setDieResult(null); // Clear result so it doesn't persist during next roll
        setDuoType(null);

        // Check if hand is empty (or will be empty)
        // We just removed cards, so check current state length minus played
        // Actually we just updated state but it's async. 
        // Better to check if we have cards left to play.
        // If we played Duo (2 cards) and had 5, we have 3 left.
        // If we played Normal (1 card) and had 5, we have 4 left.

        // Simple check: If p1Hand (before update) had cards equal to what we played, we are done.
        const cardsPlayed = dieResult === 'DUO' ? 2 : 1;
        if (p1Hand.length <= cardsPlayed) {
            // Set Over
            if (currentSet < 3) {
                setTurnPhase('SET_OVER');
            } else {
                setTurnPhase('MATCH_OVER');
            }
        } else {
            setRound(prev => prev + 1);
            setTurnPhase('ROLL');
        }
    };

    const nextSet = () => {
        setCurrentSet(prev => prev + 1);
        startSet(currentSet + 1);
    };

    return (
        <div className="match-engine full-screen">
            {/* Top Bar: Score & Set Info */}
            <div className="match-header glass-panel">
                <div className="player-score">YOU: {scores.p1}</div>
                <div className="match-info">
                    <div className="set-indicator">SET {currentSet} / 3</div>
                    <div className="round-indicator">ROUND {round}</div>
                </div>
                <div className="player-score">CPU: {scores.p2}</div>
            </div>

            {/* Opponent Area (Top) */}
            <div className="opponent-area">
                <div className="opponent-hand">
                    {p2Hand.map((c, i) => (
                        <div key={i} className="card-back-mini"></div>
                    ))}
                </div>
                {turnPhase === 'REVEAL' || turnPhase === 'RESOLVE' ? (
                    <div className="played-card-spot">
                        {Array.isArray(aiCard) ? (
                            <div className="duo-display">
                                <Card data={aiCard[0]} isFlipped={true} size="small" />
                                <Card data={aiCard[1]} isFlipped={true} size="small" />
                            </div>
                        ) : (
                            <Card data={aiCard} isFlipped={true} />
                        )}
                    </div>
                ) : (
                    <div className="played-card-spot empty"></div>
                )}
            </div>

            {/* Center: Die & Context */}
            <div className="center-stage">
                {turnPhase === 'ROLL' && (
                    <button className="roll-btn" onClick={rollDie}>ROLL DIE</button>
                )}
                {(turnPhase === 'ROLLING' || turnPhase === 'SELECT' || turnPhase === 'REVEAL' || turnPhase === 'RESOLVE') && (
                    <div className="die-container">
                        {dieResult === 'DUO' ? (
                            <div className="duo-indicator">
                                DUO EVENT
                                <span>{duoType} BATTLE</span>
                                <span style={{ fontSize: '0.8rem' }}>Pick 2 Cards!</span>
                            </div>
                        ) : (
                            <MatchDie rolling={isRolling} face={dieResult} />
                        )}
                    </div>
                )}

                {turnPhase === 'RESOLVE' && (
                    <div className="round-result">
                        <div className="battle-cards">
                            <div className="battle-card-wrapper">
                                <div className="battle-label you">YOU</div>
                                {Array.isArray(selectedCard) ? (
                                    <div className="duo-display">
                                        <Card data={selectedCard[0]} isFlipped={true} size="small" />
                                        <Card data={selectedCard[1]} isFlipped={true} size="small" />
                                    </div>
                                ) : (
                                    <Card data={selectedCard} isFlipped={true} />
                                )}
                            </div>

                            <div className="vs-text">VS</div>

                            <div className="battle-card-wrapper">
                                <div className="battle-label cpu">CPU</div>
                                {Array.isArray(aiCard) ? (
                                    <div className="duo-display">
                                        <Card data={aiCard[0]} isFlipped={true} size="small" />
                                        <Card data={aiCard[1]} isFlipped={true} size="small" />
                                    </div>
                                ) : (
                                    <Card data={aiCard} isFlipped={true} />
                                )}
                            </div>
                        </div>

                        {roundWinner === 'P1' && <h2 className="win-text">YOU WIN!</h2>}
                        {roundWinner === 'P2' && <h2 className="lose-text">YOU LOSE!</h2>}
                        {roundWinner === 'DRAW' && <h2 className="draw-text">DRAW!</h2>}

                        <button className="next-round-btn" onClick={nextRound}>CONTINUE</button>
                    </div>
                )}
            </div>

            {/* Player Area (Bottom) */}
            <div className="player-area">
                {turnPhase === 'REVEAL' || turnPhase === 'RESOLVE' ? (
                    <div className="played-card-spot">
                        {Array.isArray(selectedCard) ? (
                            <div className="duo-display">
                                <Card data={selectedCard[0]} isFlipped={true} size="small" />
                                <Card data={selectedCard[1]} isFlipped={true} size="small" />
                            </div>
                        ) : (
                            <Card data={selectedCard} isFlipped={true} />
                        )}
                    </div>
                ) : (
                    <div className="played-card-spot empty"></div>
                )}

                <div className="player-hand">
                    {p1Hand.map(card => {
                        const isSelected = Array.isArray(selectedCard)
                            ? selectedCard.find(c => c.id === card.id)
                            : selectedCard?.id === card.id;

                        return (
                            <div
                                key={card.id}
                                className={`hand-card-wrapper ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleCardSelect(card)}
                            >
                                <Card data={card} size="small" isFlipped={true} />
                            </div>
                        );
                    })}
                </div>

                {turnPhase === 'SELECT' && selectedCard && (
                    <button className="confirm-btn" onClick={confirmSelection}>PLAY CARD</button>
                )}
            </div>

            {/* Set Over Overlay */}
            {turnPhase === 'SET_OVER' && (
                <div className="overlay glass-panel">
                    <h2>SET {currentSet} COMPLETE</h2>
                    <button onClick={nextSet}>START SET {currentSet + 1}</button>
                </div>
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && (
                <div className="overlay glass-panel">
                    <h1>FULL TIME</h1>
                    <div className="final-score">
                        {scores.p1} - {scores.p2}
                    </div>
                    <h2>{scores.p1 > scores.p2 ? 'VICTORY' : 'DEFEAT'}</h2>
                    <button onClick={() => setPhase('MENU')}>RETURN TO MENU</button>
                </div>
            )}
        </div>
    );
};

export default MatchEngine;
