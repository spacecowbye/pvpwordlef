import { Logger } from "../utils/logger.js"
import { addToAnonMatchmakingQueue } from "../services/matchmakingService.js";
import  userService  from "../services/userService.js";


const filepath = import.meta.url;
const logger = new Logger(filepath);


export const registerSocketHandlers = (io) => {
    
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