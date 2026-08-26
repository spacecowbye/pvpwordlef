import { Game } from "../classes/Game.js";
import { Logger } from "../utils/logger.js";

const filename = import.meta.url;
const logger = new Logger(filename);


// GameManager is like Room Manager should be all knowing and single instance only,
// get game data, manipulate it save it and send to consumers

class GameManager{

    constructor(){
        logger.info(`Initialsing Game Manager service`);
        //stores mapping of room_id to game state
        this.roomIdToGameStateMap = new Map();
    }
    //input is room object
    startGame(Room){
        const gameState = new Game(Room);
    } 
}

const gameManager = new GameManager();
export default gameManager;

