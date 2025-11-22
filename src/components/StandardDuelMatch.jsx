import React, { useState, useEffect } from 'react';
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

    const [dieResult, setDieResult] = useState('ATT');
    const [isRolling, setIsRolling] = useState(false);

    const [selectedCard, setSelectedCard] = useState(null);
    const [aiCard, setAiCard] = useState(null);

    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [roundWinner, setRoundWinner] = useState(null);
    const [round, setRound] = useState(1);

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
        setTurnPhase('REVEAL');

        setTimeout(() => {
            resolveRound();
        }, 1000);
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

    return (
        <div className="standard-duel-match full-screen">
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
                        <Card data={aiCard} isFlipped={true} />
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
                        <MatchDie rolling={isRolling} />
                    </div>
                )}

                {turnPhase === 'RESOLVE' && (
                    <div className="round-result">
                        <div className="battle-cards">
                            <div className="battle-card-wrapper">
                                <div className="battle-label you">YOU</div>
                                <Card data={selectedCard} isFlipped={true} />
                            </div>

                            <div className="vs-text">VS</div>

                            <div className="battle-card-wrapper">
                                <div className="battle-label cpu">CPU</div>
                                <Card data={aiCard} isFlipped={true} />
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
                        <Card data={selectedCard} isFlipped={true} />
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
                        >
                            <Card data={card} size="small" isFlipped={true} />
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
