import { Logger } from "../utils/logger.js"
import { addToAnonMatchmakingQueue } from "../services/matchmakingService.js";
import { AnonymousPlayer } from "../classes/AnonymousClasses.js";
const filepath = import.meta.url;
const logger = new Logger(filepath);



export const registerSocketHandlers = (io) => {
    
    io.on("connection",(socket) => {
        logger.info(`A new connection recieved from socket ${socket.id} `)

        socket.on("matchmaking:anon:join",async() => {
            logger.info(`A user wants to join the anonymous matchmaking queue with user_id : ${socket.id}`);
            const anonymousPlayer = new AnonymousPlayer(socket.id);
            await addToAnonMatchmakingQueue(anonymousPlayer);
            logger.info(`Successfully joined the anonymous matchmaking queue with user_id : ${socket.id}`);
        })
    })
}