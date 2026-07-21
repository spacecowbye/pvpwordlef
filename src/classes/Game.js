import { Logger } from "../utils/logger.js";

import { getRandomWordforWordle } from "../utils/gameUtils.js";
const filename = import.meta.url ;
const logger = new Logger(filename);

export class Game{
    // this is the entire game state by itself

    
    constructor(room_id,playerA,playerB){

        logger.info(`Creating a new game Object`);
        this.WORLE_ANSWER = getRandomWordforWordle()
        this.players = [playerA,playerB];
        this.playerA
        this.room_id = room_id;
        logger.info(`[WORDLE] For room_id ${room_id} the answer words is ${this.WORLE_ANSWER}`);
    }
}
