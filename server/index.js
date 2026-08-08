const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { generatePack } = require('./utils/cardGenerator');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now, restrict in production
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Game State Management
const players = {}; // socketId -> { id, username, roomId, ... }
const rooms = {};   // roomId -> { id, players: [], state: {}, isPrivate: bool }
const matchmakingQueue = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_lobby', ({ username, desiredMode }) => {
        console.log(`User ${username} joined lobby for ${desiredMode}`);

        players[socket.id] = {
            id: socket.id,
            username,
            desiredMode,
            roomId: null
        };

        // Simple Matchmaking Logic
        if (matchmakingQueue.length > 0) {
            const opponentSocketId = matchmakingQueue.shift();
            const opponent = players[opponentSocketId];

            if (opponent) {
                createMatch(opponent, players[socket.id]);
            } else {
                matchmakingQueue.push(socket.id);
            }
        } else {
            matchmakingQueue.push(socket.id);
        }
    });

    socket.on('create_private_room', ({ username, desiredMode }) => {
        const roomId = uuidv4().substring(0, 6).toUpperCase(); // Short code

        players[socket.id] = {
            id: socket.id,
            username,
            desiredMode,
            roomId
        };

        const room = {
            id: roomId,
            players: [players[socket.id]],
            state: {
                status: 'waiting',
            },
            isPrivate: true,
            mode: desiredMode || 'STANDARD'
        };
        rooms[roomId] = room;

        socket.join(roomId);
        socket.emit('room_created', { roomId });
        console.log(`Private room created: ${roomId} by ${username}`);
    });

    socket.on('join_private_room', ({ username, roomId }) => {
        const room = rooms[roomId];

        if (room && room.isPrivate && room.players.length < 2) {
            players[socket.id] = {
                id: socket.id,
                username,
                roomId
            };

            room.players.push(players[socket.id]);
            socket.join(roomId);

            // Notify both players
            io.to(roomId).emit('matched', {
                roomId,
                players: room.players,
            });

            // Start Game
            const p1 = room.players[0];
            const p2 = room.players[1];

            // Notify specific opponents
            io.to(p1.id).emit('matched', { roomId, players: room.players, opponent: p2 });
            io.to(p2.id).emit('matched', { roomId, players: room.players, opponent: p1 });

            // Give clients a short moment to register their match handlers
            setTimeout(() => startGame(room), 300);
            console.log(`Player ${username} joined private room ${roomId}`);
        } else {
            socket.emit('room_error', { message: 'Room not found or full' });
        }
    });

    socket.on('player_action', ({ action, payload }) => {
        const player = players[socket.id];
        if (!player || !player.roomId) return;

        const room = rooms[player.roomId];
        if (!room) return;

        const { state } = room;
        const isTurnPlayer = state.currentTurn === socket.id;

        if (action === 'roll_die') {
            if (state.turnPhase !== 'ROLL' || !isTurnPlayer) return;

            // Roll Die
            const faces = ['ATT', 'MID', 'DEF', 'GK', 'ATT', 'MID'];
            let result;

            // Force Duo logic (every 3rd round)
            if (state.round % 3 === 0) {
                result = 'DUO';
                const stats = ['ATT', 'MID', 'DEF'];
                state.duoType = stats[Math.floor(Math.random() * stats.length)];
            } else {
                result = faces[Math.floor(Math.random() * faces.length)];
                state.duoType = null;
            }

            state.dieResult = result;
            state.turnPhase = 'SELECT';
            state.selections = {}; // Reset selections

            io.to(room.id).emit('state_update', { state });
        }

        if (action === 'select_card') {
            if (state.turnPhase !== 'SELECT') return;

            // Payload is the card ID(s)
            state.selections[socket.id] = payload;

            // Check if both players have selected
            if (Object.keys(state.selections).length === 2) {
                state.turnPhase = 'REVEAL';
                io.to(room.id).emit('state_update', { state });

                // Resolve after a delay
                setTimeout(() => {
                    resolveRound(room);
                }, 2000);
            } else {
                // Notify that this player is ready
                io.to(room.id).emit('state_update', { state });
            }
        }
    });

    socket.on('get_state', () => {
        const player = players[socket.id];
        if (player && player.roomId && rooms[player.roomId]) {
            const room = rooms[player.roomId];
            socket.emit('state_update', { state: room.state });
        }
    });

    // Player indicated they want to play again after match over
    socket.on('play_again', () => {
        const player = players[socket.id];
        if (!player || !player.roomId) return;
        const room = rooms[player.roomId];
        if (!room || !room.state) return;

        room.state.playAgain = room.state.playAgain || {};
        room.state.playAgain[socket.id] = true;

        io.to(room.id).emit('state_update', { state: room.state });

        // If both players signalled play again, queue a rematch with a short countdown
        const playerIds = room.players.map(p => p.id);
        const bothReady = playerIds.every(id => !!room.state.playAgain[id]);
        if (bothReady) {
            const countdown = 3; // seconds until rematch starts
            room.state.rematchQueued = true;
            room.state.rematchCountdown = countdown;

            // Notify clients that rematch is queued
            io.to(room.id).emit('state_update', { state: room.state });
            io.to(room.id).emit('rematch_queued', { countdown });

            // After countdown, reset playAgain markers and start a fresh game
            setTimeout(() => {
                room.state.playAgain = {};
                room.state.rematchQueued = false;
                room.state.rematchCountdown = 0;
                startGame(room);
            }, countdown * 1000);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const player = players[socket.id];

        if (player) {
            // Remove from queue if present
            const queueIndex = matchmakingQueue.indexOf(socket.id);
            if (queueIndex !== -1) {
                matchmakingQueue.splice(queueIndex, 1);
            }

            // Handle room leaving
            if (player.roomId && rooms[player.roomId]) {
                const room = rooms[player.roomId];
                io.to(player.roomId).emit('player_left', { playerId: socket.id });
                delete rooms[player.roomId];
            }

            delete players[socket.id];
        }
    });
});

