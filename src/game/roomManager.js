import { Room } from "../classes/Room.js";
import userService from "../services/userService.js";
import { Logger } from "../utils/logger.js";
import { dumpToDebugFile, generateRoomId } from "../utils/randomUtils.js";
import { GameManager } from "./gameManager.js";

const filename = import.meta.url;
const logger = new Logger(filename);

class RoomManager{
    constructor(){
        // A set of room Ids,a set of strings not a set of rooms
        //also these room Ids are the socket.io room names
        this.ActiveRooms = new Map();
        this.userIdToRoomMapping = new Map();

        //called after first duel:anon:joinRoom occurs
        this.roomIdToGameManagerMapping = new Map();
        
        
    }
    createRoom(playerA,playerB){
        // no need for sockets now? why am i storing socketss?
        logger.info(playerA);

        const players = [playerA, playerB];

        const room_id = this.generateUniqueRoomId();
        const room = new Room(room_id,players);
        

        // set room manager maps here
        this.ActiveRooms.set(room_id,room);
        this.userIdToRoomMapping.set(playerA.user_id,room_id);
        this.userIdToRoomMapping.set(playerB.user_id,room_id);
        
        logger.info(`RoomManager : userIdToRoomMapping`);
        logger.info(Object.fromEntries(this.userIdToRoomMapping));
        
        logger.info(`RoomManager : ActiveRooms`);
        logger.info(Object.fromEntries(this.ActiveRooms));

        return room;
    }
    
    getRoomPayloadForClient(room){
        const room_id = room.room_id ; 
        const players = [room.expectedPlayers[0].user_id , room.expectedPlayers[1].user_id];
        return {
            room_id,
            players
        }
    }
    generateUniqueRoomId(){
        let attempts = 0;
        let room_id = "";

        //generates a room_id,makes sure its not already existing.

        do{
            room_id = generateRoomId();
            attempts+=1;
            if(attempts > 100){
                
                logger.error(`Too many collisions happened while attempting to generate a unique room id`);
                logger.error(`Increase the room_id length idiot`);
                process.exit(1)
                return;
            }
            
        }while(this.ActiveRooms.has(room_id))
        return room_id ; 
    }
    getRoom(room_id){

        if(this.ActiveRooms.has(room_id)){
            logger.info(`Fetching room object for ${room_id}`);
            return this.ActiveRooms.get(room_id);
        }
        else{
            logger.warn(`No such room found on the server`);
            return null;
        }
    }
    getGameManagerForRoomId(room_id){
        const gameManager = this.roomIdToGameManagerMapping.get(room_id);
        if(!gameManager){
            //create new game manager and return that
            logger.info(`No Game manager found`)
            logger.info(`First player has entered the room`);
            const gameManager = new GameManager(room_id);
            logger.info(`Created the gameManager for ${room_id}`);
            this.roomIdToGameManagerMapping.set(room_id,gameManager);
            logger.info(`Mapped the gameManager object ${gameManager} to ${room_id}`);

            return gameManager;
        }
        logger.info(`The second player has joined the game`);
        logger.info(`Returning an existing gameManager`);
        return gameManager;
        
    }
    //handle any random socket event, design the workflow for it 
    // the socket event will be of type duel:event:action and then accompanying in its payload
    // will be room_id and user_id
    //correct game Manager will be found and used to process the event

    handleDuelSocketEvent(payload){

    }
    handleJoinRoom(room_id , user_id){
        // does room exist
        const room = this.getRoom(room_id);
        if(!room){
                logger.warn(`No Room object found for ${room_id}`);
                return { msg : "NO_SUCH_ROOM_ON_SERVER"} ; 
        }
        const mappedRoom = roomManager.userIdToRoomMapping.get(user_id);
        switch(room.getRoomSize()){
            case 0: 
                logger.info(`${user_id} is the first person to join the room ${room_id}`);
                //verify player in room
                if(room_id === mappedRoom){
                    room.addPlayer(user_id);
                    logger.info(`${user_id} has joined room ${room_id} as a player`);
                    return  { msg : "READY_PLAYER_ONE"};
                }
                else{
                    return { msg : "USER_NOT_EXPECTED" };
                }
                break;
            case 1:
                logger.info(`${user_id} is the second person to join the room ${room_id}`);
                if(room_id === mappedRoom){
                    room.addPlayer(user_id);
                    logger.info(`${user_id} has joined room ${room_id} as a player`);
                    const gameManager = this.getGameManagerForRoomId(room_id);
                    return { msg :"READY_PLAYER_TWO" };
                }
                else{
                    return  { msg : "USER_NOT_EXPECTED" } ;
                }
                break;
            case 2:
                logger.warn(`Somebody tried to join an already full room ${room_id}`);
                return { msg : "ROOM_IS_FULL" } ;
                break;   
        }
            
    }
}


const roomManager = new RoomManager();
export default roomManager;