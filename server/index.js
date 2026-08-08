const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { generatePack } = require('./utils/cardGenerator');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Server Health & Status Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        serverTime: new Date().toISOString(),
        activePlayers: Object.keys(players).length,
        activeRooms: Object.keys(rooms).length,
        queueLength: matchmakingQueue.length
    });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 30000,
    pingInterval: 10000,
    connectTimeout: 20000,
    transports: ['websocket', 'polling']
});

const PORT = Number(process.env.PORT) || 3000;

// In-Memory Game State
const players = {}; // socketId -> { id, username, roomId, desiredMode }
const rooms = {};   // roomId -> { id, players: [], state: {}, isPrivate: bool, mode: string }
const matchmakingQueue = [];

io.on('connection', (socket) => {
    console.log(`[+] Client connected: ${socket.id}`);

    // 1. Join Public Matchmaking Lobby
    socket.on('join_lobby', ({ username, desiredMode }) => {
        const cleanName = username ? username.trim() : 'Knight';
        console.log(`[Lobby] Player ${cleanName} (${socket.id}) queued for ${desiredMode || 'STANDARD'}`);

        players[socket.id] = {
            id: socket.id,
            username: cleanName,
            desiredMode: desiredMode || 'STANDARD',
            roomId: null
        };

        // Matchmaker pairing logic
        if (matchmakingQueue.length > 0) {
            const opponentId = matchmakingQueue.shift();
            const opponent = players[opponentId];

            if (opponent && opponent.id !== socket.id) {
                createMatch(opponent, players[socket.id]);
            } else {
                matchmakingQueue.push(socket.id);
            }
        } else {
            matchmakingQueue.push(socket.id);
        }
    });

    // 2. Create Private War Room
    socket.on('create_private_room', ({ username, desiredMode }) => {
        const cleanName = username ? username.trim() : 'Knight';
        const roomId = 'REALM-' + Math.floor(100 + Math.random() * 900);

        players[socket.id] = {
            id: socket.id,
            username: cleanName,
            desiredMode: desiredMode || 'STANDARD',
            roomId
        };

        const room = {
            id: roomId,
            players: [players[socket.id]],
            state: {
                status: 'waiting',
                turnPhase: 'WAITING'
            },
            isPrivate: true,
            mode: desiredMode || 'STANDARD'
        };
        rooms[roomId] = room;

        socket.join(roomId);
        socket.emit('room_created', { roomId });
        console.log(`[Private Room] Room ${roomId} created by ${cleanName}`);
    });

    // 3. Join Private War Room
    socket.on('join_private_room', ({ username, roomId }) => {
        const cleanCode = (roomId || '').trim().toUpperCase();
        const room = rooms[cleanCode];

        if (room && room.isPrivate && room.players.length < 2) {
            const cleanName = username ? username.trim() : 'Knight';

            players[socket.id] = {
                id: socket.id,
                username: cleanName,
                roomId: cleanCode
            };

            room.players.push(players[socket.id]);
            socket.join(cleanCode);

            const p1 = room.players[0];
            const p2 = room.players[1];

            io.to(p1.id).emit('matched', { roomId: cleanCode, players: room.players, opponent: p2 });
            io.to(p2.id).emit('matched', { roomId: cleanCode, players: room.players, opponent: p1 });

            setTimeout(() => startGame(room), 400);
            console.log(`[Private Room] Player ${cleanName} joined ${cleanCode}`);
        } else {
            socket.emit('room_error', { message: 'War Room not found or already full!' });
        }
    });

    // 4. Handle Real-Time Actions
    socket.on('player_action', ({ action, payload }) => {
        const player = players[socket.id];
        if (!player || !player.roomId) return;

        const room = rooms[player.roomId];
        if (!room || !room.state) return;

        const { state } = room;

        if (action === 'roll_die') {
            if (state.turnPhase !== 'ROLL') return;

            const faces = ['ATT', 'MID', 'DEF', 'GK'];
            const face = faces[Math.floor(Math.random() * faces.length)];

            state.dieResult = face;
            state.turnPhase = 'SELECT';
            state.selections = {};

            io.to(room.id).emit('state_update', { state });
        }

        if (action === 'select_card') {
            if (state.turnPhase !== 'SELECT') return;

            state.selections[socket.id] = payload;

            // When both players have selected cards
            if (Object.keys(state.selections).length >= 2) {
                state.turnPhase = 'REVEAL';
                io.to(room.id).emit('state_update', { state });

                setTimeout(() => resolveRound(room), 2200);
            } else {
                io.to(room.id).emit('state_update', { state });
            }
        }
    });

    // 5. Get Active State Hydration
    socket.on('get_state', () => {
        const player = players[socket.id];
        if (player && player.roomId && rooms[player.roomId]) {
            socket.emit('state_update', { state: rooms[player.roomId].state });
        }
    });

    // 6. Play Again Request
    socket.on('play_again', () => {
        const player = players[socket.id];
        if (!player || !player.roomId) return;
        const room = rooms[player.roomId];
        if (!room || !room.state) return;

        room.state.playAgain = room.state.playAgain || {};
        room.state.playAgain[socket.id] = true;

        io.to(room.id).emit('state_update', { state: room.state });

        const playerIds = room.players.map(p => p.id);
        const bothReady = playerIds.every(id => !!room.state.playAgain[id]);
        if (bothReady) {
            startGame(room);
        }
    });

    // 7. Disconnection Cleanup
    socket.on('disconnect', (reason) => {
        console.log(`[-] Client disconnected: ${socket.id} (Reason: ${reason})`);
        const player = players[socket.id];

        if (player) {
            const queueIndex = matchmakingQueue.indexOf(socket.id);
            if (queueIndex !== -1) {
                matchmakingQueue.splice(queueIndex, 1);
            }

            if (player.roomId && rooms[player.roomId]) {
                io.to(player.roomId).emit('player_left', { playerId: socket.id });
                delete rooms[player.roomId];
            }

            delete players[socket.id];
        }
    });
});

