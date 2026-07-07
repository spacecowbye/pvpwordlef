import { Logger } from "../utils/logger.js"
import roomManager from "../game/roomManager.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const filename = import.meta.url; 
const logger = new Logger(filename);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const gameController = async(req,res) => {

    const room_id = req.params?.room_id ; 
    if(!room_id){
        return res.status(400).json({
            ok : false,
            msg : "Improper Room Id"
        })
    }
    logger.info(`A new duel started on ${room_id}`);

    //if(roomManager.verifyRoomExists())    
    return res.status(200).json({
        "success" : true,
        "data" : "hello World"
    });
}

export const serveDuelUI = (req, res) => {
    const duelPath = path.join(__dirname, "../../public/duel.html");
    logger.info(`Serving duel.html file to client`);
    res.sendFile(duelPath);
};