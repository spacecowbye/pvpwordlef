import { Logger } from "../utils/logger.js";

const filename = import.meta.url;
const logger = new Logger(filename);

export const RoomStatus = Object.freeze({
    WAITING: "WAITING",          
    ACTIVE: "ACTIVE",           
    FINISHED: "FINISHED"        
});

export class Room {
    constructor(room_id, playersArray) {
        this.expectedPlayers = [playersArray[0], playersArray[1]];
        this.players = []; // Stores active user_ids who called joinRoom
        this.room_id = room_id;
        this.status = RoomStatus.WAITING;
    }

    getRoomSize() {
        return this.players.length;
    }

    isRoomFull() {
        return this.players.length >= 2;
    }

    hasPlayer(user_id) {
        // Simple, clean array containment check for primitive strings
        return this.players.includes(user_id);
    }

    addPlayer(user_id) {
        if (!this.isRoomFull() && !this.hasPlayer(user_id)) {
            this.players.push(user_id);
            return true;
        }
        return false;
    }
}