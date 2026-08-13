import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGameState } from '../hooks/useGameState';
import { generatePack } from '../utils/cardGenerator';
import Card from './Card';
import MatchDie from './MatchDie';
import { sound } from '../utils/soundEngine';
import './StandardDuelMatch.css';
import './BattleOverlay.css';

const TACTICS_POOL = [
    { id: 'VAR_CHECK', name: 'VAR Check', desc: 'Reroll the Match Die' },
    { id: 'SUBSTITUTION', name: 'Tactical Sub', desc: 'Swap hand card with bench' },
    { id: 'OFFSIDE_TRAP', name: 'Offside Trap', desc: 'Halves opponent FW stats this round' },
    { id: 'HIGH_PRESS', name: 'High Press', desc: 'Force opponent card to reveal' },
    { id: 'COUNTER_ATTACK', name: 'Counter-Attack', desc: 'Change DEF die to ATT' }
];

const StandardDuelMatch = () => {
    const { setPhase, aiDifficulty } = useGameState();

    // Draft & Match Phases: SCOUTING, DRAFT_SPLIT, DRAFT_CHOOSE, ROLL, SELECT, REVEAL, RESOLVE, MATCH_OVER
    const [turnPhase, setTurnPhase] = useState('SCOUTING'); 
    const [arenaBackground, setArenaBackground] = useState('');

    // Scouting Phase
    const [scoutingPool, setScoutingPool] = useState([]);
    const [scoutingTimer, setScoutingTimer] = useState(15);

    // Winston Draft Piles
    const [draftSplitter, setDraftSplitter] = useState('P1'); // P1 (You) or P2 (AI)
    const [pileA, setPileA] = useState([]);
    const [pileB, setPileB] = useState([]);

    // Match Deck & Hands
    const [p1Deck, setP1Deck] = useState([]);
    const [p2Deck, setP2Deck] = useState([]);
    const [p1Hand, setP1Hand] = useState([]);
    const [p2Hand, setP2Hand] = useState([]);

    // Tactics
    const [p1Tactics, setP1Tactics] = useState([]);
    const [p2Tactics, setP2Tactics] = useState([]);
    const [p1ActiveTactic, setP1ActiveTactic] = useState(null);
    const [p2ActiveTactic, setP2ActiveTactic] = useState(null);

    // Turn States
    const [dieResult, setDieResult] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [aiCard, setAiCard] = useState(null);
    const [scores, setScores] = useState({ p1: 0, p2: 0 });
    const [roundWinner, setRoundWinner] = useState(null);
    const [round, setRound] = useState(1);
    const [roundPegs, setRoundPegs] = useState([]); // [{ round, winner, context }]
    const [clashBreakdown, setClashBreakdown] = useState(null);

    // Modifiers from Traits / Tactics
    const [enforcedNextRound, setEnforcedNextRound] = useState({ p1: false, p2: false });
    const [chosenNextAttribute, setChosenNextAttribute] = useState(null);

    // Game Logs / Commentary Feed
    const [logs, setLogs] = useState([]);
    const logEndRef = useRef(null);

    // Generate Scouting Pool on Mount
    useEffect(() => {
        const pool = generatePack(10);
        setScoutingPool(pool);
        addLog("📋 Scouting Report active. Inspect all 10 cards in the pool.");

        const arenas = [
            "url('/images/tier_apex.png')",
            "url('/images/tier_challenger.png')",
            "url('/images/tier_foundation.png')"
        ];
        const randomArena = arenas[Math.floor(Math.random() * arenas.length)];
        setArenaBackground(randomArena);
    }, []);

    // Scouting Countdown Timer
    useEffect(() => {
        if (turnPhase !== 'SCOUTING') return;
        if (scoutingTimer <= 0) {
            startDraftPhase();
            return;
        }
        const timer = setTimeout(() => setScoutingTimer(scoutingTimer - 1), 1000);
        return () => clearTimeout(timer);
    }, [scoutingTimer, turnPhase]);

    // Scroll commentary to bottom
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (msg) => {
        setLogs(prev => [...prev, `[R${round}] ${msg}`]);
    };

    const startDraftPhase = () => {
        const splitter = Math.random() < 0.5 ? 'P1' : 'P2';
        setDraftSplitter(splitter);
        setTurnPhase('DRAFT_SPLIT');

        if (splitter === 'P1') {
            addLog("🛠️ Winston Draft: You are the splitter. Separate cards into two piles of 5.");
            setPileA([...scoutingPool]);
            setPileB([]);
        } else {
            addLog("🤖 Winston Draft: AI is splitting the pool into two balanced piles.");
            const sorted = [...scoutingPool].sort((a, b) => b.rating - a.rating);
            const pA = [];
            const pB = [];
            sorted.forEach((card, idx) => {
                if (idx % 2 === 0) pA.push(card);
                else pB.push(card);
            });
            setPileA(pA);
            setPileB(pB);
            setTimeout(() => {
                setTurnPhase('DRAFT_CHOOSE');
                addLog("📋 Piles ready. Choose Pile A or Pile B. AI receives the other.");
            }, 1000);
        }
    };

    const handleMoveToPile = (card, targetPile) => {
        if (draftSplitter !== 'P1' || turnPhase !== 'DRAFT_SPLIT') return;
        if (targetPile === 'A') {
            if (pileA.length >= 5) return;
            setPileB(pileB.filter(c => c.id !== card.id));
            setPileA([...pileA, card]);
        } else {
            if (pileB.length >= 5) return;
            setPileA(pileA.filter(c => c.id !== card.id));
            setPileB([...pileB, card]);
        }
    };

    const confirmSplit = () => {
        if (pileA.length !== 5 || pileB.length !== 5) {
            alert("Each pile must contain exactly 5 cards!");
            return;
        }
        setTurnPhase('DRAFT_CHOOSE');
        addLog("🧠 AI is analyzing the split piles...");
        
        setTimeout(() => {
            const sumA = pileA.reduce((sum, c) => sum + c.rating, 0);
            const sumB = pileB.reduce((sum, c) => sum + c.rating, 0);
            
            if (sumA >= sumB) {
                addLog("🤖 AI chooses Pile A. You get Pile B.");
                finalizeDraft(pileB, pileA);
            } else {
                addLog("🤖 AI chooses Pile B. You get Pile A.");
                finalizeDraft(pileA, pileB);
            }
        }, 1500);
    };

    const choosePile = (pile) => {
        if (draftSplitter !== 'P2' || turnPhase !== 'DRAFT_CHOOSE') return;
        if (pile === 'A') {
            addLog("🏆 You chose Pile A. AI gets Pile B.");
            finalizeDraft(pileA, pileB);
        } else {
            addLog("🏆 You chose Pile B. AI gets Pile A.");
            finalizeDraft(pileB, pileA);
        }
    };

    const finalizeDraft = (p1Cards, p2Cards) => {
        const sortedP1 = [...p1Cards].sort((a, b) => {
            const weights = { High: 3, Medium: 2, Low: 1 };
            return weights[b.workRate] - weights[a.workRate];
        });
        const sortedP2 = [...p2Cards].sort((a, b) => {
            const weights = { High: 3, Medium: 2, Low: 1 };
            return weights[b.workRate] - weights[a.workRate];
        });

        setP1Deck(sortedP1.slice(3));
        setP2Deck(sortedP2.slice(3));
        setP1Hand(sortedP1.slice(0, 3));
        setP2Hand(sortedP2.slice(0, 3));

        const shuffledTactics = [...TACTICS_POOL].sort(() => Math.random() - 0.5);
        setP1Tactics(shuffledTactics.slice(0, 2));
        setP2Tactics(shuffledTactics.slice(2, 4));

        setTurnPhase('ROLL');
        addLog("⚔️ Squads ready. 1v1 Duel Match Commences!");
    };

    // Roll Die Context
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
                addLog(`⚡ Playmaker Trait: Contested attribute locked to ${result}!`);
            } else {
                const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
                result = faces[Math.floor(Math.random() * faces.length)];
            }

            setDieResult(result);
            setIsRolling(false);
            setTurnPhase('SELECT');
            addLog(`🎲 Contest: ${result} Duel! Select your champion card.`);

            decideAIMove(result);
        }, 1600);
    };

    // AI Card Selection & Tactic Decision
    const decideAIMove = (rollContext) => {
        let activeTactic = null;
        let p2T = [...p2Tactics];
        
        const playsTactics = ['VETERAN', 'LEGEND'].includes(aiDifficulty) ? Math.random() < 0.35 : Math.random() < 0.15;
        if (playsTactics && p2T.length > 0) {
            const chosenT = p2T[0];
            if (chosenT.id === 'COUNTER_ATTACK' && rollContext === 'DEF') {
                activeTactic = chosenT;
                p2T.shift();
                setDieResult('ATT');
                addLog(`🤖 AI plays [Counter-Attack]! Context shifted to ATT!`);
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

        const finalContext = activeTactic?.id === 'COUNTER_ATTACK' ? 'ATT' : rollContext;
        const aiSelected = selectAICard(p2Hand, p1Hand, finalContext, aiDifficulty);
        setAiCard(aiSelected);
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
                const winRate = wins / 150;
                if (winRate > bestWinRate) {
                    bestWinRate = winRate;
                    bestCard = card;
                }
            });

            return bestCard;
        }

        return hand[0];
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
            addLog(`⚡ Player activates [VAR Check]! Contested attribute is now ${reroll}!`);
        } else if (tactic.id === 'COUNTER_ATTACK') {
            setDieResult('ATT');
            addLog("⚡ Player activates [Counter-Attack]! Defense duel reversed into ATTACK!");
        } else if (tactic.id === 'HIGH_PRESS') {
            addLog("⚡ Player activates [High Press]! Opponent card revealed!");
        } else if (tactic.id === 'SUBSTITUTION') {
            addLog("⚡ Player activates [Tactical Sub]. Select a card in hand to swap with Bench.");
        }
    };

    const handleCardSelect = (card) => {
        if (turnPhase !== 'SELECT') return;

        if (p1ActiveTactic?.id === 'SUBSTITUTION') {
            if (p1Deck.length === 0) {
                addLog("⚠️ Bench is empty. Substitution failed.");
                setP1ActiveTactic(null);
                return;
            }
            const benchCard = p1Deck[0];
            const newHand = p1Hand.map(c => c.id === card.id ? benchCard : c);
            setP1Hand(newHand);
            setP1Deck(p1Deck.slice(1));
            setP1ActiveTactic(null);
            sound.playCardFlip();
            addLog(`🔄 Substituted ${card.name} with ${benchCard.name} from the bench.`);
            return;
        }

        sound.playWaxSealClick();
        setSelectedCard(card);
    };

    const confirmSelection = () => {
        if (!selectedCard) return;
        setTurnPhase('REVEAL');
        sound.playSwordClash();

        setTimeout(() => {
            resolveRound();
        }, 1100);
    };

    // Calculate Complete 1v1 Clash Math
    const calculateClashData = () => {
        const context = dieResult;
        let p1Base = selectedCard?.stats?.[context] || 0;
        let p2Base = aiCard?.stats?.[context] || 0;

        let p1Mods = [];
        let p2Mods = [];

        // Sweeper Keeper Bonus (+50% GK on DEF)
        if (context === 'DEF') {
            if (selectedCard?.position === 'GK') {
                const bonus = Math.floor((selectedCard.stats.GK || 0) * 0.5);
                p1Mods.push({ label: 'Sweeper Keeper (+50% GK)', val: `+${bonus}`, num: bonus });
            }
            if (aiCard?.position === 'GK') {
                const bonus = Math.floor((aiCard.stats.GK || 0) * 0.5);
                p2Mods.push({ label: 'Sweeper Keeper (+50% GK)', val: `+${bonus}`, num: bonus });
            }
        }

        // Tactic Modifiers
        if (p1ActiveTactic?.id === 'OFFSIDE_TRAP' && aiCard?.position === 'FW') {
            p2Mods.push({ label: 'Offside Trap Debuff', val: '-50%', mult: 0.5 });
        }
        if (p2ActiveTactic?.id === 'OFFSIDE_TRAP' && selectedCard?.position === 'FW') {
            p1Mods.push({ label: 'AI Offside Trap', val: '-50%', mult: 0.5 });
        }

        // Passive Traits
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

        if (round >= 5) {
            if (selectedCard?.stamina < 70) {
                p1Mods.push({ label: 'Stamina Fatigue', val: '-10', num: -10 });
            }
            if (aiCard?.stamina < 70) {
                p2Mods.push({ label: 'Stamina Fatigue', val: '-10', num: -10 });
            }
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

                const p1Red = p1Agg > 70 && Math.random() < 0.05;
                const p2Red = p2Agg > 70 && Math.random() < 0.05;

                if (p1Red) {
                    winner = 'P2';
                    reason = 'Red Card Foul! Dangerous tackle conceded!';
                } else if (p2Red) {
                    winner = 'P1';
                    reason = 'AI Red Card! Opponent sent off for dangerous foul!';
                } else if (p1Agg > p2Agg) {
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
            p1: { base: p1Base, mods: p1Mods, total: p1Total, card: selectedCard },
            p2: { base: p2Base, mods: p2Mods, total: p2Total, card: aiCard },
            winner,
            reason
        };
    };

    // Match 1v1 Combat Resolution
    const resolveRound = () => {
        const breakdown = calculateClashData();
        setClashBreakdown(breakdown);

        const { winner, p1, p2, reason } = breakdown;
        addLog(`⚔️ 1v1 Duel: ${p1.card.name} (${p1.total} Power) vs ${p2.card.name} (${p2.total} Power)`);
        addLog(`📢 Result: ${reason}`);

        if (winner === 'P1') {
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
            sound.playPointWon();
            addLog(`🏆 Point Won! +1 Duel Point for You!`);

            if (selectedCard?.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                setEnforcedNextRound(prev => ({ ...prev, p2: true }));
                addLog(`⚡ Enforcer: ${selectedCard.name} intimidates opponents. Next round stats halved!`);
            }
            if (selectedCard?.trait?.id === 'Playmaker' && dieResult === 'MID') {
                setChosenNextAttribute('CHOOSE');
                addLog(`⚡ Playmaker: Choose the contest for the next round!`);
            }
        } else if (winner === 'P2') {
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
            sound.playPointLost();
            addLog(`❌ Duel Conceded! AI scores +1 Point.`);

            if (aiCard?.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                setEnforcedNextRound(prev => ({ ...prev, p1: true }));
                addLog(`⚡ AI Enforcer: Your next round stats will be halved!`);
            }
            if (aiCard?.trait?.id === 'Playmaker' && dieResult === 'MID') {
                const statsList = ['ATT', 'MID', 'DEF'];
                setChosenNextAttribute(statsList[Math.floor(Math.random() * statsList.length)]);
                addLog(`⚡ AI Playmaker: AI dictates next round contest.`);
            }
        } else {
            sound.playWhistle();
            addLog("🤝 Duel Tied. No points awarded.");
        }

        // Record round peg
        setRoundPegs(prev => [...prev, { round, winner, context: dieResult }]);
        setRoundWinner(winner);
        setTurnPhase('RESOLVE');
    };

    const nextRound = () => {
        const newP1Hand = p1Hand.filter(c => c.id !== selectedCard.id);
        const newP2Hand = p2Hand.filter(c => c.id !== aiCard.id);

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
        setClashBreakdown(null);

        if (round >= 5 || (updatedP1Hand.length === 0 && updatedP2Hand.length === 0)) {
            setTurnPhase('MATCH_OVER');
        } else {
            setRound(prev => prev + 1);
            setTurnPhase('ROLL');
        }
    };

    const selectPlaymakerContext = (attr) => {
        setChosenNextAttribute(attr);
        addLog(`⚡ Playmaker: Next contest locked to ${attr}!`);
        nextRound();
    };

    // Scouting View Render
    if (turnPhase === 'SCOUTING') {
        return (
            <div 
                className="standard-duel-match full-screen flex-center"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10, 15, 29, 0.7) 0%, rgba(5, 7, 10, 0.95) 100%), ${arenaBackground}`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="preview-container glass-panel">
                    <div className="preview-header">
                        <h2 className="text-gradient">SCOUTING REPORT</h2>
                        <div className="scouting-countdown">DRAFT IN: {scoutingTimer}S</div>
                    </div>
                    <p className="scouting-instruction">Inspect the 10 available cards. They will be split into two 5-card squads.</p>

                    <div className="scouting-grid">
                        {scoutingPool.map(card => (
                            <Card key={card.id} data={card} isFlipped={true} size="small" />
                        ))}
                    </div>

                    <button className="start-match-btn ready" onClick={startDraftPhase}>
                        PROCEED TO SQUAD DRAFT
                    </button>
                </div>
            </div>
        );
    }

    // Winston Draft Split UI
    if (turnPhase === 'DRAFT_SPLIT') {
        return (
            <div 
                className="standard-duel-match full-screen flex-center"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10, 15, 29, 0.7) 0%, rgba(5, 7, 10, 0.95) 100%), ${arenaBackground}`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="draft-split-layout">
                    <h2 className="text-gradient">WINSTON DRAFT: SPLIT SQUADS</h2>
                    <p className="split-desc">Distribute cards into two balanced piles. AI picks first.</p>

                    <div className="piles-section">
                        <div className="pile-bucket" onClick={() => {}}>
                            <h3>PILE A ({pileA.length}/5)</h3>
                            <div className="pile-grid">
                                {pileA.map(card => (
                                    <div key={card.id} className="draft-item" onClick={() => handleMoveToPile(card, 'B')}>
                                        <Card data={card} isFlipped={true} size="small" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pile-bucket" onClick={() => {}}>
                            <h3>PILE B ({pileB.length}/5)</h3>
                            <div className="pile-grid">
                                {pileB.map(card => (
                                    <div key={card.id} className="draft-item" onClick={() => handleMoveToPile(card, 'A')}>
                                        <Card data={card} isFlipped={true} size="small" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                        className={`start-match-btn ${pileA.length === 5 && pileB.length === 5 ? 'ready' : ''}`}
                        disabled={pileA.length !== 5 || pileB.length !== 5}
                        onClick={confirmSplit}
                    >
                        CONFIRM SQUAD SPLIT
                    </button>
                </div>
            </div>
        );
    }

    // Winston Draft Choose UI
    if (turnPhase === 'DRAFT_CHOOSE') {
        return (
            <div 
                className="standard-duel-match full-screen flex-center"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10, 15, 29, 0.7) 0%, rgba(5, 7, 10, 0.95) 100%), ${arenaBackground}`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="draft-split-layout">
                    <h2 className="text-gradient">CHOOSE YOUR SQUAD</h2>
                    <p className="split-desc">Select the 5-card squad you want to command.</p>

                    <div className="piles-section">
                        <button className="pile-bucket choose-interactive" onClick={() => choosePile('A')}>
                            <div className="choose-btn-overlay">COMMAND PILE A</div>
                            <h3>PILE A (5 Cards)</h3>
                            <div className="pile-grid opacity-low">
                                {pileA.map(card => (
                                    <Card key={card.id} data={card} isFlipped={true} size="small" />
                                ))}
                            </div>
                        </button>

                        <button className="pile-bucket choose-interactive" onClick={() => choosePile('B')}>
                            <div className="choose-btn-overlay">COMMAND PILE B</div>
                            <h3>PILE B (5 Cards)</h3>
                            <div className="pile-grid opacity-low">
                                {pileB.map(card => (
                                    <Card key={card.id} data={card} isFlipped={true} size="small" />
                                ))}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active 1v1 Match Render
    return (
        <div 
            className="standard-duel-match full-screen"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(10, 15, 29, 0.55) 0%, rgba(5, 7, 10, 0.95) 100%), ${arenaBackground}`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transition: 'background 0.8s ease'
            }}
        >
            <div className="match-content-grid">
                
                {/* 1. Header Score & 5-Round Tracker */}
                <div className="match-header glass-panel">
                    <div className="player-score you">
                        <span className="score-lbl">YOU</span>
                        <span className="score-num">{scores.p1}</span>
                    </div>

                    <div className="match-info">
                        <div className="round-indicator">ROUND {round} OF 5</div>
                        <div className="round-pegs-row">
                            {[1, 2, 3, 4, 5].map(r => {
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
                        <span>CPU HAND ({p2Hand.length}) • BENCH: {p2Deck.length}</span>
                    </div>
                    <div className="opponent-cards-fan">
                        {p2Hand.map((c, i) => (
                            <div key={i} className="card-back-mini-glow"></div>
                        ))}
                    </div>
                </div>

                {/* 3. Center Pitch Arena */}
                <div className="pitch-center-stadium">
                    {turnPhase === 'ROLL' && (
                        <div className="roll-action-box">
                            <button className="roll-btn glow-pulse" onClick={rollDie}>ROLL CONTEST DIE</button>
                            <span className="roll-hint">Roll to reveal this round's contested category (ATT / MID / DEF / GK)</span>
                        </div>
                    )}

                    {(turnPhase === 'ROLLING' || turnPhase === 'SELECT' || turnPhase === 'REVEAL' || turnPhase === 'RESOLVE') && (
                        <div className="die-render-arena">
                            <MatchDie rolling={isRolling} face={dieResult} />
                            {dieResult && !isRolling && (
                                <div className="contested-badge">
                                    CONTEST: <span className="contested-attr-highlight">{dieResult}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Player Hand & Tactics Control */}
                <div className="player-bench-area">
                    {/* Tactics panel */}
                    {p1Tactics.length > 0 && turnPhase === 'SELECT' && (
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

                    {/* Hand Cards */}
                    <div className="hand-cards-list">
                        {p1Hand.map(card => {
                            const isSelectable = turnPhase === 'SELECT';
                            const isSelected = selectedCard?.id === card.id;
                            
                            return (
                                <div
                                    key={card.id}
                                    className={`hand-card-wrapper-item ${isSelected ? 'selected' : ''} ${!isSelectable ? 'disabled' : ''}`}
                                    onClick={() => handleCardSelect(card)}
                                >
                                    <Card data={card} size="small" isFlipped={true} highlightAttribute={dieResult} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="player-action-strip">
                        <span className="bench-count">BENCH: {p1Deck.length}</span>
                        {turnPhase === 'SELECT' && selectedCard && (
                            <button className="confirm-btn glow-active" onClick={confirmSelection}>
                                ⚔️ DEPLOY {selectedCard.name.toUpperCase()}
                            </button>
                        )}
                    </div>
                </div>

                {/* 5. Live Match Commentary Feed */}
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

            {/* 1v1 Clash Resolution Overlay */}
            {turnPhase === 'RESOLVE' && clashBreakdown && createPortal(
                <div className="round-result">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {scores.p1} PTS</div>
                        <div className="round-display">ROUND {round} OF 5 • {dieResult} DUEL</div>
                        <div className="score-display">CPU: {scores.p2} PTS</div>
                    </div>

                    {/* Side-by-side 1v1 Arena with Detailed Calculation */}
                    <div className="battle-cards">
                        
                        {/* Player Side */}
                        <div className={`battle-card-wrapper ${roundWinner === 'P1' ? 'winner' : roundWinner === 'P2' ? 'loser' : ''}`}>
                            <div className="battle-label you">YOU</div>
                            <Card data={clashBreakdown.p1.card} isFlipped={true} highlightAttribute={dieResult} />
                            
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

                        {/* VS Center Marker */}
                        <div className="clash-vs-center">
                            <div className="vs-text">VS</div>
                            <div className="clash-category-pill">{dieResult} CLASH</div>
                        </div>

                        {/* AI Opponent Side */}
                        <div className={`battle-card-wrapper ${roundWinner === 'P2' ? 'winner' : roundWinner === 'P1' ? 'loser' : ''}`}>
                            <div className="battle-label cpu">CPU</div>
                            <Card data={clashBreakdown.p2.card} isFlipped={true} highlightAttribute={dieResult} />
                            
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

                    {/* Result Announcement */}
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
                        <button className="next-round-btn glow-active" onClick={nextRound}>
                            {round < 5 ? 'NEXT ROUND →' : 'SEE FINAL MATCH RESULT →'}
                        </button>
                    )}
                </div>,
                document.body
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && createPortal(
                <div className="round-result match-over-glass">
                    <h1 className="text-gradient">MATCH COMPLETED</h1>
                    <div className="final-score">
                        {scores.p1} - {scores.p2}
                    </div>
                    <div className="final-points-label">FINAL DUEL POINTS</div>
                    <h2 className="match-outcome-txt">
                        {scores.p1 > scores.p2 ? '🏆 MATCH VICTORY!' : scores.p1 < scores.p2 ? '💀 DEFEAT' : '🤝 HONORABLE DRAW'}
                    </h2>
                    <p className="match-summary-p">
                        {scores.p1 > scores.p2 ? `You claimed ${scores.p1} out of 5 Duel Points against ${aiDifficulty} AI!` : `AI claimed ${scores.p2} Duel Points.`}
                    </p>
                    <button className="next-round-btn glow-active" onClick={() => setPhase('MENU')}>
                        RETURN TO MAIN MENU
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

export default StandardDuelMatch;
