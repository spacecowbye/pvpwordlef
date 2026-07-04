import { Logger } from "../utils/logger.js"
import roomManager from "../game/roomManager.js";


const filename = import.meta.url; 
const logger = new Logger(filename);

export const gameController = async(req,res) => {

    const {  }
    
    //if(roomManager.verifyRoomExists())    
    return res.status(200).json({
        "success" : true,
        "data" : "hello World"
    });
}

