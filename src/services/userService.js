import { AnonymousPlayer } from "../classes/AnonymousPlayer.js";
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
            this.userIdToSocketMap = new Map();
            this.userIdToAnonymousUserMap = new Map();
            logger.info(`Initialised the User Service responsible for creating users...`);
            this.instance = this;
        }
        else{
            return this.instance
        }

    }
    generateUserIdForSocketId(socket){
        const user_id = crypto.randomUUID();
        return user_id
    }
    createAnonymousPlayer(socket){
        const user_id = this.generateUserIdForSocketId(socket);
        logger.info(`Mapping ${user_id} to its actual socket object`);
        this.userIdToSocketMap.set(user_id,socket);
        logger.info(`Sucessfully mapped ${user_id} to its socket object`);
        const anonymousPlayer = new AnonymousPlayer(user_id);
        this.userIdToAnonymousUserMap.set(user_id,anonymousPlayer);
        return anonymousPlayer; 
    }
    getSocketForAnonymousPlayer(user_id){
        try{
            logger.info(`Fetching the socket object for player ${user_id}`);
            const socket = this.userIdToSocketMap.get(user_id);
            return socket;
        }catch(err){
            logger.error(err);
            logger.error(`Something went wrong while trying to get socket object for ${user_id} `);
            process.exit(1);
        }
      
    }
    verifyUser(user_id){
        if(this.userIdToAnonymousUserMap.get(user_id)){
            logger.info(`User ${user_id} exists and is verified by the server`);
            return this.userIdToAnonymousUserMap.get(user_id);
        }
        else{
            logger.warn(`No such user has been seen by the server`);
            return null;
        }
    }
    
}

const userService = new UserService();
export default userService;