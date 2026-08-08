
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import socketService from '../services/socket';
import { useGameState } from '../hooks/useGameState';
import Card from './Card';
import MatchDie from './MatchDie';
import './MatchEngine.css';
import './BattleOverlay.css';

const MultiplayerMatch = () => {
    const { setPhase } = useGameState();
    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState(null);
    const [selectedCards, setSelectedCards] = useState([]); // Array of IDs
    const [deciderActive, setDeciderActive] = useState(false);
    const [deciderPayload, setDeciderPayload] = useState(null);
    const [playAgainSelected, setPlayAgainSelected] = useState(false);
    const [playAgainCooldown, setPlayAgainCooldown] = useState(false);
    const [rematchCountdown, setRematchCountdown] = useState(0);
    const [toastMessage, setToastMessage] = useState(null);
    const toastTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const prevPhaseRef = useRef(null);

    useEffect(() => {
        const socket = socketService.getSocket();
        console.log('MultiplayerMatch mounted, socket:', socket);
        if (!socket) {
            setPhase('MENU');
            return;
        }

        setMyId(socket.id);

        // Request state immediately in case we missed game_start
        socket.emit('get_state');

        socket.on('game_start', ({ state, roomId, gameMode }) => {
            console.log('MultiplayerMatch received game_start', { roomId, gameMode, state });
            setGameState({ ...state, roomId, gameMode });
        });

        socket.on('state_update', ({ state }) => {
            console.log('MultiplayerMatch received state_update', state);

            const prevPhase = prevPhaseRef.current;

            // If we're transitioning into REVEAL, show the game-decider animation
            if (state.turnPhase === 'REVEAL' && prevPhase !== 'REVEAL') {
                // activate decider and delay applying the reveal state until animation completes
                setDeciderActive(true);
                setDeciderPayload(state);

                // play animation for ~800ms then apply the state
                setTimeout(() => {
                    setGameState(prev => ({ ...state, roomId: prev?.roomId || state.roomId, gameMode: prev?.gameMode || state.gameMode }));
                    setDeciderActive(false);
                    setDeciderPayload(null);
                }, 800);
            } else {
                setGameState(prev => ({ ...state, roomId: prev?.roomId || state.roomId, gameMode: prev?.gameMode || state.gameMode }));
            }

            // Clear local play-again flag when match restarts or we're no longer in MATCH_OVER
            if (state.turnPhase !== 'MATCH_OVER') {
                setPlayAgainSelected(false);
            }

            // Clear local selection if phase changes back to ROLL
            if (state.turnPhase === 'ROLL') {
                setSelectedCards([]);
            }

            prevPhaseRef.current = state.turnPhase;
        });

        socket.on('player_left', () => {
            alert('Opponent disconnected');
            setPhase('MENU');
        });

        // Server informs clients that a rematch has been queued and will start in X seconds
        socket.on('rematch_queued', ({ countdown }) => {
            // show toast and local countdown
            showToast(`Rematch starting in ${countdown}...`);
            setRematchCountdown(countdown);
            // run a local ticking countdown for UI
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = setInterval(() => {
                setRematchCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownTimerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });


        return () => {
            socket.off('game_start');
            socket.off('state_update');
            socket.off('player_left');
            socket.off('rematch_queued');
            clearInterval(countdownTimerRef.current);
            clearTimeout(toastTimerRef.current);
        };
    }, []);

    // Toast helper
    const showToast = (msg, duration = 2000) => {
        setToastMessage(msg);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToastMessage(null), duration);
    };

    if (!gameState) {
        return <div className="full-screen flex-center"><h1>Waiting for server...</h1></div>;
    }

    if (!gameState.hands) {
        return <div className="full-screen flex-center"><h1>Starting Match...</h1></div>;
    }


    const opponentId = Object.keys(gameState.hands).find(id => id !== myId);
    const myHand = gameState.hands[myId] || [];
    const opponentHand = gameState.hands[opponentId] || [];
    const myScore = gameState.scores[myId] || 0;
    const opponentScore = gameState.scores[opponentId] || 0;
    const isMyTurn = gameState.currentTurn === myId;

    const { turnPhase, dieResult, duoType, selections, roundWinner } = gameState;
    const opponentPlayAgain = gameState.playAgain ? !!gameState.playAgain[opponentId] : false;
    const mySelection = selections ? selections[myId] : null;
    const opponentSelection = selections ? selections[opponentId] : null;

    const handleRoll = () => {
        socketService.getSocket().emit('player_action', {
            roomId: gameState.roomId,
            action: 'roll_die'
        });
    };

    const handleCardSelect = (card) => {
        if (turnPhase !== 'SELECT') return;
        if (mySelection) return; // Already confirmed

        if (dieResult === 'DUO') {
            setSelectedCards(prev => {
                if (prev.includes(card.id)) return prev.filter(id => id !== card.id);
                if (prev.length < 2) return [...prev, card.id];
                return prev;
            });
        } else {
            setSelectedCards([card.id]);
        }
    };

    const confirmSelection = () => {
        if (dieResult === 'DUO' && selectedCards.length !== 2) return;
        if (dieResult !== 'DUO' && selectedCards.length !== 1) return;

        socketService.getSocket().emit('player_action', {
            roomId: gameState.roomId,
            action: 'select_card',
            payload: dieResult === 'DUO' ? selectedCards : selectedCards[0]
        });
    };

    // Play Again click handler with a small cooldown to prevent spam
    const handlePlayAgainClick = () => {
        const sock = socketService.getSocket();
        if (!sock) return;
        if (playAgainSelected || playAgainCooldown) return;

        sock.emit('play_again');
        setPlayAgainSelected(true);
        setPlayAgainCooldown(true);
        showToast('Play Again requested');

        // temporary cooldown to avoid double-clicks/spam
        setTimeout(() => setPlayAgainCooldown(false), 3000);
    };

    // Helper to render card from ID
    const renderCardById = (id, hand, highlight) => {
        const card = hand.find(c => c.id === id);
        if (!card) return null;
        return <Card data={card} isFlipped={true} size="small" highlightAttribute={highlight} />;
    };

    return (
        <div className="match-engine full-screen">
            {/* Top Bar */}
            <div className="match-header glass-panel">
                <div className="player-score">YOU: {myScore}</div>
                <div className="match-info">
                    <div className="set-indicator">ROUND {gameState.round}</div>
                    <div className="round-indicator">{turnPhase}</div>
                </div>
                <div className="player-score">OPP: {opponentScore}</div>
            </div>

            {deciderActive && deciderPayload && (
                <div className="decider-overlay">
                    <div className="decider-card left">
                        {/* show host selection face (if available) */}
                        {deciderPayload && deciderPayload.selections && deciderPayload.selections[myId] ? (
                            Array.isArray(deciderPayload.selections[myId]) ? (
                                <div className="decider-duo">
                                    {renderCardById(deciderPayload.selections[myId][0], (deciderPayload.hands || {})[myId] || myHand, deciderPayload.dieResult)}
                                    {renderCardById(deciderPayload.selections[myId][1], (deciderPayload.hands || {})[myId] || myHand, deciderPayload.dieResult)}
                                </div>
                            ) : (
                                renderCardById(deciderPayload.selections[myId], (deciderPayload.hands || {})[myId] || myHand, deciderPayload.dieResult)
                            )
                        ) : <div className="decider-back" />}
                    </div>

                    <div className="decider-vs">VS</div>

                    <div className="decider-card right">
                        {deciderPayload && deciderPayload.selections && deciderPayload.selections[opponentId] ? (
                            Array.isArray(deciderPayload.selections[opponentId]) ? (
                                <div className="decider-duo">
                                    {renderCardById(deciderPayload.selections[opponentId][0], (deciderPayload.hands || {})[opponentId] || opponentHand, deciderPayload.dieResult)}
                                    {renderCardById(deciderPayload.selections[opponentId][1], (deciderPayload.hands || {})[opponentId] || opponentHand, deciderPayload.dieResult)}
                                </div>
                            ) : (
                                renderCardById(deciderPayload.selections[opponentId], (deciderPayload.hands || {})[opponentId] || opponentHand, deciderPayload.dieResult)
                            )
                        ) : <div className="decider-back" />}
                    </div>

                    <div className="decider-flash" />
                </div>
            )}

            {/* Opponent Area */}
            <div className="opponent-area">
                <div className="opponent-hand">
                    {opponentHand.map((c, i) => (
                        <div key={i} className="card-back-mini"></div>
                    ))}
                </div>
                {/* Opponent Played Card */}
                <div className="played-card-spot">
                    {turnPhase === 'REVEAL' || turnPhase === 'RESOLVE' ? (
                        opponentSelection ? (
                            Array.isArray(opponentSelection) ? (
                                <div className="duo-display">
                                    {renderCardById(opponentSelection[0], opponentHand, dieResult)}
                                    {renderCardById(opponentSelection[1], opponentHand, dieResult)}
                                </div>
                            ) : (
                                renderCardById(opponentSelection, opponentHand, dieResult)
                            )
                        ) : null
                    ) : (
                        opponentSelection ? <div className="card-back-mini" style={{ transform: 'scale(1.5)' }}></div> : null
                    )}
                </div>
            </div>

            {/* Center Stage */}
            <div className="center-stage">
                {turnPhase === 'ROLL' && isMyTurn && (
                    <button className="roll-btn" onClick={handleRoll}>ROLL DIE</button>
                )}
                {turnPhase === 'ROLL' && !isMyTurn && (
                    <h2>Opponent Rolling...</h2>
                )}

                {(turnPhase === 'SELECT' || turnPhase === 'REVEAL' || turnPhase === 'RESOLVE') && (
                    <div className="die-container">
                        {dieResult === 'DUO' ? (
                            <div className="duo-indicator">
                                DUO EVENT
                                <span>{duoType} BATTLE</span>
                            </div>
                        ) : (
                            <MatchDie rolling={false} face={dieResult} />
                        )}
                    </div>
                )}
            </div>

            {/* Player Area */}
            <div className="player-area">
                <div className="played-card-spot">
                    {mySelection ? (
                        Array.isArray(mySelection) ? (
                            <div className="duo-display">
                                {renderCardById(mySelection[0], myHand, dieResult)}
                                {renderCardById(mySelection[1], myHand, dieResult)}
                            </div>
                        ) : (
                            renderCardById(mySelection, myHand, dieResult)
                        )
                    ) : (
                        <div className="played-card-spot empty"></div>
                    )}
                </div>

                <div className="player-hand">
                    {myHand.map(card => {
                        const isSelected = selectedCards.includes(card.id);
                        return (
                            <div
                                key={card.id}
                                className={`hand - card - wrapper ${isSelected ? 'selected' : ''} `}
                                onClick={() => handleCardSelect(card)}
                            >
                                <Card data={card} size="small" isFlipped={true} highlightAttribute={dieResult} />
                            </div>
                        );
                    })}
                </div>

                {turnPhase === 'SELECT' && !mySelection && (
                    <button className="confirm-btn" onClick={() => {
                        socketService.getSocket().emit('player_action', {
                            roomId: gameState.roomId,
                            action: 'select_card',
                            payload: dieResult === 'DUO' ? selectedCards : selectedCards[0]
                        });
                    }}>PLAY CARD</button>
                )}
                {turnPhase === 'SELECT' && mySelection && (
                    <h2>Waiting for opponent...</h2>
                )}
            </div>

            {/* Battle Overlay for Resolve Phase */}
            {turnPhase === 'RESOLVE' && createPortal(
                <div className="round-result">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {myScore + (roundWinner === myId ? 1 : 0)}</div>
                        <div className="round-display">ROUND {gameState.round}</div>
                        <div className="score-display">OPP: {opponentScore + (roundWinner === opponentId ? 1 : 0)}</div>
                    </div>

                    <div className="battle-cards">
                        <div className={`battle - card - wrapper ${roundWinner === myId ? 'winner' : roundWinner === opponentId ? 'loser' : ''} `}>
                            <div className="battle-label you">YOU</div>
                            {Array.isArray(mySelection) ? (
                                <div className="duo-display">
                                    {renderCardById(mySelection[0], myHand, dieResult)}
                                    {renderCardById(mySelection[1], myHand, dieResult)}
                                </div>
                            ) : (
                                renderCardById(mySelection, myHand, dieResult)
                            )}
                        </div>

                        <div className="vs-text">VS</div>

                        <div className={`battle - card - wrapper ${roundWinner === opponentId ? 'winner' : roundWinner === myId ? 'loser' : ''} `}>
                            <div className="battle-label cpu">OPP</div>
                            {Array.isArray(opponentSelection) ? (
                                <div className="duo-display">
                                    {renderCardById(opponentSelection[0], opponentHand, dieResult)}
                                    {renderCardById(opponentSelection[1], opponentHand, dieResult)}
                                </div>
                            ) : (
                                renderCardById(opponentSelection, opponentHand, dieResult)
                            )}
                        </div>
                    </div>

                    <div className="result-text-container">
                        {roundWinner === myId && <h2 className="win-text">YOU WIN!</h2>}
                        {roundWinner === opponentId && <h2 className="lose-text">YOU LOSE!</h2>}
                        {roundWinner === 'DRAW' && <h2 className="draw-text">DRAW!</h2>}
                    </div>
                </div>,
                document.body
            )}

            {/* Match Over Overlay */}
            {turnPhase === 'MATCH_OVER' && createPortal(
                <div className="round-result match-over">
                    <div className="overlay-header">
                        <div className="score-display">YOU: {myScore}</div>
                        <div className="round-display">FINAL SCORE</div>
                        <div className="score-display">OPP: {opponentScore}</div>
                    </div>

                    <div className="result-text-container">
                        {myScore > opponentScore && <h2 className="win-text">YOU WIN!</h2>}
                        {myScore < opponentScore && <h2 className="lose-text">YOU LOSE!</h2>}
                        {myScore === opponentScore && <h2 className="draw-text">DRAW!</h2>}
                    </div>

                    <div className="match-over-actions">
                        <button className="next-round-btn" onClick={() => setPhase('MENU')}>RETURN TO MENU</button>

                        <div className="play-again-block">
                            <button
                                className={`play-again-btn ${playAgainSelected ? 'ready' : ''}`}
                                onClick={handlePlayAgainClick}
                                disabled={playAgainSelected || playAgainCooldown}
                            >
                                {playAgainSelected ? 'WAITING...' : playAgainCooldown ? 'PLEASE WAIT' : 'PLAY AGAIN'}
                            </button>

                            <div className="opponent-ready">Opponent: {opponentPlayAgain ? 'READY' : 'NOT READY'}</div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Rematch Countdown Overlay */}
            {rematchCountdown > 0 && createPortal(
                <div className="rematch-countdown">
                    <div className="rematch-box">
                        <div className="rematch-text">Rematch starting in</div>
                        <div className="rematch-number">{rematchCountdown}</div>
                    </div>
                </div>,
                document.body
            )}

            {/* Toast */}
            {toastMessage && createPortal(
                <div className="toast-notification">{toastMessage}</div>,
                document.body
            )}
        </div>
    );
};

export default MultiplayerMatch;
