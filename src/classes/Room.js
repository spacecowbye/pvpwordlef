import { Logger } from "../utils/logger.js";

export class Room {
    constructor(room_id, playersArray) {
        this.expectedPlayers = [playersArray[0], playersArray[1]];
        this.size = 0;
        this.players = []; // Stores active user_ids who called joinRoom
        this.room_id = room_id;
    }
}