import { Logger } from "../utils/logger.js";

import { getRandomWordforWordle } from "../utils/gameUtils.js";
const filename = import.meta.url ;
const logger = new Logger(filename);

// export class Room {
//     constructor(room_id, playersArray) {
//         this.expectedPlayers = [playersArray[0], playersArray[1]];
//         this.size = 0;
//         this.players = []; // Stores active user_ids who called joinRoom
//         this.room_id = room_id;
//     }
// }
export class Game{
    // this is the entire game state by itself

    
    // Room is an object here

    constructor(Room){
        logger.info(`Creating a new game Object from an existing Room object`);
        this.room_id = Room.room_id
        this.players = {
            
        }
        this.WORLE_ANSWER = getRandomWordforWordle()    
        this.players = {
            [ playerA.user_id ] : {
                attemptCount : 0,
                attempts : []
            },
            [ playerB.user_id ] : {
                attemptCount : 0,
                attempts : []
            }
        };
        this.room_id = room_id;
        logger.info(`[WORDLE] For room_id ${room_id} the answer words is ${this.WORLE_ANSWER}`);
        console.log(this);
    }
}
