import { Game } from "../classes/Game.js";
import { Logger } from "../utils/logger.js";
import { evaluateGuessAgainstAnswer, isGuessValid, } from "../utils/gameUtils.js";
import { EventEmitter } from "node:events";



export const gameManagerEvents = new EventEmitter();
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

    evaluate(room_id,user_id, cleaned_guess)
    {
        //TODO room_id has been verified before it reaches here??
        // user_id has been verified and does exist in the system.
        //cleaned_guess is verified to be real and lowercased and trimmed.
        try{
            const gameState = this.roomIdToGameStateMap.get(room_id);
            if(!gameState || gameState.room_status === "FINISHED"){
                return new Error("No such Game on server");
            }
        
            const playerList = gameState.players.filter( element => user_id === element.user_id);
            const WORDLE_ANSWER = gameState.WORDLE_ANSWER
            
            //filter returns a jst list obv but we know there is a single player only
            const player = playerList[0];
            
            if(!player){
                throw new Error("No Such Player in Room");
            }
            // can player actually make a guess as per attempts or is game finished?
            console.log(player);
            console.log(`Player attempt count is : ${player.attemptCount}`);
            const attemptCount = Number(player.attemptCount);
            if( attemptCount < 6 ){
                logger.info(`Adding ${cleaned_guess} to ${user_id}'s attempt list`);
                player.attempts.push(cleaned_guess);
                player.attemptCount = player.attempts.length;
                logger.info(gameState);
                const guessResult =  evaluateGuessAgainstAnswer(cleaned_guess,WORDLE_ANSWER);
                let guessResultMetadata = {};
                guessResultMetadata["user_id"] = user_id;
                guessResultMetadata["room_id"] = room_id;
                guessResultMetadata["guess_result"] = guessResult;
                gameManagerEvents.emit(`duel:anon:guess_result`,guessResultMetadata);
                return ;

            }
            else{
                logger.error(`Exceeded attempt count`);
                return;
            }
        }
        catch ( err ){
            logger.warn(`Something very bad happened here`);
            console.log(err);
            gameManagerEvents.emit(`duel:anon:UNEXPECED_BEHAVIOIR`);    
        }
       

    }   
        
    //input is room object
    startGame(Room){
        logger.info(`Starting game for room_id ${Room.room_id}`);
        const gameState = new Game(Room);
        this.roomIdToGameStateMap.set(Room.room_id,gameState);
        // todo start timers
        // todo send ui event start game
    }
    processEvent(room_id,user_id,attemptedGuess){
        // all 3 arguements have been verified before reaching this state
        if(!room_id || !user_id || !attemptedGuess){
            logger.warn(`Something went wrong here`);
            process.exit(1);
        }
        
        const cleaned_guess = attemptedGuess.trim().toLowerCase();
        //validate the guess
        const isValidGuess = isGuessValid(attemptedGuess);

        if(!isValidGuess){
            logger.warn(`Despite client side validation somebody made an invalid guess`);
            gameManagerEvents.emit(`duel:anon:invalidGuess`)
            return ;
        }
        logger.info(`Attempted guess by ${user_id}: "${cleaned_guess}" is valid`);

        //fetching game object stored for room_id
        logger.info(`Calling evauluate function in game Manager`);
        
        //modifys the game state object directly in memory
        this.evaluate(room_id,user_id,cleaned_guess); 

    }
}

const gameManager = new GameManager();
export default gameManager;

