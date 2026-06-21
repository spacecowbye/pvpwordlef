import { Logger } from "./utils/logger.js";


const filename = import.meta.url;
const logger = new Logger(filename);


class RoomManager{
    constructor(){
        // A set of rooms
        this.rooms = new Set();
        
        // mapping of room name to room object
        

        //
    }
    findRoom(room_id){

    }
}


const roomManager = new RoomManager();
export default roomManager;