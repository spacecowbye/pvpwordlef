import { Room } from "../classes/Room.js";
import userService from "../services/userService.js";
import { Logger } from "../utils/logger.js";
import { dumpToDebugFile, generateRoomId } from "../utils/randomUtils.js";

const filename = import.meta.url;
const logger = new Logger(filename);


class RoomManager{
    constructor(){
        // A set of room Ids,a set of strings not a set of rooms
        //also these room Ids are the socket.io room names
        this.ActiveRooms = new Map();
        this.PlayerToRoomMapping = new Map();
        // mapping of room name to room object
        
    }
    // actually creates a socket.io room and joins both the sockets into that room 
    createRoom(playerA,playerB){
        // no need for sockets now? why am i storing socketss?
        console.log(`no need to store sockets`);
        console.log(playerA);
        console.log(playerB);

        const players = [playerA, playerB];

        const room_id = this.generateUniqueRoomId();
        const room = new Room(room_id,players);
        
        
        this.ActiveRooms.set(room_id,room);
        console.log(this.ActiveRooms);
        logger.info(`Both the player Sockets for Room ${room_id} have joined the equivalant room in socket.io`);
        // const gameManager = new GameManager();
        return room;
    }
    
    getRoomPayloadForClient(room){
        const room_id = room.room_id ; 
        const players = [room.players[0].user_id , room.players[1].user_id];

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
            return null;
        }
    }

}


const roomManager = new RoomManager();
export default roomManager;


