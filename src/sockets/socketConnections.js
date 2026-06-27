import { Logger } from "../utils/logger.js"
import { addToAnonMatchmakingQueue } from "../services/matchmakingService.js";
import  userService  from "../services/userService.js";
import { matchmakingEvents } from "../services/matchmakingService.js";

const filepath = import.meta.url;
const logger = new Logger(filepath);


export const registerSocketHandlers = (io) => {
    
    matchmakingEvents.on("matchmaking:anon:queued",(payload) => {
        logger.info(`Sending confirmation to client ${payload.user_id} that they have been queued`);
        // missing socket.emit here
        const userSocket = userService.getSocketForAnonymousPlayer(payload.user_id);
        if(userSocket){
            userSocket.emit(`matchmaking:anon:queued`,payload);
        }
        else{
            // TODO Bad Path handling here
        }

    })

    matchmakingEvents.on("matchmaking:anon:match_found",(payload) => {
                logger.info(`Matchmaking Service has found a match`);
                logger.info(payload);
                const { room_id } = payload;
                io.to(room_id).emit("matchmaking:anon:matched",payload);
    })
    io.on("connection",(socket) => {
        logger.info(`A new connection recieved from socket ${socket.id} `)

        socket.on("matchmaking:anon:join",async() => {
            logger.info(`A user wants to join the anonymous matchmaking queue with user_id : ${socket.id}`);
            const anonymousPlayer = userService.createAnonymousPlayer(socket);
            await addToAnonMatchmakingQueue(anonymousPlayer);
            logger.info(`Successfully joined the anonymous matchmaking queue with user_id : ${socket.id}`);
        })

        socket.on("disconnect",() => {
            // #TODO 
            // if a queued socket is disconnected then remove it from the matchmaking queuue, remove it from socket mapping
            logger.info(`${socket.id} has disconnected`);
        })

       
    })
}