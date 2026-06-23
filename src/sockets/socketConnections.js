import { Logger } from "../utils/logger.js"
import { addToAnonMatchmakingQueue } from "../services/matchmakingService.js";
import  userService  from "../services/userService.js";
import { matchmakingEvents } from "../services/matchmakingService.js";

const filepath = import.meta.url;
const logger = new Logger(filepath);


export const registerSocketHandlers = (io) => {
    
    matchmakingEvents.on("matchmaking:anon:queued",(payload) => {
        logger.info(`Sending confirmation to client ${payload.user_id} that they have been queued`);
        logger.info(payload);
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
            const user_id = socket.id ;
            const anonymousPlayer = userService.createAnonymousPlayer(user_id,socket);
            await addToAnonMatchmakingQueue(anonymousPlayer);
            logger.info(`Successfully joined the anonymous matchmaking queue with user_id : ${socket.id}`);
        })

        socket.on("disconnect",() => {
            logger.info(`${socket.id} has disconnected`);
        })

       
    })
}