// Helper Functions
function createMatch(p1, p2) {
    const roomId = 'WAR-' + Math.floor(100 + Math.random() * 900);
    const room = {
        id: roomId,
        players: [p1, p2],
        state: null,
        isPrivate: false,
        mode: p1.desiredMode || 'STANDARD'
    };
    rooms[roomId] = room;

    p1.roomId = roomId;
    p2.roomId = roomId;

    const s1 = io.sockets.sockets.get(p1.id);
    const s2 = io.sockets.sockets.get(p2.id);
    if (s1) s1.join(roomId);
    if (s2) s2.join(roomId);

    io.to(roomId).emit('matched', { roomId, players: room.players });
    setTimeout(() => startGame(room), 350);
}

function startGame(room) {
    if (!room || room.players.length < 2) return;

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
        currentTurn: p1.id,
        dieResult: null,
        selections: {},
        roundWinner: null
    };

    io.to(room.id).emit('game_start', { state: room.state, roomId: room.id, gameMode: room.mode || 'STANDARD' });
}

function resolveRound(room) {
    if (!room || !room.state || room.players.length < 2) return;

    const { state } = room;
    const p1Id = room.players[0].id;
    const p2Id = room.players[1].id;

    const p1Sel = state.selections[p1Id];
    const p2Sel = state.selections[p2Id];

    const getCard = (playerId, cardId) => (state.hands[playerId] || []).find(c => c.id === cardId);

    const c1 = getCard(p1Id, p1Sel);
    const c2 = getCard(p2Id, p2Sel);

    let p1Val = c1 && c1.stats ? (c1.stats[(state.dieResult || 'ATT').toLowerCase()] || c1.rating) : 0;
    let p2Val = c2 && c2.stats ? (c2.stats[(state.dieResult || 'ATT').toLowerCase()] || c2.rating) : 0;

    let winner = null;
    if (p1Val > p2Val) {
        winner = p1Id;
        state.scores[p1Id] = (state.scores[p1Id] || 0) + 1;
    } else if (p2Val > p1Val) {
        winner = p2Id;
        state.scores[p2Id] = (state.scores[p2Id] || 0) + 1;
    }

    state.roundWinner = winner;
    state.turnPhase = 'REVEAL';
    io.to(room.id).emit('state_update', { state });

    setTimeout(() => nextRound(room), 2800);
}

function nextRound(room) {
    if (!room || !room.state) return;
    const { state } = room;

    Object.keys(state.selections || {}).forEach(playerId => {
        const selection = state.selections[playerId];
        if (state.hands[playerId]) {
            state.hands[playerId] = state.hands[playerId].filter(c => c.id !== selection);
        }
    });

    const anyEmpty = Object.values(state.hands).some(h => !h || h.length === 0);

    if (anyEmpty || state.round >= 5) {
        state.turnPhase = 'MATCH_OVER';
    } else {
        state.round++;
        state.turnPhase = 'ROLL';
        state.dieResult = null;
        state.selections = {};
        state.roundWinner = null;
    }

    io.to(room.id).emit('state_update', { state });
}

server.listen(PORT, () => {
    console.log(`[+] Production Pitch Control Server online on port ${PORT}`);
});
