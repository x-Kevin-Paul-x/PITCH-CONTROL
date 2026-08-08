import multiplayerEngine from './multiplayerEngine';

class SocketService {
    constructor() {
        this.engine = multiplayerEngine;
    }

    connect() {
        return this.engine;
    }

    disconnect() {
        // cleanup if needed
    }

    getSocket() {
        return this.engine;
    }

    joinLobby(username, desiredMode) {
        this.engine.joinLobby(username, desiredMode);
    }

    createPrivateRoom(username, desiredMode) {
        this.engine.createPrivateRoom(username, desiredMode);
    }

    joinPrivateRoom(username, roomId) {
        this.engine.joinPrivateRoom(username, roomId);
    }
}

const socketService = new SocketService();
export default socketService;
