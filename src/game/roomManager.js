import { Room } from "../classes/Room.js";
import userService from "../services/userService.js";
import { Logger } from "../utils/logger.js";
import { dumpToDebugFile, generateRoomId } from "../utils/randomUtils.js";
import gameManager from "./gameManager.js";

const filename = import.meta.url;
const logger = new Logger(filename);

class RoomManager{
    constructor(){
        // A set of room Ids,a set of strings not a set of rooms
        //also these room Ids are the socket.io room names
        
        this.userIdToRoomMapping = new Map();
        this.roomIdToRoomMapping = new Map();
    }

    //verify service
    verifyRoom(client_room_id){
        // cant trust room_id here, provided by client
        return this.roomIdToRoomMapping.has(client_room_id) ? client_room_id : false
    }
    verifyUser(client_user_id){
        return this.userIdToRoomMapping.has(client_user_id) ? client_user_id : false
    }
    verifyUserInRoom(client_room_id,client_user_id){
        return this.userIdToRoomMapping.get(client_user_id) === client_room_id ;
    }
    createRoom(playerA,playerB){
        //creats room object on index page
        logger.info(playerA);

        const players = [playerA, playerB];

        const room_id = this.generateUniqueRoomId();
        const room = new Room(room_id,players);

        // set room manager maps here
        this.roomIdToRoomMapping.set(room_id,room);
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
        return room.size;
    }
   addPlayerToRoom(room_id, anonymousUserObject) {
    //room_id has been verified to true here
    const room = this.roomIdToRoomMapping.get(room_id);
    if (!room) {
        logger.error(`Room ${room_id} not found`);
    }

    const current_user_id = anonymousUserObject.user_id;
    logger.info(`Attempting to add ${current_user_id} to ${room_id}`);

    // Check if the player already exists in the room
    const isDuplicate = room.players.some(player => player.user_id === current_user_id);
    if (isDuplicate) {
        logger.error(`Cannot join your own game ${current_user_id}`);
        // #todo handle this later so that opening in new tab does not consider you as seperate player.
        process.exit(1);
    }

    // Check if room is already full (max 2 players)
    if (room.players.length >= 2) {
        logger.warn(`Room ${room_id} is full`);

    }

    // Add the player safely
    room.players.push(anonymousUserObject);
    room.size = room.players.length;

    console.log(room);
    }


    handleDuelSocketEvent(room_id,user_id,attemptedGuess){
        //room_id , user_id have already been verified to exist on server.    
        return;        
    }
    handleJoinRoom(room_id , user_id, socket){
        // does room exist
        const room = this.roomIdToRoomMapping.get(room_id);
        
        if(!room){
                logger.warn(`No Room object found for ${room_id}`);
                return { msg : "NO_SUCH_ROOM_ON_SERVER"} ; 
        }
        const verified_room_id = room.room_id ; 
        const verifiedAnonymousUser = userService.verifyUser(user_id);
        if(!verifiedAnonymousUser){
            logger.warn(`No pvpWordle for you`);
            //#TODO handle this return
        }

        const mappedRoom = roomManager.userIdToRoomMapping.get(user_id);
        userService.userIdToSocketMap.set(user_id,socket);
        
        const roomSize = this.getRoomSize(verified_room_id);
        console.log(`Room size = ${roomSize}`);
        switch(roomSize){
            case 0: 
                logger.info(`${user_id} is the first person to join the room ${verified_room_id}`);
                //verify player in room
                if(room_id === mappedRoom){
                    this.addPlayerToRoom(verified_room_id,verifiedAnonymousUser);
                    socket.join(room_id);
                    logger.info(`${user_id} has joined room ${verified_room_id} as a player`);
                    return  { msg : "READY_PLAYER_ONE"};
                }
                else{
                    return { msg : "USER_NOT_EXPECTED" };
                }
                break;
            case 1:
                logger.info(`${user_id} is the second person to join the room ${verified_room_id}`);
                if(verified_room_id === mappedRoom){
                    this.addPlayerToRoom(verified_room_id,verifiedAnonymousUser);
                    logger.info(`${user_id} has joined room ${room_id} as a player`);
                    socket.join(verified_room_id);
                    gameManager.startGame(room);
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
            default:
                logger.warn(`something broker here`);
                break;

        }
            
    }
}


const roomManager = new RoomManager();
export default roomManager;