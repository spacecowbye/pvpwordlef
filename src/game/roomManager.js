import { Room } from "../classes/Room.js";
import { Logger } from "../utils/logger.js";
import { dumpToDebugFile, generateRoomId } from "../utils/randomUtils.js";

const filename = import.meta.url;
const logger = new Logger(filename);


class RoomManager{
    constructor(){
        // A set of room Ids,a set of strings not a set of rooms
        //also these room Ids are the socket.io room names
        this.ActiveRoomIds = new Set();
        this.playerToRoomMapping = new Map();
        // mapping of room name to room object
        

        //
    }
    // actually creates a socket.io room and joins both the sockets into that room
    createRoom(playerA,playerB){
        const socketA = playerA.socket;
        const socketB = playerB.socket;

        const players = [playerA, playerB];

        const room_id = this.generateUniqueRoomId();
        const room = new Room(room_id,players);

        // make the sockets join the same room
        socketA.join(room_id);
        socketB.join(room_id);

        //verify both clients are connected to the same room
        const roomMembersSetA = socketA.adapter.rooms.get(room_id);
        if( !roomMembersSetA.has(playerB.user_id) ) {
            logger.warn(`Something went wrong with connecting clients to the same room`);
            process.exit(1);
        }
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
            logger.info(room_id)
            attempts+=1;
            if(attempts > 100){
                
                logger.error(`Too many collisions happened while attempting to generate a unique room id`);
                logger.error(`Increase the room_id length idiot`);
                process.exit(1)
                return;
            }
            
        }while(this.ActiveRoomIds.has(room_id))
        this.ActiveRoomIds.add(room_id);
        return room_id ; 
    }
}


const roomManager = new RoomManager();
export default roomManager;

roomManager.generateUniqueRoomId()

