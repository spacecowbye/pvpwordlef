import { Game } from "../classes/Game.js";
import { Logger } from "../utils/logger.js";

const filename = import.meta.url;
const logger = new Logger(filename);


export class GameManager{
    
    constructor(room_id){
        this.room_id = room_id;
        logger.info(`Creating a game manager for room_id ${room_id}`);
        this.gameState = new Game(room_id);
    }   

}