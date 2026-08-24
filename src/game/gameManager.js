import { Game } from "../classes/Game.js";
import { Logger } from "../utils/logger.js";

const filename = import.meta.url;
const logger = new Logger(filename);


export class GameManager{
    
    room_id = "";
    gameState = null;
    

    constructor(room_id){
        logger.info(`Creating a new game Manager object for ${room_id}`);
        this.room_id = room_id;
    }  
    init(){
        // start the new game
        logger.info(`Initialising blank gameState for ${this.room_id}`);
        this.gameState = new Game(this.room_id,this.players[0],this.players[1]);
    }

    

}

