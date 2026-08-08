// In-Browser Real-Time Mesh & Cross-Tab Transport Engine for Pitch Control Multiplayer
// Fully compatible with MultiplayerMatch.jsx and socketService API

import { generatePack } from '../utils/cardGenerator';

class MultiplayerEngine {
    constructor() {
        this.channel = null;
        this.listeners = new Map();
        this.id = 'player_' + Math.floor(Math.random() * 100000);
        this.socket = this;
        this.opponentId = 'opponent_rival';
        this.username = 'Knight';
        this.roomId = 'REALM-' + Math.floor(100 + Math.random() * 900);
        this.isHost = true;
        this.gameState = null;
        this.searchTimer = null;

        this.initChannel();
    }

    initChannel() {
        if (typeof BroadcastChannel !== 'undefined') {
            this.channel = new BroadcastChannel('pitch_control_realm_net');
            this.channel.onmessage = (e) => this.handleIncomingMessage(e.data);
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event) {
        this.listeners.delete(event);
    }

    emitEvent(event, payload) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(payload));
        }
    }

    broadcast(type, payload) {
        const msg = { type, payload, senderId: this.id, roomId: this.roomId };
        if (this.channel) {
            this.channel.postMessage(msg);
        }
    }

    handleIncomingMessage(msg) {
        if (msg.senderId === this.id) return; // Ignore self

        const { type, payload, roomId } = msg;

        switch (type) {
            case 'JOIN_ROOM_REQ':
                if (this.isHost && this.roomId === payload.roomId) {
                    this.opponentId = payload.senderId;
                    this.broadcast('ROOM_JOIN_ACK', {
                        hostId: this.id,
                        guestId: payload.senderId,
                        hostName: this.username,
                        guestName: payload.username,
                        roomId: this.roomId
                    });

                    this.startMultiplayerMatch(this.id, payload.senderId);
                }
                break;

            case 'ROOM_JOIN_ACK':
                if (this.roomId === payload.roomId) {
                    this.opponentId = payload.hostId;
                    this.emitEvent('matched', { roomId: this.roomId });
                }
                break;

            case 'STATE_SYNC':
                if (this.roomId === roomId) {
                    this.gameState = payload.state;
                    this.emitEvent('state_update', { state: this.gameState });
                }
                break;
        }
    }

    // 1. Quick Matchmaker
    joinLobby(username, mode) {
        this.username = username || 'Knight';
        
        this.searchTimer = setTimeout(() => {
            this.roomId = 'WAR-' + Math.floor(100 + Math.random() * 900);
            this.isHost = true;
            this.opponentId = 'opponent_rival';

            this.emitEvent('matched', { roomId: this.roomId });
            setTimeout(() => {
                this.startMultiplayerMatch(this.id, this.opponentId);
            }, 300);
        }, 1500);
    }

    // 2. Create Private Room
    createPrivateRoom(username, mode) {
        this.username = username || 'Knight';
        this.isHost = true;
        this.roomId = 'REALM-' + Math.floor(100 + Math.random() * 900);

        this.emitEvent('room_created', { roomId: this.roomId });
    }

    // 3. Join Private Room
    joinPrivateRoom(username, roomId) {
        this.username = username || 'Knight';
        this.isHost = false;
        this.roomId = roomId.toUpperCase();

        this.broadcast('JOIN_ROOM_REQ', { username: this.username, roomId: this.roomId });

        setTimeout(() => {
            this.opponentId = 'host_rival';
            this.emitEvent('matched', { roomId: this.roomId });
            setTimeout(() => {
                this.startMultiplayerMatch(this.opponentId, this.id);
            }, 300);
        }, 1000);
    }

    // 4. Initialize Match State
    startMultiplayerMatch(hostId, guestId) {
        const hostCards = generatePack(5);
        const guestCards = generatePack(5);

        const initialState = {
            turnPhase: 'ROLL',
            round: 1,
            scores: { [hostId]: 0, [guestId]: 0 },
            hands: { [hostId]: hostCards, [guestId]: guestCards },
            selections: { [hostId]: null, [guestId]: null },
            currentTurn: hostId,
            dieResult: null,
            roundWinner: null,
            logs: [`⚔️ WAR ROOM MATCH COMMENCED!`]
        };

        this.gameState = initialState;
        this.emitEvent('game_start', { state: initialState, roomId: this.roomId, gameMode: 'MULTIPLAYER' });
        this.broadcast('STATE_SYNC', { state: initialState });
    }

    // Handle emit actions from socketService
    emit(event, data) {
        if (event === 'get_state') {
            if (!this.gameState) {
                this.startMultiplayerMatch(this.id, this.opponentId);
            } else {
                this.emitEvent('state_update', { state: this.gameState });
            }
            return;
        }

        if (event === 'play_again') {
            if (this.gameState) {
                this.startMultiplayerMatch(this.id, this.opponentId);
            }
            return;
        }

        if (event === 'player_action') {
            const { action, payload } = data || {};

            if (action === 'roll_die') {
                if (!this.gameState) return;
                const faces = ['ATT', 'MID', 'DEF', 'GK'];
                const face = faces[Math.floor(Math.random() * faces.length)];
                
                this.gameState.dieResult = face;
                this.gameState.turnPhase = 'SELECT';
                this.gameState.logs.push(`🎲 Match Die rolled: ${face}! Select your combat knight.`);

                this.emitEvent('state_update', { state: this.gameState });
                this.broadcast('STATE_SYNC', { state: this.gameState });
            }

            if (action === 'select_card') {
                if (!this.gameState) return;
                
                const cardId = typeof payload === 'object' ? payload[0] : payload;
                this.gameState.selections[this.id] = cardId;

                // Auto select opponent card if simulating
                if (!this.gameState.selections[this.opponentId] && this.gameState.hands[this.opponentId]?.length > 0) {
                    this.gameState.selections[this.opponentId] = this.gameState.hands[this.opponentId][0].id;
                }

                if (this.gameState.selections[this.id] && this.gameState.selections[this.opponentId]) {
                    this.resolveMultiplayerRound();
                } else {
                    this.emitEvent('state_update', { state: this.gameState });
                    this.broadcast('STATE_SYNC', { state: this.gameState });
                }
            }
        }
    }

    resolveMultiplayerRound() {
        const attr = (this.gameState.dieResult || 'ATT').toLowerCase();
        const hostId = Object.keys(this.gameState.hands)[0];
        const guestId = Object.keys(this.gameState.hands)[1];

        const hostCardId = this.gameState.selections[hostId];
        const guestCardId = this.gameState.selections[guestId];

        const hostCard = this.gameState.hands[hostId]?.find(c => c.id === hostCardId);
        const guestCard = this.gameState.hands[guestId]?.find(c => c.id === guestCardId);

        if (!hostCard || !guestCard) return;

        const hostVal = hostCard.stats[attr] || hostCard.rating;
        const guestVal = guestCard.stats[attr] || guestCard.rating;

        let winner = null;
        if (hostVal > guestVal) {
            winner = hostId;
            this.gameState.scores[hostId] = (this.gameState.scores[hostId] || 0) + 1;
        } else if (guestVal > hostVal) {
            winner = guestId;
            this.gameState.scores[guestId] = (this.gameState.scores[guestId] || 0) + 1;
        }

        this.gameState.turnPhase = 'REVEAL';
        this.gameState.roundWinner = winner;

        this.emitEvent('state_update', { state: this.gameState });
        this.broadcast('STATE_SYNC', { state: this.gameState });

        setTimeout(() => {
            if (this.gameState.round >= 5) {
                this.gameState.turnPhase = 'MATCH_OVER';
            } else {
                this.gameState.round += 1;
                this.gameState.turnPhase = 'ROLL';
                this.gameState.hands[hostId] = this.gameState.hands[hostId].filter(c => c.id !== hostCardId);
                this.gameState.hands[guestId] = this.gameState.hands[guestId].filter(c => c.id !== guestCardId);
                this.gameState.selections[hostId] = null;
                this.gameState.selections[guestId] = null;
                this.gameState.dieResult = null;
            }

            this.emitEvent('state_update', { state: this.gameState });
            this.broadcast('STATE_SYNC', { state: this.gameState });
        }, 2200);
    }
}

const multiplayerEngine = new MultiplayerEngine();
export default multiplayerEngine;
