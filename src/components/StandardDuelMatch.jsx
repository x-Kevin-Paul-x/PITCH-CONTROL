import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGameState } from '../hooks/useGameState';
import { generatePack } from '../utils/cardGenerator';
import Card from './Card';
import MatchDie from './MatchDie';
import './StandardDuelMatch.css';
import './BattleOverlay.css';

const StandardDuelMatch = () => {
    const { setPhase } = useGameState();

    // Match State
    const [turnPhase, setTurnPhase] = useState('PREVIEW'); // PREVIEW, ROLL, SELECT, REVEAL, RESOLVE, MATCH_OVER

    const [playerOriginalCards, setPlayerOriginalCards] = useState([]);
    const [p1Deck, setP1Deck] = useState([]);
    const [p2Deck, setP2Deck] = useState([]);
    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);

    const [dieResult, setDieResult] = useState(null);
    const [isRolling, setIsRolling] = useState(false);

    const [selectedCard, setSelectedCard] = useState(null);
    const [aiCard, setAiCard] = useState(null);

    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [roundWinner, setRoundWinner] = useState(null);
    const [round, setRound] = useState(1);

    // Touch Handling State
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Initialize - Generate player's pack
    useEffect(() => {
        const playerPack = generatePack(5);
        setPlayerOriginalCards(playerPack);
    }, []);

    const startMatch = () => {
        // Generate AI pack
        const aiPack = generatePack(5);

        // Shuffle all 10 cards together
        const allCards = [...playerOriginalCards, ...aiPack];
        const shuffled = allCards.sort(() => Math.random() - 0.5);

        // Split into two decks
        const p1Cards = shuffled.slice(0, 5);
        const p2Cards = shuffled.slice(5, 10);

        // Draw initial hands (3 cards each)
        setP1Deck(p1Cards.slice(3));
        setP2Deck(p2Cards.slice(3));
        setP1Hand(p1Cards.slice(0, 3));
        setP2Hand(p2Cards.slice(0, 3));

        setTurnPhase('ROLL');
    };

    const rollDie = () => {
        setIsRolling(true);
        setTurnPhase('ROLLING');

        setTimeout(() => {
            const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
            const result = faces[Math.floor(Math.random() * faces.length)];

            setDieResult(result);
            setIsRolling(false);
            setTurnPhase('SELECT');

            // AI Selection (Random)
            if (p2Hand.length > 0) {
                const aiChoice = p2Hand[Math.floor(Math.random() * p2Hand.length)];
                setAiCard(aiChoice);
            }
        }, 2000);
    };

    const handleCardSelect = (card) => {
        if (turnPhase !== 'SELECT') return;
        setSelectedCard(card);
    };

    const confirmSelection = () => {
        if (!selectedCard) return;
        // Cut directly to resolution/overlay
        resolveRound();
    };

    const resolveRound = () => {
        const p1Val = selectedCard.stats[dieResult];
        const p2Val = aiCard.stats[dieResult];

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
        // Remove played cards from hands
        const newP1Hand = p1Hand.filter(c => c.id !== selectedCard.id);
        const newP2Hand = p2Hand.filter(c => c.id !== aiCard.id);

        // Draw new cards if deck has cards
        let updatedP1Hand = [...newP1Hand];
        let updatedP2Hand = [...newP2Hand];
        let updatedP1Deck = [...p1Deck];
        let updatedP2Deck = [...p2Deck];

        if (updatedP1Deck.length > 0) {
            updatedP1Hand.push(updatedP1Deck[0]);
            updatedP1Deck = updatedP1Deck.slice(1);
        }

        if (updatedP2Deck.length > 0) {
            updatedP2Hand.push(updatedP2Deck[0]);
            updatedP2Deck = updatedP2Deck.slice(1);
        }

        setP1Hand(updatedP1Hand);
        setP2Hand(updatedP2Hand);
        setP1Deck(updatedP1Deck);
        setP2Deck(updatedP2Deck);

        setSelectedCard(null);
        setAiCard(null);
        setRoundWinner(null);
        setDieResult(null);

        // Check if match is over (no cards left)
        if (updatedP1Hand.length === 0 || updatedP2Hand.length === 0) {
            setTurnPhase('MATCH_OVER');
        } else {
            setRound(prev => prev + 1);
            setTurnPhase('ROLL');
        }
    };

    // Preview Phase - Show player their cards before shuffling
    if (turnPhase === 'PREVIEW') {
        return (
            <div className="standard-duel-match full-screen flex-center">
                <div className="preview-container">
                    <h2 className="text-gradient">YOUR PACK</h2>
                    <p>These are your 5 cards. Remember them!</p>
                    <p className="hint-text">They will be shuffled with 5 opponent cards and split randomly.</p>

                    <div className="preview-cards">
                        {playerOriginalCards.map(card => (
                            <Card key={card.id} data={card} isFlipped={true} />
                        ))}
                    </div>

                    <button className="start-match-btn ready" onClick={startMatch}>
                        START MATCH
                    </button>
                </div>
            </div>
        );
    }

    // Touch Handling for Swipe Up

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    };

    const onTouchMove = (e) => {
        setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    };

    const onTouchEnd = (card) => {
        if (!touchStart || !touchEnd) return;
        const distanceY = touchStart.y - touchEnd.y;
        const distanceX = touchStart.x - touchEnd.x;
        const isSwipeUp = distanceY > 50;
        const isVertical = Math.abs(distanceY) > Math.abs(distanceX);

        if (isSwipeUp && isVertical) {
            if (turnPhase === 'SELECT') {
                setSelectedCard(card);
                // Small delay to allow visual selection before confirming
                setTimeout(() => {
                    // We need to call a function that behaves like confirmSelection but uses the card we just swiped
                    // Since confirmSelection uses state 'selectedCard', we might need to ensure state is updated or pass card directly.
                    // However, setState is async. Let's create a direct play function.
                    playCardDirectly(card);
                }, 100);
            }
        }
    };

    const playCardDirectly = (card) => {
        // This duplicates logic from confirmSelection/resolveRound but ensures we use the passed card
        // Actually, confirmSelection just calls resolveRound which uses 'selectedCard' state.
        // To be safe, we should update state and then trigger resolution.
        // But since we can't await setState easily here without useEffect, let's just rely on the user tapping or
        // modify resolveRound to accept a card argument optionally.

        // Better approach: Just select it. The user said "Makes the Card gets selected". 
        // "and then We should be Able to Swipe through the cards smoothly"
        // Wait, "Swiping Up Makes the Card gets selected to a battle". This implies playing it.

        // Let's update resolveRound to take an optional card.
        setSelectedCard(card);
        // We'll trigger the confirm logic after a short delay to let the UI update
        setTimeout(() => {
            // We can't easily call resolveRound here because it relies on the state 'selectedCard' which might not be updated yet in this closure?
            // Actually, in React 18 automatic batching might help, but let's be safe.
            // Let's just set it as selected. The user can tap "PLAY CARD" or we can auto-play.
            // "selected to a battle" -> sounds like "Play".
            // Let's try to auto-play.
            document.querySelector('.confirm-btn')?.click();
        }, 50);
    };

    return (
        <div className="standard-duel-match full-screen">
            <div className="match-content">
                {/* Top Bar: Score */}
                <div className="match-header glass-panel">
                    <div className="player-score">YOU: {scores.p1}</div>
                    <div className="match-info">
                        <div className="round-indicator">ROUND {round}</div>
                    </div>
                    <div className="player-score">CPU: {scores.p2}</div>
                </div>

                {/* Opponent Area (Top) */}
                <div className="opponent-area">
                    <div className="deck-info">
                        <span>Deck: {p2Deck.length}</span>
                        <span>Hand: {p2Hand.length}</span>
                    </div>
                    <div className="opponent-hand">
                        {p2Hand.map((c, i) => (
                            <div key={i} className="card-back-mini"></div>
                        ))}
                    </div>
                    {turnPhase === 'REVEAL' || turnPhase === 'RESOLVE' ? (
                        <div className="played-card-spot">
                            <Card data={aiCard} isFlipped={true} highlightAttribute={dieResult} />
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
                            <MatchDie rolling={isRolling} face={dieResult} />
                        </div>
                    )}
                </div>

                {/* Player Area (Bottom) */}
                <div className="player-area">
                    {turnPhase === 'REVEAL' || turnPhase === 'RESOLVE' ? (
                        <div className="played-card-spot">
                            <Card data={selectedCard} isFlipped={true} highlightAttribute={dieResult} />
                        </div>
                    ) : (
                        <div className="played-card-spot empty"></div>
                    )}

                    <div className="player-hand">
                        {p1Hand.map(card => (
                            <div
                                key={card.id}
                                className={`hand-card-wrapper ${selectedCard?.id === card.id ? 'selected' : ''}`}
                                onClick={() => handleCardSelect(card)}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={() => onTouchEnd(card)}
                            >
                                <Card data={card} size="small" isFlipped={true} highlightAttribute={dieResult} />
                            </div>
                        ))}
                    </div>

                    <div className="deck-info">
                        <span>Deck: {p1Deck.length}</span>
                        <span>Hand: {p1Hand.length}</span>
                    </div>

                    {turnPhase === 'SELECT' && selectedCard && (
                        <button className="confirm-btn" onClick={confirmSelection}>PLAY CARD</button>
                    )}
                </div>
            </div>

            {/* Round Result Overlay */}
            {turnPhase === 'RESOLVE' && createPortal(
                <div className="round-result">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {scores.p1}</div>
                        <div className="round-display">ROUND {round}</div>
                        <div className="score-display">CPU: {scores.p2}</div>
                    </div>

                    <div className="battle-cards">
                        <div className={`battle-card-wrapper ${roundWinner === 'P1' ? 'winner' : roundWinner === 'P2' ? 'loser' : ''}`}>
                            <div className="battle-label you">YOU</div>
                            <Card data={selectedCard} isFlipped={true} highlightAttribute={dieResult} />
                        </div>

                        <div className="vs-text">VS</div>

                        <div className={`battle-card-wrapper ${roundWinner === 'P2' ? 'winner' : roundWinner === 'P1' ? 'loser' : ''}`}>
                            <div className="battle-label cpu">CPU</div>
                            <Card data={aiCard} isFlipped={true} highlightAttribute={dieResult} />
                        </div>
                    </div>

                    <div className="result-text-container">
                        {roundWinner === 'P1' && <h2 className="win-text">YOU WIN!</h2>}
                        {roundWinner === 'P2' && <h2 className="lose-text">YOU LOSE!</h2>}
                        {roundWinner === 'DRAW' && <h2 className="draw-text">DRAW!</h2>}
                    </div>

                    <button className="next-round-btn" onClick={nextRound}>CONTINUE</button>
                </div>,
                document.body
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && (
                <div className="overlay glass-panel">
                    <h1>MATCH OVER</h1>
                    <div className="final-score">
                        {scores.p1} - {scores.p2}
                    </div>
                    <h2>{scores.p1 > scores.p2 ? 'VICTORY' : scores.p1 < scores.p2 ? 'DEFEAT' : 'DRAW'}</h2>
                    <button onClick={() => setPhase('MENU')}>RETURN TO MENU</button>
                </div>
            )}
        </div>
    );
};

export default StandardDuelMatch;
