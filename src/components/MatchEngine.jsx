import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { generatePack } from '../utils/cardGenerator';
import Card from './Card';
import MatchDie from './MatchDie';
import { sound } from '../utils/soundEngine';
import './MatchEngine.css';
import './BattleOverlay.css';
import './StandardDuelMatch.css';

const TACTICS_POOL = [
    { id: 'VAR_CHECK', name: 'VAR Check', desc: 'Reroll the Match Die' },
    { id: 'TACTICAL_INSPIRE', name: 'Inspire', desc: '+15 Power to your card this clash' },
    { id: 'OFFSIDE_TRAP', name: 'Offside Trap', desc: 'Halves opponent FW stats this round' },
    { id: 'HIGH_PRESS', name: 'High Press', desc: 'Force opponent card to reveal' },
    { id: 'COUNTER_ATTACK', name: 'Counter-Attack', desc: 'Change DEF die to ATT' }
];

const MatchEngine = () => {
    const { triSquads, setPhase, aiDifficulty } = useGameState();

    // Match State
    const [currentSet, setCurrentSet] = useState(1);
    const [round, setRound] = useState(1);
    const [turnPhase, setTurnPhase] = useState('ROLL'); // ROLL, ROLLING, SELECT, REVEAL, RESOLVE, SET_OVER, MATCH_OVER

    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);

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
    const [setScoresRecord, setSetScoresRecord] = useState([]); // [{ set: 1, p1: 3, p2: 2 }]
    const [roundWinner, setRoundWinner] = useState(null);
    const [roundPegs, setRoundPegs] = useState([]);
    const [clashBreakdown, setClashBreakdown] = useState(null);

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
        const p1Squad = triSquads[`set${setNum}`] || [];
        const p2Squad = generatePack(5); 

        setP1Hand([...p1Squad]);
        setP2Hand(p2Squad);

        const shuffledTactics = [...TACTICS_POOL].sort(() => Math.random() - 0.5);
        setP1Tactics(shuffledTactics.slice(0, 2));
        setP2Tactics(shuffledTactics.slice(2, 4));

        setRound(1);
        setRoundPegs([]);
        setP1ActiveTactic(null);
        setP2ActiveTactic(null);
        setClashBreakdown(null);
        setTurnPhase('ROLL');
        addLog(`🏟️ Set ${setNum} Kickoff! 5 Duel Points up for grabs.`);
    };

    const rollDie = () => {
        setIsRolling(true);
        setTurnPhase('ROLLING');
        sound.playDiceRoll();
        setP1ActiveTactic(null);
        setP2ActiveTactic(null);

        setTimeout(() => {
            let result;
            if (chosenNextAttribute) {
                result = chosenNextAttribute;
                setChosenNextAttribute(null);
                addLog(`⚡ Playmaker Trait: Locked contest to ${result}!`);
            } else if (round === 3) {
                result = 'DUO';
                const stats = ['ATT', 'MID', 'DEF'];
                const duoAttr = stats[Math.floor(Math.random() * stats.length)];
                setDuoType(duoAttr);
                addLog(`🔥 DUO CLASH! Choose 2 cards to combine power on ${duoAttr}!`);
            } else {
                const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
                result = faces[Math.floor(Math.random() * faces.length)];
            }

            setDieResult(result);
            setIsRolling(false);
            setTurnPhase('SELECT');
            if (result !== 'DUO') {
                addLog(`🎲 Contest: ${result} Duel! Select your champion card.`);
            }

            decideAIMove(result);
        }, 1600);
    };

    const decideAIMove = (rollContext) => {
        let activeTactic = null;
        let p2T = [...p2Tactics];

        const playsTactics = ['VETERAN', 'LEGEND'].includes(aiDifficulty) ? Math.random() < 0.35 : Math.random() < 0.15;
        if (playsTactics && p2T.length > 0 && rollContext !== 'DUO') {
            const chosenT = p2T[0];
            if (chosenT.id === 'COUNTER_ATTACK' && rollContext === 'DEF') {
                activeTactic = chosenT;
                p2T.shift();
                setDieResult('ATT');
                addLog(`🤖 AI plays [Counter-Attack]! Contest shifted to ATT!`);
            } else if (chosenT.id === 'VAR_CHECK' && rollContext === 'GK' && !p2Hand.some(c => c.position === 'GK')) {
                activeTactic = chosenT;
                p2T.shift();
                addLog(`🤖 AI plays [VAR Check]! Rerolling contest...`);
                const faces = ['ATT', 'MID', 'DEF'];
                const reroll = faces[Math.floor(Math.random() * faces.length)];
                setDieResult(reroll);
            }
        }
        setP2Tactics(p2T);
        setP2ActiveTactic(activeTactic);

        const finalContext = activeTactic?.id === 'COUNTER_ATTACK' ? 'ATT' : (rollContext === 'DUO' ? duoType : rollContext);
        if (rollContext === 'DUO') {
            const sorted = [...p2Hand].sort((a, b) => (b.stats[finalContext] || 0) - (a.stats[finalContext] || 0));
            setAiCard([sorted[0], sorted[1]]);
        } else {
            const aiC = selectAICard(p2Hand, p1Hand, finalContext, aiDifficulty);
            setAiCard(aiC);
        }
    };

    const selectAICard = (hand, opponentHand, context, difficulty) => {
        if (hand.length === 0) return null;
        if (difficulty === 'ROOKIE') {
            return hand.reduce((max, card) => (card.stats[context] || 0) > (max.stats[context] || 0) ? card : max, hand[0]);
        }
        if (difficulty === 'PROFESSIONAL') {
            const oppBestVal = opponentHand.reduce((max, card) => Math.max(max, card.stats[context] || 0), 0);
            const myBestCard = hand.reduce((max, card) => (card.stats[context] || 0) > (max.stats[context] || 0) ? card : max, hand[0]);
            if ((myBestCard.stats[context] || 0) < oppBestVal - 15) {
                return hand.reduce((min, card) => (card.stats[context] || 0) < (min.stats[context] || 0) ? card : min, hand[0]);
            }
            return myBestCard;
        }
        if (difficulty === 'VETERAN' || difficulty === 'LEGEND') {
            let bestCard = hand[0];
            let bestWinRate = -1;

            hand.forEach(card => {
                let wins = 0;
                for (let i = 0; i < 150; i++) {
                    const simOppCard = opponentHand[Math.floor(Math.random() * opponentHand.length)] || card;
                    let myVal = card.stats[context] || 0;
                    let oppVal = simOppCard.stats[context] || 0;
                    if (context === 'DEF') {
                        if (card.position === 'GK') myVal += Math.floor((card.stats.GK || 0) * 0.5);
                        if (simOppCard.position === 'GK') oppVal += Math.floor((simOppCard.stats.GK || 0) * 0.5);
                    }
                    if (myVal > oppVal) wins++;
                }
                const rate = wins / 150;
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
        sound.playWaxSealClick();

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

        if (tactic.id === 'COUNTER_ATTACK' && dieResult !== 'DEF') {
            addLog("⚠️ Counter-Attack can only be activated during a DEFENSE contest.");
            return;
        }

        sound.playTacticPower();
        setP1ActiveTactic(tactic);
        setP1Tactics(p1Tactics.filter(t => t.id !== tactic.id));

        if (tactic.id === 'VAR_CHECK') {
            const faces = ['ATT', 'MID', 'DEF', 'GK'];
            const reroll = faces[Math.floor(Math.random() * faces.length)];
            setDieResult(reroll);
            addLog(`⚡ Player activates [VAR Check]! Contested category is now ${reroll}!`);
        } else if (tactic.id === 'COUNTER_ATTACK') {
            setDieResult('ATT');
            addLog("⚡ Player activates [Counter-Attack]! Defense duel reversed into ATTACK!");
        } else if (tactic.id === 'HIGH_PRESS') {
            addLog("⚡ Player activates [High Press]! Opponent card revealed!");
        } else if (tactic.id === 'TACTICAL_INSPIRE') {
            addLog("⚡ Player activates [Inspire]! Card gains +15 Power this clash!");
        }
    };

    const confirmSelection = () => {
        if (dieResult === 'DUO') {
            if (!Array.isArray(selectedCard) || selectedCard.length !== 2) return;
        } else {
            if (!selectedCard) return;
        }

        setTurnPhase('REVEAL');
        sound.playSwordClash();
        setTimeout(() => {
            resolveRound();
        }, 1100);
    };

    // Calculate Complete 1v1 Clash Math
    const calculateClashData = () => {
        if (dieResult === 'DUO') {
            const context = duoType;
            const p1Base = (selectedCard[0]?.stats?.[context] || 0) + (selectedCard[1]?.stats?.[context] || 0);
            const p2Base = (aiCard[0]?.stats?.[context] || 0) + (aiCard[1]?.stats?.[context] || 0);

            let winner = 'DRAW';
            let reason = 'Equal Combined Power';
            if (p1Base > p2Base) {
                winner = 'P1';
                reason = `Higher Duo ${context} Power (${p1Base} vs ${p2Base})`;
            } else if (p2Base > p1Base) {
                winner = 'P2';
                reason = `Opponent Higher Duo ${context} Power (${p2Base} vs ${p1Base})`;
            }

            return {
                context: `${duoType} DUO`,
                isDuo: true,
                p1: { base: p1Base, mods: [], total: p1Base, card: selectedCard },
                p2: { base: p2Base, mods: [], total: p2Base, card: aiCard },
                winner,
                reason
            };
        }

        const context = dieResult;
        let p1Base = selectedCard?.stats?.[context] || 0;
        let p2Base = aiCard?.stats?.[context] || 0;

        let p1Mods = [];
        let p2Mods = [];

        // Sweeper Keeper (+50% GK on DEF)
        if (context === 'DEF') {
            if (selectedCard?.position === 'GK') {
                const b = Math.floor((selectedCard.stats.GK || 0) * 0.5);
                p1Mods.push({ label: 'Sweeper Keeper (+50% GK)', val: `+${b}`, num: b });
            }
            if (aiCard?.position === 'GK') {
                const b = Math.floor((aiCard.stats.GK || 0) * 0.5);
                p2Mods.push({ label: 'Sweeper Keeper (+50% GK)', val: `+${b}`, num: b });
            }
        }

        // Tactic Modifiers
        if (p1ActiveTactic?.id === 'TACTICAL_INSPIRE') {
            p1Mods.push({ label: 'Inspire Tactic Boost', val: '+15', num: 15 });
        }
        if (p1ActiveTactic?.id === 'OFFSIDE_TRAP' && aiCard?.position === 'FW') {
            p2Mods.push({ label: 'Offside Trap Debuff', val: '-50%', mult: 0.5 });
        }
        if (p2ActiveTactic?.id === 'OFFSIDE_TRAP' && selectedCard?.position === 'FW') {
            p1Mods.push({ label: 'AI Offside Trap', val: '-50%', mult: 0.5 });
        }

        // Traits
        if (context === 'ATT') {
            if (selectedCard?.trait?.id === 'Poacher' && aiCard?.position === 'GK') {
                p1Mods.push({ label: 'Poacher (+20 vs GK)', val: '+20', num: 20 });
            }
            if (aiCard?.trait?.id === 'Poacher' && selectedCard?.position === 'GK') {
                p2Mods.push({ label: 'AI Poacher (+20 vs GK)', val: '+20', num: 20 });
            }
        }

        if (round === 5) {
            if (selectedCard?.trait?.id === 'Captain') {
                p1Mods.push({ label: 'Captain Clutch Boost', val: '+10', num: 10 });
            }
            if (aiCard?.trait?.id === 'Captain') {
                p2Mods.push({ label: 'AI Captain Boost', val: '+10', num: 10 });
            }
        }

        if (context === 'ATT') {
            if (selectedCard?.trait?.id === 'False Nine' && ((selectedCard.stats.MID || 0) > (selectedCard.stats.ATT || 0))) {
                const diff = selectedCard.stats.MID - selectedCard.stats.ATT;
                p1Mods.push({ label: 'False Nine (Uses MID stat)', val: `+${diff}`, num: diff });
            }
            if (aiCard?.trait?.id === 'False Nine' && ((aiCard.stats.MID || 0) > (aiCard.stats.ATT || 0))) {
                const diff = aiCard.stats.MID - aiCard.stats.ATT;
                p2Mods.push({ label: 'AI False Nine (Uses MID stat)', val: `+${diff}`, num: diff });
            }
        }

        if (enforcedNextRound.p1) {
            p1Mods.push({ label: 'Enforcer Intimidation', val: '-50%', mult: 0.5 });
        }
        if (enforcedNextRound.p2) {
            p2Mods.push({ label: 'Enforcer Intimidation', val: '-50%', mult: 0.5 });
        }

        // Calculate Totals
        let p1Total = p1Base;
        p1Mods.forEach(m => {
            if (m.num) p1Total += m.num;
            if (m.mult) p1Total = Math.floor(p1Total * m.mult);
        });

        let p2Total = p2Base;
        p2Mods.forEach(m => {
            if (m.num) p2Total += m.num;
            if (m.mult) p2Total = Math.floor(p2Total * m.mult);
        });

        p1Total = Math.max(0, p1Total);
        p2Total = Math.max(0, p2Total);

        let winner = 'DRAW';
        let reason = 'Equal Total Power';

        if (p1Total > p2Total) {
            winner = 'P1';
            reason = `Higher ${context} Power (${p1Total} vs ${p2Total})`;
        } else if (p2Total > p1Total) {
            winner = 'P2';
            reason = `Opponent Higher ${context} Power (${p2Total} vs ${p1Total})`;
        } else {
            const p1Wall = selectedCard?.trait?.id === 'Wall' && context === 'DEF';
            const p2Wall = aiCard?.trait?.id === 'Wall' && context === 'DEF';

            if (p1Wall && !p2Wall) {
                winner = 'P1';
                reason = 'Wall Trait holds defensive line!';
            } else if (p2Wall && !p1Wall) {
                winner = 'P2';
                reason = 'AI Wall Trait holds defensive line!';
            } else {
                const p1Agg = selectedCard?.aggression || 50;
                const p2Agg = aiCard?.aggression || 50;

                if (p1Agg > p2Agg) {
                    winner = 'P1';
                    reason = `Physical Aggression Duel (${p1Agg} vs ${p2Agg})`;
                } else if (p2Agg > p1Agg) {
                    winner = 'P2';
                    reason = `AI Physical Aggression Duel (${p2Agg} vs ${p1Agg})`;
                } else {
                    winner = 'DRAW';
                    reason = 'Duel Completely Level';
                }
            }
        }

        return {
            context,
            isDuo: false,
            p1: { base: p1Base, mods: p1Mods, total: p1Total, card: selectedCard },
            p2: { base: p2Base, mods: p2Mods, total: p2Total, card: aiCard },
            winner,
            reason
        };
    };

    const resolveRound = () => {
        const breakdown = calculateClashData();
        setClashBreakdown(breakdown);

        const { winner, p1, p2, reason } = breakdown;
        addLog(`⚔️ Clash: You (${p1.total} Power) vs AI (${p2.total} Power)`);
        addLog(`📢 Result: ${reason}`);

        if (winner === 'P1') {
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
            sound.playPointWon();
            addLog(`🏆 Point Won! +1 Duel Point for You!`);

            if (dieResult !== 'DUO') {
                if (selectedCard?.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                    setEnforcedNextRound(prev => ({ ...prev, p2: true }));
                    addLog(`⚡ Enforcer: Next round opponent stats halved!`);
                }
                if (selectedCard?.trait?.id === 'Playmaker' && dieResult === 'MID') {
                    setChosenNextAttribute('CHOOSE');
                    addLog(`⚡ Playmaker: Choose next round's contest!`);
                }
            }
        } else if (winner === 'P2') {
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
            sound.playPointLost();
            addLog(`❌ Duel Conceded! AI scores +1 Point.`);

            if (dieResult !== 'DUO') {
                if (aiCard?.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                    setEnforcedNextRound(prev => ({ ...prev, p1: true }));
                    addLog(`⚡ AI Enforcer: Your next round stats are halved!`);
                }
                if (aiCard?.trait?.id === 'Playmaker' && dieResult === 'MID') {
                    const statsList = ['ATT', 'MID', 'DEF'];
                    setChosenNextAttribute(statsList[Math.floor(Math.random() * statsList.length)]);
                    addLog(`⚡ AI Playmaker: AI dictates next round contest.`);
                }
            }
        } else {
            sound.playWhistle();
            addLog("🤝 Duel Tied. No points awarded.");
        }

        setRoundPegs(prev => [...prev, { round, winner, context: dieResult }]);
        setRoundWinner(winner);
        setTurnPhase('RESOLVE');
    };

    const nextRound = () => {
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
        setClashBreakdown(null);

        const cardsPlayed = dieResult === 'DUO' ? 2 : 1;
        if (p1Hand.length <= cardsPlayed || round >= 4) {
            setSetScoresRecord(prev => [...prev, { set: currentSet, p1: scores.p1, p2: scores.p2 }]);
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
        addLog(`⚡ Playmaker: Locked next contest: ${attr}!`);
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
            className="match-engine standard-duel-match full-screen"
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
                    <div className="player-score you">
                        <span className="score-lbl">YOU</span>
                        <span className="score-num">{scores.p1}</span>
                    </div>

                    <div className="match-info">
                        <div className="set-indicator">SET {currentSet} OF 3 • ROUND {round}</div>
                        <div className="round-pegs-row">
                            {[1, 2, 3, 4].map(r => {
                                const peg = roundPegs.find(p => p.round === r);
                                let pegClass = 'peg-upcoming';
                                let pegText = r;
                                if (peg) {
                                    if (peg.winner === 'P1') { pegClass = 'peg-won'; pegText = '●'; }
                                    else if (peg.winner === 'P2') { pegClass = 'peg-lost'; pegText = '○'; }
                                    else { pegClass = 'peg-tied'; pegText = '⊝'; }
                                } else if (r === round) {
                                    pegClass = 'peg-current';
                                }
                                return (
                                    <div key={r} className={`round-peg ${pegClass}`} title={`Round ${r}`}>
                                        {pegText}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="ai-tag">OPPONENT: {aiDifficulty}</div>
                    </div>

                    <div className="player-score cpu">
                        <span className="score-num">{scores.p2}</span>
                        <span className="score-lbl">CPU</span>
                    </div>
                </div>

                {/* 2. Opponent Hand */}
                <div className="opponent-bench-area">
                    <div className="hand-indicator">
                        <span>CPU SQUAD ({p2Hand.length} REMAINING)</span>
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
                        <div className="roll-action-box">
                            <button className="roll-btn glow-pulse" onClick={rollDie}>ROLL CONTEST DIE</button>
                            <span className="roll-hint">Roll to reveal this round's contested category</span>
                        </div>
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
                            {dieResult && !isRolling && (
                                <div className="contested-badge">
                                    CONTEST: <span className="contested-attr-highlight">{dieResult === 'DUO' ? `${duoType} DUO` : dieResult}</span>
                                </div>
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
                            {p1Tactics.map(t => {
                                const isCounterAttack = t.id === 'COUNTER_ATTACK';
                                const isDisabled = isCounterAttack && dieResult !== 'DEF';
                                return (
                                    <button 
                                        key={t.id} 
                                        className={`tactic-badge ${p1ActiveTactic?.id === t.id ? 'active' : ''} ${isDisabled ? 'disabled-tactic' : ''}`}
                                        onClick={() => playTactic(t)}
                                        disabled={isDisabled}
                                        title={isDisabled ? "Only usable on DEF rolls" : t.desc}
                                    >
                                        {t.name}
                                    </button>
                                );
                            })}
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
                        <span className="bench-count">TRI-SQUAD SET {currentSet}</span>
                        {turnPhase === 'SELECT' && (
                            <button className="confirm-btn glow-active" onClick={confirmSelection}>
                                {dieResult === 'DUO' 
                                    ? (Array.isArray(selectedCard) && selectedCard.length === 2 ? '⚔️ DEPLOY DUO' : 'PICK 2 CARDS') 
                                    : (selectedCard ? `⚔️ DEPLOY ${selectedCard.name.toUpperCase()}` : 'SELECT CARD')}
                            </button>
                        )}
                    </div>
                </div>

                {/* 5. Live Match Commentary logs */}
                <div className="commentary-ticker glass-panel">
                    <div className="commentary-header">LIVE MATCH FEED</div>
                    <div className="logs-feed">
                        {logs.map((log, idx) => (
                            <div key={idx} className="log-line">{log}</div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>

            </div>

            {/* Resolve Battle Overlay */}
            {turnPhase === 'RESOLVE' && clashBreakdown && (
                <div className="round-result">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {scores.p1} PTS</div>
                        <div className="round-display">SET {currentSet} • ROUND {round} • {dieResult === 'DUO' ? `${duoType} DUO` : `${dieResult} DUEL`}</div>
                        <div className="score-display">CPU: {scores.p2} PTS</div>
                    </div>

                    <div className="battle-cards">
                        <div className={`battle-card-wrapper ${roundWinner === 'P1' ? 'winner' : roundWinner === 'P2' ? 'loser' : ''}`}>
                            <div className="battle-label you">YOU</div>
                            {clashBreakdown.isDuo ? (
                                <div className="duo-display">
                                    <Card data={clashBreakdown.p1.card[0]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                    <Card data={clashBreakdown.p1.card[1]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                </div>
                            ) : (
                                <Card data={clashBreakdown.p1.card} isFlipped={true} highlightAttribute={dieResult} />
                            )}
                            <div className="clash-calc-box">
                                <div className="clash-power-total player-power">
                                    POWER: {clashBreakdown.p1.total}
                                </div>
                                <div className="clash-formula-list">
                                    <span className="formula-item">Base {dieResult}: {clashBreakdown.p1.base}</span>
                                    {clashBreakdown.p1.mods.map((m, idx) => (
                                        <span key={idx} className="formula-item formula-mod">{m.label} ({m.val})</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="clash-vs-center">
                            <div className="vs-text">VS</div>
                            <div className="clash-category-pill">{dieResult === 'DUO' ? `${duoType} DUO` : `${dieResult} CLASH`}</div>
                        </div>

                        <div className={`battle-card-wrapper ${roundWinner === 'P2' ? 'winner' : roundWinner === 'P1' ? 'loser' : ''}`}>
                            <div className="battle-label cpu">CPU</div>
                            {clashBreakdown.isDuo ? (
                                <div className="duo-display">
                                    <Card data={clashBreakdown.p2.card[0]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                    <Card data={clashBreakdown.p2.card[1]} isFlipped={true} size="small" highlightAttribute={duoType} />
                                </div>
                            ) : (
                                <Card data={clashBreakdown.p2.card} isFlipped={true} highlightAttribute={dieResult} />
                            )}
                            <div className="clash-calc-box">
                                <div className="clash-power-total cpu-power">
                                    POWER: {clashBreakdown.p2.total}
                                </div>
                                <div className="clash-formula-list">
                                    <span className="formula-item">Base {dieResult}: {clashBreakdown.p2.base}</span>
                                    {clashBreakdown.p2.mods.map((m, idx) => (
                                        <span key={idx} className="formula-item formula-mod">{m.label} ({m.val})</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="result-text-container">
                        {roundWinner === 'P1' && <h2 className="win-text">👑 CLASH WON! (+1 POINT)</h2>}
                        {roundWinner === 'P2' && <h2 className="lose-text">❌ CLASH LOST</h2>}
                        {roundWinner === 'DRAW' && <h2 className="draw-text">🤝 TIED CLASH (0 PTS)</h2>}
                    </div>
                    <p className="clash-reason-tag">{clashBreakdown.reason}</p>

                    {chosenNextAttribute === 'CHOOSE' ? (
                        <div className="playmaker-choice-modal glass-panel">
                            <h3>Choose Next Round's Contested Category:</h3>
                            <div className="choice-buttons">
                                {['ATT', 'MID', 'DEF', 'GK'].map(attr => (
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
                    <div className="final-score">{scores.p1} - {scores.p2} PTS</div>
                    <p className="split-desc">Deploy your Set {currentSet + 1} Squad to continue the Arena.</p>
                    <button className="next-round-btn glow-active" onClick={nextSet}>
                        START SET {currentSet + 1} →
                    </button>
                </div>
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && (
                <div className="round-result match-over-glass">
                    <h1 className="text-gradient">ARENA CONCLUDED</h1>
                    <div className="final-score">
                        {scores.p1} - {scores.p2}
                    </div>
                    <div className="final-points-label">TOTAL DUEL POINTS</div>
                    <h2 className="match-outcome-txt">
                        {scores.p1 > scores.p2 ? '🏆 ARENA CHAMPION!' : scores.p1 < scores.p2 ? '💀 DEFEAT' : '🤝 HONORABLE DRAW'}
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