// Helper Functions
function createMatch(p1, p2) {
    const roomId = uuidv4();
    const room = {
        id: roomId,
        players: [p1, p2],
        state: null, // Will be set in startGame
        isPrivate: false,
        mode: p1.desiredMode || 'STANDARD'
    };
    rooms[roomId] = room;

    p1.roomId = roomId;
    p2.roomId = roomId;

    // Ensure the underlying socket instances join the room so broadcasts to the
    // room (io.to(roomId).emit) reach them. For private rooms we join when
    // creating/joining; for matchmaking we must join programmatically here.
    const socket1 = io.sockets.sockets.get(p1.id);
    const socket2 = io.sockets.sockets.get(p2.id);
    if (socket1) socket1.join(roomId);
    if (socket2) socket2.join(roomId);

    if (socket1) console.log(`[pid ${process.pid}] socket ${p1.id} joined room ${roomId}`);
    if (socket2) console.log(`[pid ${process.pid}] socket ${p2.id} joined room ${roomId}`);

    // Notify room (both players)
    io.to(roomId).emit('matched', { roomId, players: room.players });

    // Give clients a short moment to register their match handlers
    setTimeout(() => startGame(room), 300);
    console.log(`Match created: ${roomId} between ${p1.username} and ${p2.username}`);
}

function startGame(room) {
    const p1 = room.players[0];
    const p2 = room.players[1];
    const p1Hand = generatePack(5);
    const p2Hand = generatePack(5);

    room.state = {
        status: 'playing',
        turnPhase: 'ROLL',
        round: 1,
        scores: { [p1.id]: 0, [p2.id]: 0 },
        hands: { [p1.id]: p1Hand, [p2.id]: p2Hand },
        currentTurn: p1.id, // Player 1 starts
        dieResult: null,
        duoType: null,
        selections: {},
        roundWinner: null
    };

    // Include the room's mode and id in the initial payload so clients know the mode
    console.log(`[pid ${process.pid}] Emitting game_start to room ${room.id} (expected players: ${room.players.map(p => p.id).join(',')}) mode=${room.mode}`);
    // List actual sockets in the room
    io.in(room.id).allSockets().then((sockets) => {
        console.log(`[pid ${process.pid}] Actual sockets in room ${room.id}:`, Array.from(sockets));
        io.to(room.id).emit('game_start', { state: room.state, roomId: room.id, gameMode: room.mode || 'STANDARD' });
    }).catch(err => {
        console.error(`[pid ${process.pid}] Error listing sockets in room ${room.id}:`, err);
        io.to(room.id).emit('game_start', { state: room.state, roomId: room.id, gameMode: room.mode || 'STANDARD' });
    });
}

