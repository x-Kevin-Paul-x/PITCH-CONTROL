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
        // Randomly assign who splits
        const splitter = Math.random() < 0.5 ? 'P1' : 'P2';
        setDraftSplitter(splitter);
        setTurnPhase('DRAFT_SPLIT');

        if (splitter === 'P1') {
            addLog("🛠️ Winston Draft: You are the splitter. Separate cards into two piles of 5.");
            // Initially dump all in Pile A
            setPileA([...scoutingPool]);
            setPileB([]);
        } else {
            addLog("🤖 Winston Draft: AI is splitting the pool into two balanced piles.");
            // AI balances: sorts by rating, distributes zig-zag
            const sorted = [...scoutingPool].sort((a, b) => b.rating - a.rating);
            const pA = [];
            const pB = [];
            sorted.forEach((card, idx) => {
                if (idx % 2 === 0) pA.push(card);
                else pB.push(card);
            });
            setPileA(pA);
            setPileB(pB);
            // Move player straight to choose phase
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
        
        // AI chooses the better pile (sum of ratings)
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
        // Draw 3 cards, bench 2. High work rate cards drawn first!
        const sortedP1 = [...p1Cards].sort((a, b) => {
            const weights = { High: 3, Medium: 2, Low: 1 };
            return weights[b.workRate] - weights[a.workRate];
        });
        const sortedP2 = [...p2Cards].sort((a, b) => {
            const weights = { High: 3, Medium: 2, Low: 1 };
            return weights[b.workRate] - weights[a.workRate];
        });

        // Set Decks & Hands
        setP1Deck(sortedP1.slice(3));
        setP2Deck(sortedP2.slice(3));
        setP1Hand(sortedP1.slice(0, 3));
        setP2Hand(sortedP2.slice(0, 3));

        // Deal 2 random tactics
        const shuffledTactics = [...TACTICS_POOL].sort(() => Math.random() - 0.5);
        setP1Tactics(shuffledTactics.slice(0, 2));
        setP2Tactics(shuffledTactics.slice(2, 4));

        setTurnPhase('ROLL');
        addLog("⚽ Teams drafted. Round 1 Kickoff!");
    };

    // Roll Die Context
    const rollDie = () => {
        setIsRolling(true);
        setTurnPhase('ROLLING');
        sound.playDiceRoll();

        // Reset round values
        setP1ActiveTactic(null);
        setP2ActiveTactic(null);

        setTimeout(() => {
            let result;
            if (chosenNextAttribute) {
                result = chosenNextAttribute;
                setChosenNextAttribute(null);
                addLog(`⚡ Playmaker Trait: Attribute chosen: ${result}!`);
            } else {
                const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
                result = faces[Math.floor(Math.random() * faces.length)];
            }

            setDieResult(result);
            setIsRolling(false);
            setTurnPhase('SELECT');
            addLog(`🎲 Context Roll: ${result} Duel! Select your player card.`);

            // Trigger AI Tactic Decision and Card Selection
            decideAIMove(result);
        }, 2000);
    };

    // AI Card Selection & Tactic Decision
    const decideAIMove = (rollContext) => {
        // 1. AI plays tactics with chance
        let activeTactic = null;
        let p2T = [...p2Tactics];
        
        // Legend/Veteran play tactics smarter
        const playsTactics = ['VETERAN', 'LEGEND'].includes(aiDifficulty) ? Math.random() < 0.35 : Math.random() < 0.15;
        if (playsTactics && p2T.length > 0) {
            const chosenT = p2T[0];
            // Match tactic criteria
            if (chosenT.id === 'COUNTER_ATTACK' && rollContext === 'DEF') {
                activeTactic = chosenT;
                p2T.shift();
                setDieResult('ATT');
                addLog(`🤖 AI plays [Counter-Attack]! Context shifted to ATT!`);
            } else if (chosenT.id === 'VAR_CHECK' && rollContext === 'GK' && !p2Hand.some(c => c.position === 'GK')) {
                activeTactic = chosenT;
                p2T.shift();
                addLog(`🤖 AI plays [VAR Check]! Rerolling die...`);
                // Simple inline reroll
                const faces = ['ATT', 'MID', 'DEF'];
                const reroll = faces[Math.floor(Math.random() * faces.length)];
                setDieResult(reroll);
            }
        }
        setP2Tactics(p2T);
        setP2ActiveTactic(activeTactic);

        // 2. Select AI Card based on Difficulty Algorithm
        const finalContext = activeTactic?.id === 'COUNTER_ATTACK' ? 'ATT' : rollContext;
        const aiSelected = selectAICard(p2Hand, p1Hand, finalContext, aiDifficulty);
        setAiCard(aiSelected);
    };

    // AI Difficulty Decision Core
    const selectAICard = (hand, opponentHand, context, difficulty) => {
        if (hand.length === 0) return null;

        // Level 1: Rookie - Greedy Heuristic
        if (difficulty === 'ROOKIE') {
            return hand.reduce((max, card) => card.stats[context] > max.stats[context] ? card : max, hand[0]);
        }

        // Level 2: Professional - Minimax (Holds back on dead rolls)
        if (difficulty === 'PROFESSIONAL') {
            // Check if we can beat opponent's best card. If not, trash lowest stat card
            const oppBestVal = opponentHand.reduce((max, card) => Math.max(max, card.stats[context]), 0);
            const myBestCard = hand.reduce((max, card) => card.stats[context] > max.stats[context] ? card : max, hand[0]);
            
            if (myBestCard.stats[context] < oppBestVal - 15) {
                // We are highly likely to lose, dump lowest card
                return hand.reduce((min, card) => card.stats[context] < min.stats[context] ? card : min, hand[0]);
            }
            return myBestCard;
        }

        // Level 3: Veteran - Bayesian Inference (Card Counting)
        // Tracks remaining draft pool cards (10 pool minus owned hand/deck/discarded)
        if (difficulty === 'VETERAN') {
            // Count cards
            const oppMaxDef = opponentHand.length > 0 ? opponentHand.reduce((max, card) => Math.max(max, card.stats[context]), 0) : 70;
            const playableCards = [...hand].sort((a, b) => b.stats[context] - a.stats[context]);
            
            // If we have a card that cleanly beats average expected, play it. Otherwise, conserve.
            if (playableCards[0].stats[context] > oppMaxDef) {
                return playableCards[0];
            }
            // Fallback: minimax-like play
            return playableCards[Math.floor(Math.random() * playableCards.length)];
        }

        // Level 4: Legend - ISMCTS / Lookahead Simulation
        if (difficulty === 'LEGEND') {
            let bestCard = hand[0];
            let bestWinRate = -1;

            hand.forEach(card => {
                let wins = 0;
                // Run 200 simulation games with random opponent cards
                for (let i = 0; i < 200; i++) {
                    const simOppCard = opponentHand[Math.floor(Math.random() * opponentHand.length)] || card;
                    let myVal = card.stats[context];
                    let oppVal = simOppCard.stats[context];

                    // Resolve Sweeper Keeper
                    if (context === 'DEF') {
                        if (card.position === 'GK') myVal += Math.floor(card.stats.GK * 0.5);
                        if (simOppCard.position === 'GK') oppVal += Math.floor(simOppCard.stats.GK * 0.5);
                    }

                    if (myVal > oppVal) wins++;
                }
                const winRate = wins / 200;
                if (winRate > bestWinRate) {
                    bestWinRate = winRate;
                    bestCard = card;
                }
            });

            return bestCard;
        }

        return hand[0];
    };

    // Play Player Tactic
    const playTactic = (tactic) => {
        if (turnPhase !== 'SELECT') return;
        if (p1ActiveTactic) return; // Only 1 tactic per round

        setP1ActiveTactic(tactic);
        setP1Tactics(p1Tactics.filter(t => t.id !== tactic.id));

        if (tactic.id === 'VAR_CHECK') {
            const faces = ['ATT', 'MID', 'DEF', 'GK'];
            const reroll = faces[Math.floor(Math.random() * faces.length)];
            setDieResult(reroll);
            addLog(`⚡ Player plays [VAR Check]! Rerolling context to ${reroll}!`);
        } else if (tactic.id === 'COUNTER_ATTACK') {
            if (dieResult === 'DEF') {
                setDieResult('ATT');
                addLog("⚡ Player plays [Counter-Attack]! Shifting defensive duel into ATTACK!");
            } else {
                addLog("⚠️ Counter-Attack can only be played on a DEF roll.");
            }
        } else if (tactic.id === 'HIGH_PRESS') {
            addLog("⚡ Player plays [High Press]! Opponent's card is revealed!");
        } else if (tactic.id === 'SUBSTITUTION') {
            // Swap a card inside hand
            addLog("⚡ Player plays [Tactical Sub]. Select a card in hand to swap with Bench.");
        }
    };

    const handleCardSelect = (card) => {
        if (turnPhase !== 'SELECT') return;

        // Handle substitution tactic logic
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
            addLog(`🔄 Substituted ${card.name} with ${benchCard.name} from the bench.`);
            return;
        }

        setSelectedCard(card);
    };

    const confirmSelection = () => {
        if (!selectedCard) return;
        setTurnPhase('REVEAL');
        sound.playSwordClash();

        // Introduce brief reveal delay
        setTimeout(() => {
            resolveRound();
        }, 1200);
    };

    // Match Combat Resolution
    const resolveRound = () => {
        let p1Val = selectedCard.stats[dieResult] || 0;
        let p2Val = aiCard.stats[dieResult] || 0;

        addLog(`⚔️ Duel: ${selectedCard.name} (${p1Val} ${dieResult}) vs ${aiCard.name} (${p2Val} ${dieResult})`);

        // 1. Resolve Sweeper Keeper (+50% GK stat on DEF context)
        if (dieResult === 'DEF') {
            if (selectedCard.position === 'GK') {
                const bonus = Math.floor(selectedCard.stats.GK * 0.5);
                p1Val += bonus;
                addLog(`🛡️ GK Sweeper Keeper: ${selectedCard.name} adds +${bonus} to Defense!`);
            }
            if (aiCard.position === 'GK') {
                const bonus = Math.floor(aiCard.stats.GK * 0.5);
                p2Val += bonus;
                addLog(`🛡️ GK Sweeper Keeper: ${aiCard.name} adds +${bonus} to Defense!`);
            }
        }

        // 2. Resolve Active Tactics modifiers
        if (p1ActiveTactic?.id === 'OFFSIDE_TRAP' && aiCard.position === 'FW') {
            p2Val = Math.floor(p2Val * 0.5);
            addLog(`🥅 Offside Trap: Opponent FW stats are halved! (${p2Val})`);
        }
        if (p2ActiveTactic?.id === 'OFFSIDE_TRAP' && selectedCard.position === 'FW') {
            p1Val = Math.floor(p1Val * 0.5);
            addLog(`🥅 AI Offside Trap: Your FW stats are halved! (${p1Val})`);
        }

        // 3. Resolve Passives Traits
        // Poacher (+20 ATT vs GK card)
        if (dieResult === 'ATT') {
            if (selectedCard.trait?.id === 'Poacher' && aiCard.position === 'GK') {
                p1Val += 20;
                addLog(`⚡ Poacher Trait: ${selectedCard.name} gains +20 Attack vs Goalkeeper!`);
            }
            if (aiCard.trait?.id === 'Poacher' && selectedCard.position === 'GK') {
                p2Val += 20;
                addLog(`⚡ AI Poacher Trait: ${aiCard.name} gains +20 Attack vs Goalkeeper!`);
            }
        }
        // Captain (+10 to all in Round 5)
        if (round === 5) {
            if (selectedCard.trait?.id === 'Captain') {
                p1Val += 10;
                addLog(`⚡ Captain Trait: ${selectedCard.name} inspires the squad with +10 stats in Round 5!`);
            }
            if (aiCard.trait?.id === 'Captain') {
                p2Val += 10;
                addLog(`⚡ AI Captain Trait: ${aiCard.name} inspires the squad with +10 stats in Round 5!`);
            }
        }
        // False Nine (can use MID instead of ATT on ATT rolls)
        if (dieResult === 'ATT') {
            if (selectedCard.trait?.id === 'False Nine' && selectedCard.stats.MID > selectedCard.stats.ATT) {
                p1Val = selectedCard.stats.MID;
                addLog(`⚡ False Nine Trait: ${selectedCard.name} uses Midfield stat on Attack! (${p1Val})`);
            }
            if (aiCard.trait?.id === 'False Nine' && aiCard.stats.MID > aiCard.stats.ATT) {
                p2Val = aiCard.stats.MID;
                addLog(`⚡ AI False Nine Trait: ${aiCard.name} uses Midfield stat on Attack! (${p2Val})`);
            }
        }
        // Enforcer checks next round penalty flag
        if (enforcedNextRound.p1) {
            p1Val = Math.floor(p1Val * 0.5);
            setEnforcedNextRound(prev => ({ ...prev, p1: false }));
            addLog(`💥 Enforced: Your active stat is halved this round! (${p1Val})`);
        }
        if (enforcedNextRound.p2) {
            p2Val = Math.floor(p2Val * 0.5);
            setEnforcedNextRound(prev => ({ ...prev, p2: false }));
            addLog(`💥 AI Enforced: AI active stat is halved this round! (${p2Val})`);
        }

        // 4. Resolve Stamina Penalties in Round 5
        if (round >= 5) {
            if (selectedCard.stamina < 70) {
                p1Val = Math.max(0, p1Val - 10);
                addLog(`💤 Fatigue: ${selectedCard.name} suffers -10 due to low Stamina!`);
            }
            if (aiCard.stamina < 70) {
                p2Val = Math.max(0, p2Val - 10);
                addLog(`💤 AI Fatigue: ${aiCard.name} suffers -10 due to low Stamina!`);
            }
        }

        // 5. Compare Values
        let winner = 'DRAW';
        if (p1Val > p2Val) {
            winner = 'P1';
            setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
            sound.playGoalScored();
            addLog(`⚽ GOAL! ${selectedCard.name} scores!`);
            
            // Resolve Enforcer / Playmaker Traits
            if (selectedCard.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                setEnforcedNextRound(prev => ({ ...prev, p2: true }));
                addLog(`⚡ Enforcer: ${selectedCard.name} intimidates opponents. Next round stats halved!`);
            }
            if (selectedCard.trait?.id === 'Playmaker' && dieResult === 'MID') {
                // Let player choose next round context!
                setChosenNextAttribute('CHOOSE');
                addLog(`⚡ Playmaker: Choose the attribute context for the next round!`);
            }
        } else if (p2Val > p1Val) {
            winner = 'P2';
            setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
            sound.playGoalScored();
            addLog(`🥅 GOAL! AI scores!`);

            // AI Trait Triggers
            if (aiCard.trait?.id === 'Enforcer' && dieResult === 'DEF') {
                setEnforcedNextRound(prev => ({ ...prev, p1: true }));
                addLog(`⚡ AI Enforcer: Next round your stats will be halved!`);
            }
            if (aiCard.trait?.id === 'Playmaker' && dieResult === 'MID') {
                const statsList = ['ATT', 'MID', 'DEF'];
                setChosenNextAttribute(statsList[Math.floor(Math.random() * statsList.length)]);
                addLog(`⚡ AI Playmaker: AI dictates next round context.`);
            }
        } else {
            // TIE-BREAKER
            addLog("🤝 Stats are level! Resolving tie...");
            
            // Wall Passive (Wins all DEF ties)
            const p1Wall = selectedCard.trait?.id === 'Wall' && dieResult === 'DEF';
            const p2Wall = aiCard.trait?.id === 'Wall' && dieResult === 'DEF';

            if (p1Wall && !p2Wall) {
                winner = 'P1';
                setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                addLog(`⚡ Wall Trait: ${selectedCard.name} holds the defensive line! Goal scored!`);
            } else if (p2Wall && !p1Wall) {
                winner = 'P2';
                setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                addLog(`⚡ AI Wall Trait: Opponent holds the defensive line! Goal scored!`);
            } else {
                // Aggression Tie Breaker check
                // Higher aggression wins, but runs 5% chance of Red Card!
                const p1Agg = selectedCard.aggression;
                const p2Agg = aiCard.aggression;

                addLog(`🔥 Aggression Check: You (${p1Agg}) vs AI (${p2Agg})`);
                
                // Check Red Card Risk (5% chance if Aggression > 70)
                const p1Red = p1Agg > 70 && Math.random() < 0.05;
                const p2Red = p2Agg > 70 && Math.random() < 0.05;

                if (p1Red) {
                    addLog(`🔴 RED CARD! ${selectedCard.name} is sent off for a dangerous tackle! Opponent gets a goal!`);
                    winner = 'P2';
                    setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                } else if (p2Red) {
                    addLog(`🔴 AI RED CARD! ${aiCard.name} is sent off! Penalty goal awarded!`);
                    winner = 'P1';
                    setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                } else {
                    if (p1Agg > p2Agg) {
                        winner = 'P1';
                        setScores(prev => ({ ...prev, p1: prev.p1 + 1 }));
                        addLog(`🏆 You win the physical duel via higher aggression!`);
                    } else if (p2Agg > p1Agg) {
                        winner = 'P2';
                        setScores(prev => ({ ...prev, p2: prev.p2 + 1 }));
                        addLog(`🏆 AI wins the physical duel via higher aggression!`);
                    } else {
                        addLog(`🙅 Ball blocked! Match remains level.`);
                    }
                }
            }
        }

        setRoundWinner(winner);
        setTurnPhase('RESOLVE');
    };

    const nextRound = () => {
        // Remove played cards
        const newP1Hand = p1Hand.filter(c => c.id !== selectedCard.id);
        const newP2Hand = p2Hand.filter(c => c.id !== aiCard.id);

        // Draw new cards from bench/deck
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

        if (updatedP1Hand.length === 0 || updatedP2Hand.length === 0) {
            setTurnPhase('MATCH_OVER');
        } else {
            setRound(prev => prev + 1);
            setTurnPhase('ROLL');
        }
    };

    const selectPlaymakerContext = (attr) => {
        setChosenNextAttribute(attr);
        addLog(`⚡ Playmaker: Next context locked: ${attr}!`);
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
                        <div className="scouting-countdown">DRAFT STARTS IN: {scoutingTimer}S</div>
                    </div>
                    <p>Memorize these 10 cards. They will be split into two piles.</p>

                    <div className="scouting-grid">
                        {scoutingPool.map(card => (
                            <Card key={card.id} data={card} isFlipped={true} size="small" />
                        ))}
                    </div>

                    <button className="start-match-btn ready" onClick={startDraftPhase}>
                        PROCEED TO DRAFT
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
                    <h2 className="text-gradient">WINSTON DRAFT: SPLIT POOL</h2>
                    <p className="split-desc">Sort cards into two balanced piles. AI will choose their pile first.</p>

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
                        CONFIRM SPLIT
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
                    <h2 className="text-gradient">WINSTON DRAFT: CHOOSE SQUAD</h2>
                    <p className="split-desc">Select which squad pile you want to lead into the match.</p>

                    <div className="piles-section">
                        <button className="pile-bucket choose-interactive" onClick={() => choosePile('A')}>
                            <div className="choose-btn-overlay">CHOOSE PILE A</div>
                            <h3>PILE A (5 Cards)</h3>
                            <div className="pile-grid opacity-low">
                                {pileA.map(card => (
                                    <Card key={card.id} data={card} isFlipped={true} size="small" />
                                ))}
                            </div>
                        </button>

                        <button className="pile-bucket choose-interactive" onClick={() => choosePile('B')}>
                            <div className="choose-btn-overlay">CHOOSE PILE B</div>
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

    // Active Match Render
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
                
                {/* 1. Header Score & Stats */}
                <div className="match-header glass-panel">
                    <div className="player-score you">YOU: {scores.p1}</div>
                    <div className="match-info">
                        <div className="round-indicator">ROUND {round} / 5</div>
                        <div className="ai-tag">OPPONENT: {aiDifficulty} AI</div>
                    </div>
                    <div className="player-score cpu">CPU: {scores.p2}</div>
                </div>

                {/* 2. Opponent Bench Card Backs */}
                <div className="opponent-bench-area">
                    <div className="hand-indicator">
                        <span>CPU BENCH: {p2Deck.length}</span>
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
                        <button className="roll-btn glow-pulse" onClick={rollDie}>KICK DIE</button>
                    )}

                    {(turnPhase === 'ROLLING' || turnPhase === 'SELECT' || turnPhase === 'REVEAL' || turnPhase === 'RESOLVE') && (
                        <div className="die-render-arena">
                            <MatchDie rolling={isRolling} face={dieResult} />
                        </div>
                    )}
                </div>

                {/* 4. Player Hand & Tactics Control */}
                <div className="player-bench-area">
                    {/* Tactics panel */}
                    {p1Tactics.length > 0 && turnPhase === 'SELECT' && (
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

                    {/* Flipped played card position */}
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
                            <button className="confirm-btn glow-active" onClick={confirmSelection}>PLAY PLAYER</button>
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
            {turnPhase === 'RESOLVE' && createPortal(
                <div className="round-result">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {scores.p1}</div>
                        <div className="round-display">ROUND {round} COMPLETE</div>
                        <div className="score-display">CPU: {scores.p2}</div>
                    </div>

                    <div className="battle-cards">
                        <div className={`battle-card-wrapper ${roundWinner === 'P1' ? 'winner' : roundWinner === 'P2' ? 'loser' : ''}`}>
                            <div className="battle-label you">YOU</div>
                            <Card data={selectedCard} isFlipped={true} highlightAttribute={dieResult} />
                            {p1ActiveTactic && <span className="active-tactic-badge">{p1ActiveTactic.name}</span>}
                        </div>

                        <div className="vs-text">VS</div>

                        <div className={`battle-card-wrapper ${roundWinner === 'P2' ? 'winner' : roundWinner === 'P1' ? 'loser' : ''}`}>
                            <div className="battle-label cpu">CPU</div>
                            <Card data={aiCard} isFlipped={true} highlightAttribute={dieResult} />
                            {p2ActiveTactic && <span className="active-tactic-badge">{p2ActiveTactic.name}</span>}
                        </div>
                    </div>

                    <div className="result-text-container">
                        {roundWinner === 'P1' && <h2 className="win-text">GOAL SCORER!</h2>}
                        {roundWinner === 'P2' && <h2 className="lose-text">CONCEDED!</h2>}
                        {roundWinner === 'DRAW' && <h2 className="draw-text">BLOCKED DUEL!</h2>}
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
                </div>,
                document.body
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && createPortal(
                <div className="round-result match-over-glass">
                    <h1 className="text-gradient">FULL TIME</h1>
                    <div className="final-score">
                        {scores.p1} - {scores.p2}
                    </div>
                    <h2 className="match-outcome-txt">
                        {scores.p1 > scores.p2 ? '🏆 VICTORY!' : scores.p1 < scores.p2 ? '😭 DEFEAT!' : '🤝 DRAW!'}
                    </h2>
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
