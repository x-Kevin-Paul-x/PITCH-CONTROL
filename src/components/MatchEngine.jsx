import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { generatePack } from '../utils/cardGenerator';
import Card from './Card';
import MatchDie from './MatchDie';
import './MatchEngine.css';
import './BattleOverlay.css';

const TACTICS_POOL = [
    { id: 'VAR_CHECK', name: 'VAR Check', desc: 'Reroll the Match Die' },
    { id: 'SUBSTITUTION', name: 'Tactical Sub', desc: 'Swap hand card with bench' },
    { id: 'OFFSIDE_TRAP', name: 'Offside Trap', desc: 'Halves opponent FW stats this round' },
    { id: 'HIGH_PRESS', name: 'High Press', desc: 'Force opponent card to reveal' },
    { id: 'COUNTER_ATTACK', name: 'Counter-Attack', desc: 'Change DEF die to ATT' }
];

const MatchEngine = () => {
    const { triSquads, setPhase, aiDifficulty } = useGameState();

    // Match State
    const [currentSet, setCurrentSet] = useState(1);
    const [round, setRound] = useState(1);
    const [turnPhase, setTurnPhase] = useState('ROLL'); // ROLL, SELECT, REVEAL, RESOLVE, SET_OVER, MATCH_OVER

    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);
    const [p1Bench, setP1Bench] = useState([]); // Remaining cards not drawn in Duo or used in Sub
    const [p2Bench, setP2Bench] = useState([]);

    const [dieResult, setDieResult] = useState('ATT');
    const [duoType, setDuoType] = useState(null); 
    const [isRolling, setIsRolling] = useState(false);

    const [selectedCard, setSelectedCard] = useState(null); // Card or [Card, Card]
    const [aiCard, setAiCard] = useState(null);

    // Tactics
    const [p1Tactics, setP1Tactics] = useState([]);
    const [p2Tactics, setP2Tactics] = useState([]);
    const [p1ActiveTactic, setP1ActiveTactic] = useState(null);
    const [p2ActiveTactic, setP2ActiveTactic] = useState(null);

    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [roundWinner, setRoundWinner] = useState(null);

    // Modifiers
    const [enforcedNextRound, setEnforcedNextRound] = useState({ p1: false, p2: false });
    const [chosenNextAttribute, setChosenNextAttribute] = useState(null);

    // Commentary logs
    const [logs, setLogs] = useState([]);
    const logEndRef = useRef(null);

    // Initialize Set 1 on Mount
    useEffect(() => {
        startSet(1);
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (msg) => {
        setLogs(prev => [...prev, `[S${currentSet}-R${round}] ${msg}`]);
    };

    const startSet = (setNum) => {
        const p1Squad = triSquads[`set${setNum}`];
        // AI Squad generated with matching difficulty average rating
        const p2Squad = generatePack(5); 

        setP1Hand([...p1Squad]);
        setP2Hand(p2Squad);
        setP1Bench([]); // In Tri-Squad, hand matches squad (5 cards, drawn immediately)
        setP2Bench([]);

        // Hand out 2 random tactics per set
        const shuffledTactics = [...TACTICS_POOL].sort(() => Math.random() - 0.5);
        setP1Tactics(shuffledTactics.slice(0, 2));
        setP2Tactics(shuffledTactics.slice(2, 4));

        setRound(1);
        setP1ActiveTactic(null);
        setP2ActiveTactic(null);
        setTurnPhase('ROLL');
        addLog(`🏟️ Set ${setNum} Kickoff! Both managers receive 2 fresh Tactic cards.`);
    };

    const rollDie = () => {
        setIsRolling(true);
        setTurnPhase('ROLLING');
        setP1ActiveTactic(null);
        setP2ActiveTactic(null);

        setTimeout(() => {
            let result;
            if (chosenNextAttribute) {
                result = chosenNextAttribute;
                setChosenNextAttribute(null);
                addLog(`⚡ Playmaker Trait: Locked context to ${result}!`);
            } else if (round === 3) {
                // Force GDD Duo battle on Round 3
                result = 'DUO';
                const stats = ['ATT', 'MID', 'DEF'];
                const duoAttr = stats[Math.floor(Math.random() * stats.length)];
                setDuoType(duoAttr);
                addLog(`🔥 DUO EVENT! Choose 2 cards to battle on ${duoAttr}!`);
            } else {
                const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
                result = faces[Math.floor(Math.random() * faces.length)];
            }

            setDieResult(result);
            setIsRolling(false);
            setTurnPhase('SELECT');
            if (result !== 'DUO') {
                addLog(`🎲 Context Roll: ${result} Duel!`);
            }

            // Decide AI Moves
            decideAIMove(result);
        }, 2000);
    };

    const decideAIMove = (rollContext) => {
        let activeTactic = null;
        let p2T = [...p2Tactics];

        // AI Tactic selection chance
        const playsTactics = ['VETERAN', 'LEGEND'].includes(aiDifficulty) ? Math.random() < 0.35 : Math.random() < 0.15;
        if (playsTactics && p2T.length > 0 && rollContext !== 'DUO') {
            const chosenT = p2T[0];
            if (chosenT.id === 'COUNTER_ATTACK' && rollContext === 'DEF') {
                activeTactic = chosenT;
                p2T.shift();
                setDieResult('ATT');
                addLog(`🤖 AI plays [Counter-Attack]! Context shifted to ATT!`);
            } else if (chosenT.id === 'VAR_CHECK' && rollContext === 'GK' && !p2Hand.some(c => c.position === 'GK')) {
                activeTactic = chosenT;
                p2T.shift();
                addLog(`🤖 AI plays [VAR Check]! Rerolling context...`);
                const faces = ['ATT', 'MID', 'DEF'];
                const reroll = faces[Math.floor(Math.random() * faces.length)];
                setDieResult(reroll);
            }
        }
        setP2Tactics(p2T);
        setP2ActiveTactic(activeTactic);

        // Select AI Card(s)
        const finalContext = activeTactic?.id === 'COUNTER_ATTACK' ? 'ATT' : (rollContext === 'DUO' ? duoType : rollContext);
        if (rollContext === 'DUO') {
            // AI picks 2 cards for Duo
            const sorted = [...p2Hand].sort((a, b) => b.stats[finalContext] - a.stats[finalContext]);
            setAiCard([sorted[0], sorted[1]]);
        } else {
            const aiC = selectAICard(p2Hand, p1Hand, finalContext, aiDifficulty);
            setAiCard(aiC);
        }
    };

    const selectAICard = (hand, opponentHand, context, difficulty) => {
        if (hand.length === 0) return null;
        if (difficulty === 'ROOKIE') {
            return hand.reduce((max, card) => card.stats[context] > max.stats[context] ? card : max, hand[0]);
        }
        if (difficulty === 'PROFESSIONAL') {
            const oppBestVal = opponentHand.reduce((max, card) => Math.max(max, card.stats[context]), 0);
            const myBestCard = hand.reduce((max, card) => card.stats[context] > max.stats[context] ? card : max, hand[0]);
            if (myBestCard.stats[context] < oppBestVal - 15) {
                return hand.reduce((min, card) => card.stats[context] < min.stats[context] ? card : min, hand[0]);
            }
            return myBestCard;
        }
        if (difficulty === 'VETERAN' || difficulty === 'LEGEND') {
            // Minimax simulation for single duels
            let bestCard = hand[0];
            let bestWinRate = -1;

            hand.forEach(card => {
                let wins = 0;
                for (let i = 0; i < 100; i++) {
                    const simOppCard = opponentHand[Math.floor(Math.random() * opponentHand.length)] || card;
                    let myVal = card.stats[context];
                    let oppVal = simOppCard.stats[context];
                    if (context === 'DEF') {
                        if (card.position === 'GK') myVal += Math.floor(card.stats.GK * 0.5);
                        if (simOppCard.position === 'GK') oppVal += Math.floor(simOppCard.stats.GK * 0.5);
                    }
                    if (myVal > oppVal) wins++;
                }
                const rate = wins / 100;
                if (rate > bestWinRate) {
                    bestWinRate = rate;
                    bestCard = card;
                }
            });
            return bestCard;
        }
        return hand[0];
    };

    const handleCardSelect = (card) => {
        if (turnPhase !== 'SELECT') return;

        // Active sub tactic swap logic
        if (p1ActiveTactic?.id === 'SUBSTITUTION') {
            alert("Substitutes are only available in Standard Draft matches.");
            setP1ActiveTactic(null);
            return;
        }

        if (dieResult === 'DUO') {
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

    const playTactic = (tactic) => {
        if (turnPhase !== 'SELECT') return;
        if (p1ActiveTactic) return;

        setP1ActiveTactic(tactic);
        setP1Tactics(p1Tactics.filter(t => t.id !== tactic.id));

        if (tactic.id === 'VAR_CHECK') {
            const faces = ['ATT', 'MID', 'DEF', 'GK'];
            const reroll = faces[Math.floor(Math.random() * faces.length)];
            setDieResult(reroll);
            addLog(`⚡ Player plays [VAR Check]! Rerolling to ${reroll}!`);
        } else if (tactic.id === 'COUNTER_ATTACK') {
            if (dieResult === 'DEF') {
                setDieResult('ATT');
                addLog("⚡ Player plays [Counter-Attack]! Context shifted to ATTACK!");
            } else {
                addLog("⚠️ Counter-Attack can only be played on a DEF roll.");
            }
        } else if (tactic.id === 'HIGH_PRESS') {
            addLog("⚡ Player plays [High Press]! Opponent card revealed!");
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
        }, 1200);
    };

    const resolveRound = () => {
        let p1Val = 0;
        let p2Val = 0;

        if (dieResult === 'DUO') {
            p1Val = selectedCard[0].stats[duoType] + selectedCard[1].stats[duoType];
            p2Val = aiCard[0].stats[duoType] + aiCard[1].stats[duoType];
            addLog(`⚔️ Duo Battle on ${duoType}: [${selectedCard[0].name} + ${selectedCard[1].name}] (${p1Val}) vs [${aiCard[0].name} + ${aiCard[1].name}] (${p2Val})`);
        } else {
            p1Val = selectedCard.stats[dieResult] || 0;
            p2Val = aiCard.stats[dieResult] || 0;
            addLog(`⚔️ Duel: ${selectedCard.name} (${p1Val} ${dieResult}) vs ${aiCard.name} (${p2Val} ${dieResult})`);

            // Sweeper Keeper
            if (dieResult === 'DEF') {
                if (selectedCard.position === 'GK') {
                    const b = Math.floor(selectedCard.stats.GK * 0.5);
                    p1Val += b;
                    addLog(`🛡️ Sweeper Goalkeeper: ${selectedCard.name} defense gets +${b}!`);
                }
                if (aiCard.position === 'GK') {
                    const b = Math.floor(aiCard.stats.GK * 0.5);
                    p2Val += b;
                    addLog(`🛡️ AI Sweeper Goalkeeper: ${aiCard.name} defense gets +${b}!`);
                }
            }

            // Tactics
            if (p1ActiveTactic?.id === 'OFFSIDE_TRAP' && aiCard.position === 'FW') {
                p2Val = Math.floor(p2Val * 0.5);
                addLog(`🥅 Offside Trap: Opponent FW stats halved! (${p2Val})`);
            }
            if (p2ActiveTactic?.id === 'OFFSIDE_TRAP' && selectedCard.position === 'FW') {
                p1Val = Math.floor(p1Val * 0.5);
                addLog(`🥅 AI Offside Trap: Your FW stats halved! (${p1Val})`);
            }

            // Traits
            if (dieResult === 'ATT') {
                if (selectedCard.trait?.id === 'Poacher' && aiCard.position === 'GK') {
                    p1Val += 20;
                    addLog(`⚡ Poacher Trait: ${selectedCard.name} gets +20 ATT vs Goalkeeper!`);
                }
                if (aiCard.trait?.id === 'Poacher' && selectedCard.position === 'GK') {
                    p2Val += 20;
                    addLog(`⚡ AI Poacher Trait: ${aiCard.name} gets +20 ATT vs Goalkeeper!`);
                }
            }
            if (round === 5) {
                if (selectedCard.trait?.id === 'Captain') {
                    p1Val += 10;
                    addLog(`⚡ Captain Trait: +10 stat boost to ${selectedCard.name}!`);
                }
                if (aiCard.trait?.id === 'Captain') {
                    p2Val += 10;
                    addLog(`⚡ AI Captain Trait: +10 stat boost to ${aiCard.name}!`);
                }
            }
            if (dieResult === 'ATT') {
                if (selectedCard.trait?.id === 'False Nine' && selectedCard.stats.MID > selectedCard.stats.ATT) {
                    p1Val = selectedCard.stats.MID;
                    addLog(`⚡ False Nine Trait: ${selectedCard.name} attacks with Midfield stat! (${p1Val})`);
                }
                if (aiCard.trait?.id === 'False Nine' && aiCard.stats.MID > aiCard.stats.ATT) {
                    p2Val = aiCard.stats.MID;
                    addLog(`⚡ AI False Nine Trait: ${aiCard.name} attacks with Midfield stat! (${p2Val})`);
                }
            }
            if (enforcedNextRound.p1) {
                p1Val = Math.floor(p1Val * 0.5);
                setEnforcedNextRound(prev => ({ ...prev, p1: false }));
                addLog(`💥 Enforced: Your active stat is halved! (${p1Val})`);
            }
            if (enforcedNextRound.p2) {
                p2Val = Math.floor(p2Val * 0.5);
                setEnforcedNextRound(prev => ({ ...prev, p2: false }));
                addLog(`💥 AI Enforced: AI active stat is halved! (${p2Val})`);
            }
        }

        // Compare Values
        let winner = 'DRAW';
        if (p1Val > p2Val) {
            winner = 'P1';
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
            addLog(`⚽ GOAL! You score!`);

            if (dieResult !== 'DUO') {
                if (selectedCard.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                    setEnforcedNextRound(prev => ({ ...prev, p2: true }));
                    addLog(`⚡ Enforcer: Next round opponent stats halved!`);
                }
                if (selectedCard.trait?.id === 'Playmaker' && dieResult === 'MID') {
                    setChosenNextAttribute('CHOOSE');
                    addLog(`⚡ Playmaker: Choose next round's context!`);
                }
            }
        } else if (p2Val > p1Val) {
            winner = 'P2';
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
            addLog(`🥅 GOAL! AI scores!`);

            if (dieResult !== 'DUO') {
                if (aiCard.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                    setEnforcedNextRound(prev => ({ ...prev, p1: true }));
                    addLog(`⚡ AI Enforcer: Your next round stats are halved!`);
                }
                if (aiCard.trait?.id === 'Playmaker' && dieResult === 'MID') {
                    const statsList = ['ATT', 'MID', 'DEF'];
                    setChosenNextAttribute(statsList[Math.floor(Math.random() * statsList.length)]);
                    addLog(`⚡ AI Playmaker: AI dictates next round context.`);
                }
            }
        } else {
            addLog("🤝 Stats are level! Resolving tie...");
            if (dieResult !== 'DUO') {
                const p1Wall = selectedCard.trait?.id === 'Wall' && dieResult === 'DEF';
                const p2Wall = aiCard.trait?.id === 'Wall' && dieResult === 'DEF';

                if (p1Wall && !p2Wall) {
                    winner = 'P1';
                    setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                    addLog(`⚡ Wall Trait: ${selectedCard.name} holds the line! Goal scored!`);
                } else if (p2Wall && !p1Wall) {
                    winner = 'P2';
                    setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                    addLog(`⚡ AI Wall Trait: Opponent holds the line! Goal scored!`);
                } else {
                    const p1Agg = selectedCard.aggression;
                    const p2Agg = aiCard.aggression;
                    addLog(`🔥 Aggression Check: You (${p1Agg}) vs AI (${p2Agg})`);
                    
                    if (p1Agg > p2Agg) {
                        winner = 'P1';
                        setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                        addLog(`🏆 You win the physical duel!`);
                    } else if (p2Agg > p1Agg) {
                        winner = 'P2';
                        setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                        addLog(`🏆 AI wins the physical duel!`);
                    } else {
                        addLog("🙅 Duel completely blocked.");
                    }
                }
            } else {
                addLog("🙅 Duo duel completely blocked.");
            }
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
        setDieResult(null);
        setDuoType(null);

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

    const selectPlaymakerContext = (attr) => {
        setChosenNextAttribute(attr);
        addLog(`⚡ Playmaker:locked next context: ${attr}!`);
        nextRound();
    };

    const nextSet = () => {
        setCurrentSet(currentSet + 1);
        startSet(currentSet + 1);
    };

    const getSetBackground = () => {
        if (currentSet === 1) return "url('/images/tier_apex.png')";
        if (currentSet === 2) return "url('/images/tier_challenger.png')";
        return "url('/images/tier_foundation.png')";
    };

    return (
        <div 
            className="match-engine full-screen"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(10, 15, 29, 0.55) 0%, rgba(5, 7, 10, 0.95) 100%), ${getSetBackground()}`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transition: 'background 0.8s ease'
            }}
        >
            <div className="match-content-grid">
                
                {/* 1. Header Score & Sets */}
                <div className="match-header glass-panel">
                    <div className="player-score you">YOU: {scores.p1}</div>
                    <div className="match-info">
                        <div className="set-indicator">SET {currentSet} / 3</div>
                        <div className="round-indicator">ROUND {round}</div>
                    </div>
                    <div className="player-score cpu">CPU: {scores.p2}</div>
                </div>

                {/* 2. Opponent Hand */}
                <div className="opponent-bench-area">
                    <div className="hand-indicator">
                        <span>CPU HAND ({p2Hand.length})</span>
                    </div>
                    <div className="opponent-cards-fan">
                        {p2Hand.map((c, i) => (
                            <div key={i} className="card-back-mini-glow"></div>
                        ))}
                    </div>
                </div>

                {/* 3. Center Pitch Stadium */}
                <div className="pitch-center-stadium">
                    {turnPhase === 'ROLL' && (
                        <button className="roll-btn glow-pulse" onClick={rollDie}>KICK DIE</button>
                    )}

                    {(turnPhase === 'ROLLING' || turnPhase === 'SELECT' || turnPhase === 'REVEAL' || turnPhase === 'RESOLVE') && (
                        <div className="die-render-arena">
                            {dieResult === 'DUO' ? (
                                <div className="duo-indicator glow-pulse">
                                    DUO EVENT
                                    <span>{duoType} BATTLE</span>
                                </div>
                            ) : (
                                <MatchDie rolling={isRolling} face={dieResult} />
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Player Hand & Tactics Control */}
                <div className="player-bench-area">
                    {/* Tactics panel */}
                    {p1Tactics.length > 0 && turnPhase === 'SELECT' && dieResult !== 'DUO' && (
                        <div className="tactics-selector">
                            <span className="tactic-title">TACTICS:</span>
                            {p1Tactics.map(t => (
                                <button 
                                    key={t.id} 
                                    className={`tactic-badge ${p1ActiveTactic?.id === t.id ? 'active' : ''}`}
                                    onClick={() => playTactic(t)}
                                    title={t.desc}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="hand-cards-list">
                        {p1Hand.map(card => {
                            const isSelected = Array.isArray(selectedCard)
                                ? selectedCard.find(c => c.id === card.id)
                                : selectedCard?.id === card.id;

                            return (
                                <div
                                    key={card.id}
                                    className={`hand-card-wrapper-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleCardSelect(card)}
                                >
                                    <Card data={card} size="small" isFlipped={true} highlightAttribute={dieResult === 'DUO' ? duoType : dieResult} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="player-action-strip">
                        <span className="bench-count">TRI-SQUAD MODE</span>
                        {turnPhase === 'SELECT' && (
                            <button className="confirm-btn glow-active" onClick={confirmSelection}>
                                {dieResult === 'DUO' ? 'CONFIRM DUO' : 'PLAY PLAYER'}
                            </button>
                        )}
                    </div>
                </div>

                {/* 5. Live Match Commentary logs */}
                <div className="commentary-ticker glass-panel">
                    <div className="commentary-header">LIVE COMMENTARY</div>
                    <div className="logs-feed">
                        {logs.map((log, idx) => (
                            <div key={idx} className="log-line">{log}</div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>

            </div>

            {/* Resolve Battle Overlay */}
            {turnPhase === 'RESOLVE' && (
                <div className="round-result">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {scores.p1}</div>
                        <div className="round-display">SET {currentSet} COMPLETE</div>
                        <div className="score-display">CPU: {scores.p2}</div>
                    </div>

                    <div className="battle-cards">
                        <div className="battle-card-wrapper">
                            <div className="battle-label you">YOU</div>
                            {Array.isArray(selectedCard) ? (
                                <div className="duo-display">
                                    <Card data={selectedCard[0]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                    <Card data={selectedCard[1]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                </div>
                            ) : (
                                <Card data={selectedCard} isFlipped={true} highlightAttribute={dieResult} />
                            )}
                        </div>

                        <div className="vs-text">VS</div>

                        <div className="battle-card-wrapper">
                            <div className="battle-label cpu">CPU</div>
                            {Array.isArray(aiCard) ? (
                                <div className="duo-display">
                                    <Card data={aiCard[0]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                    <Card data={aiCard[1]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                </div>
                            ) : (
                                <Card data={aiCard} isFlipped={true} highlightAttribute={dieResult} />
                            )}
                        </div>
                    </div>

                    <div className="result-text-container">
                        {roundWinner === 'P1' && <h2 className="win-text">YOU SCORE!</h2>}
                        {roundWinner === 'P2' && <h2 className="lose-text">AI SCORES!</h2>}
                        {roundWinner === 'DRAW' && <h2 className="draw-text">DRAW BATTLE!</h2>}
                    </div>

                    {chosenNextAttribute === 'CHOOSE' ? (
                        <div className="playmaker-choice-modal glass-panel">
                            <h3>Choose Next Round context:</h3>
                            <div className="choice-buttons">
                                {['ATT', 'MID', 'DEF'].map(attr => (
                                    <button key={attr} className="choice-btn" onClick={() => selectPlaymakerContext(attr)}>
                                        {attr}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <button className="next-round-btn glow-active" onClick={nextRound}>CONTINUE</button>
                    )}
                </div>
            )}

            {/* Set Over Overlay */}
            {turnPhase === 'SET_OVER' && (
                <div className="round-result">
                    <h2 className="text-gradient">SET {currentSet} COMPLETE</h2>
                    <p className="split-desc">Ready your next Squad for the match.</p>
                    <button className="next-round-btn glow-active" onClick={nextSet}>
                        START SET {currentSet + 1}
                    </button>
                </div>
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && (
                <div className="round-result match-over-glass">
                    <h1 className="text-gradient">FULL TIME</h1>
                    <div className="final-score">
                        {scores.p1} - {scores.p2}
                    </div>
                    <h2 className="match-outcome-txt">
                        {scores.p1 > scores.p2 ? '🏆 MATCH VICTORY!' : '😭 MATCH DEFEAT!'}
                    </h2>
                    <button className="next-round-btn glow-active" onClick={() => setPhase('MENU')}>
                        RETURN TO MAIN MENU
                    </button>
                </div>
            )}
        </div>
    );
};

export default MatchEngine;
