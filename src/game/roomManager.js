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
        
        this.userIdToRoomMapping = new Map();
        this.roomIdToRoomMapping = new Map();
        //called after first duel:anon:joinRoom occurs
        this.roomIdToGameManagerMapping = new Map();
        
        
    }

    //verify service
    verifyPayloadForRoomAndUser(room_id,user_id){
        
    }
    createRoom(playerA,playerB){
        //creats room object on index page
        logger.info(playerA);

        const players = [playerA, playerB];

        const room_id = this.generateUniqueRoomId();
        const room = new Room(room_id,players);
        const gameManager = new GameManager(room_id);


        // set room manager maps here
        this.roomIdToRoomMapping.set(room_id,room);
        this.roomIdToGameManagerMapping.set(room_id,gameManager);
        this.userIdToRoomMapping.set(playerA.user_id,room_id);
        this.userIdToRoomMapping.set(playerB.user_id,room_id);
        
        logger.info(`RoomManager : userIdToRoomMapping`);
        logger.info(Object.fromEntries(this.userIdToRoomMapping));
        
        
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
    //todo move this function into room object
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
            
        }while(this.roomIdToRoomMapping.has(room_id))
        return room_id ; 
    }
    getRoomSize(room_id){
        // room_id passed here is trusted and verified to be real.
        // otherwise it wouldnt reach this stage
        let room = this.roomIdToRoomMapping.get(room_id);
        return room.players.length;
    }
    addPlayerToRoom(room_id,user_id){
        // room_id is trused and verified here, user_id is expected to be in this room.
        let room = this.roomIdToRoomMapping.get(room_id);
        logger.info(`Attemping to add ${user_id} to ${room_id}`);
        if(room.size < 2 && !room.players.includes(user_id)){
            
            room.players.push(user_id);
            room.size += 1
            logger.info(room);
        }
        else{
            logger.warn(`Something bad happened while adding ${user_id} to ${room_id}`);
            process.exit(1);
        }

    }
    getRoom(room_id){

        if(this.roomIdToRoomMapping.has(room_id)){
            logger.info(`Fetching room object for ${room_id}`);
            return this.roomIdToRoomMapping.get(room_id);
        }
        else{
            logger.warn(`No such room found on the server`);
            return null;
        }
    }
    // getGameManagerForRoomId(room_id){
    //     const gameManager = this.roomIdToGameManagerMapping.get(room_id);
    //     if(!gameManager){
    //         //create new game manager and return that
    //         logger.info(`No Game manager found`)
    //         logger.info(`First player has entered the room`);
    //         const gameManager = new GameManager(room_id);
    //         logger.info(`Created the gameManager for ${room_id}`);
    //         this.roomIdToGameManagerMapping.set(room_id,gameManager);
    //         logger.info(`Mapped the gameManager object ${gameManager} to ${room_id}`);

    //         return gameManager;
    //     }
    //     logger.info(`The second player has joined the game`);
    //     logger.info(`Returning an existing gameManager`);
    //     return gameManager;
        
    // }
    //handle any random socket event, design the workflow for it 
    // the socket event will be of type duel:event:action and then accompanying in its payload
    // will be room_id and user_id
    //correct game Manager will be found and used to process the event

    handleDuelSocketEvent(payload){
        
    }
    handleJoinRoom(room_id , user_id, socket){
        // does room exist
        const room = this.getRoom(room_id);
        logger.info(`Room found for ${room_id} below`);
        console.log(room);
        const verifiedAnonymousUser = userService.verifyUser(user_id);
        const gameManager = this.roomIdToGameManagerMapping.get(room_id);

        if(!verifiedAnonymousUser){
            logger.info(`No pvpWordle for you`);
            //#TODO handle this return
        }

        if(!gameManager){
            logger.info(`No Game manager found for room_id ${room_id}`);
            //#TODO handle this return
        }
        if(!room){
                logger.warn(`No Room object found for ${room_id}`);
                return { msg : "NO_SUCH_ROOM_ON_SERVER"} ; 
        }
        const mappedRoom = roomManager.userIdToRoomMapping.get(user_id);
        console.log(`Before updating`);
        userService.userIdToSocketMap.set(user_id,socket);
        console.log(`After updating`);
        console.log(userService.userIdToSocketMap);
        
        const roomSize = this.getRoomSize(room_id);
        switch(roomSize){
            case 0: 
                logger.info(`${user_id} is the first person to join the room ${room_id}`);
                //verify player in room
                if(room_id === mappedRoom){
                    this.addPlayerToRoom(room_id,user_id);
                    gameManager.addPlayer(verifiedAnonymousUser);
                    socket.join(room_id);
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
                    this.addPlayerToRoom(room_id,user_id);
                    logger.info(`${user_id} has joined room ${room_id} as a player`);
                    gameManager.addPlayer(verifiedAnonymousUser);
                    socket.join(room_id);
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