function resolveRound(room) {
    const { state } = room;
    const p1Id = room.players[0].id;
    const p2Id = room.players[1].id;

    const p1Sel = state.selections[p1Id];
    const p2Sel = state.selections[p2Id];

    // Helper to get card object from hand
    const getCard = (playerId, cardId) => state.hands[playerId].find(c => c.id === cardId);

    let p1Val = 0;
    let p2Val = 0;

    if (state.dieResult === 'DUO') {
        // Expecting array of 2 IDs
        const c1a = getCard(p1Id, p1Sel[0]);
        const c1b = getCard(p1Id, p1Sel[1]);
        const c2a = getCard(p2Id, p2Sel[0]);
        const c2b = getCard(p2Id, p2Sel[1]);

        if (c1a && c1b && c1a.stats && c1b.stats) p1Val = (c1a.stats[state.duoType] || 0) + (c1b.stats[state.duoType] || 0);
        if (c2a && c2b && c2a.stats && c2b.stats) p2Val = (c2a.stats[state.duoType] || 0) + (c2b.stats[state.duoType] || 0);
    } else {
        const c1 = getCard(p1Id, p1Sel);
        const c2 = getCard(p2Id, p2Sel);

        if (c1 && c1.stats) p1Val = c1.stats[state.dieResult] || 0;
        if (c2 && c2.stats) p2Val = c2.stats[state.dieResult] || 0;
    }

    let winner = 'DRAW';
    if (p1Val > p2Val) {
        winner = p1Id;
        state.scores[p1Id]++;
    } else if (p2Val > p1Val) {
        winner = p2Id;
        state.scores[p2Id]++;
    }

    state.roundWinner = winner;
    state.turnPhase = 'RESOLVE';
    io.to(room.id).emit('state_update', { state });

    // Next Round after delay
    setTimeout(() => {
        nextRound(room);
    }, 3000);
}

function nextRound(room) {
    const { state } = room;

    // Remove played cards
    Object.keys(state.selections).forEach(playerId => {
        const selection = state.selections[playerId];
        if (Array.isArray(selection)) {
            state.hands[playerId] = state.hands[playerId].filter(c => !selection.includes(c.id));
        } else {
            state.hands[playerId] = state.hands[playerId].filter(c => c.id !== selection);
        }
    });

    // Check Game Over (Empty Hands)
    const anyHandEmpty = Object.values(state.hands).some(h => h.length === 0);

    if (anyHandEmpty) {
        state.turnPhase = 'MATCH_OVER';
    } else {
        state.round++;
        state.turnPhase = 'ROLL';
        state.dieResult = null;
        state.duoType = null;
        state.selections = {};
        state.roundWinner = null;

        // Alternate turn
        const currentIdx = room.players.findIndex(p => p.id === state.currentTurn);
        state.currentTurn = room.players[(currentIdx + 1) % 2].id;
    }

    io.to(room.id).emit('state_update', { state });
}

// Start server on a port that's actually available. This avoids calling
// `server.listen` multiple times on the same server instance which can
// cause confusing mixed success/error events (IPv4 vs IPv6 binds etc.).
const net = require('net');

const DEFAULT_PORT = Number(process.env.PORT) || 3000;

function checkPortFree(port, timeout = 200) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', (err) => {
                tester.close?.();
                resolve(false);
            })
            .once('listening', () => {
                tester.close(() => resolve(true));
            });

        tester.listen({ port, host: '::' }, () => { });

        // fallback timeout
        setTimeout(() => {
            try { tester.close(); } catch (e) { }
            resolve(false);
        }, timeout + 100);
    });
}

async function startServerOnAvailablePort(start = DEFAULT_PORT, maxTries = 10) {
    let port = start;
    for (let i = 0; i < maxTries; i++) {
        /* eslint-disable no-await-in-loop */
        const free = await checkPortFree(port);
        if (free) {
            server.listen(port, () => {
                console.log(`[pid ${process.pid}] Server running on port ${port}`);
            });
            return;
        }
        console.warn(`[pid ${process.pid}] Port ${port} in use — trying ${port + 1} (retries left: ${maxTries - i - 1})`);
        port += 1;
    }
    console.error(`[pid ${process.pid}] No available ports found in range ${start}-${start + maxTries - 1}. Exiting.`);
    process.exit(1);
}

startServerOnAvailablePort(DEFAULT_PORT, 10).catch((err) => {
    console.error(`[pid ${process.pid}] Failed to start server:`, err);
    process.exit(1);
});
