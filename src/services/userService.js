import { AnonymousPlayer } from "../classes/AnonymousClasses.js";
import { Logger } from "../utils/logger.js";
import crypto from "node:crypto";

const filename = import.meta.url;
const logger = new Logger(filename);

// this needs to be a singleton class,
// since this will be instantiated in seperate files,
//  one where data is set and one where data is get



class UserService {


    constructor(){
        //what i need to map is socket_id string to the socket object, so i can use that socket object.
        // maybe later i will intialise the user secret that we give to anonymous users here later.
        if (!this.instance){
            this.userToSocketMap = new Map();
            this.userIdToSocketIdMap = new Map();
            logger.info(`Initialised the User Service responsible for creating users...`);
            this.instance = this;
        }
        else{
            return this.instance
        }

    }
    
    generateUserIdForSocketId(socket){
        const user_id = crypto.randomUUID();
        this.userIdToSocketIdMap.set(user_id,socket.id);
        logger.info(`User ${user_id} has been mapped to his Socket ID ${socket.id}`);
        return user_id
    }
    createAnonymousPlayer(socket){
        console.log(socket);
        const user_id = this.generateUserIdForSocketId(socket);
        logger.info(`Mapping ${user_id} to its actual socket object`);
        this.userToSocketMap.set(user_id,socket);
        logger.info(this.userToSocketMap);
        logger.info(`Sucessfully mapped ${user_id} to its socket object`);
        logger.info(`Remember the Anonymous Player object's socket is still null, only mapping has been done`);
        return new AnonymousPlayer(user_id)
        
    }
    getSocketForAnonymousPlayer(user_id){
        try{
            logger.info(`Fetching the socket object for player ${user_id}`);
            const socket = this.userToSocketMap.get(user_id);
            return socket;
        }catch(err){
            logger.error(err);
            logger.error(`Something went wrong while trying to get socket object for ${user_id} `);
            process.exit(1);
        }
      
    }
}

const userService = new UserService();
export default userService;