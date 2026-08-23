import { Logger } from "../utils/logger.js"
import { addToAnonMatchmakingQueue } from "../services/matchmakingService.js";
import  userService  from "../services/userService.js";
import { matchmakingEvents } from "../services/matchmakingService.js";
import roomManager from "../game/roomManager.js";

const filepath = import.meta.url;
const logger = new Logger(filepath);


export const registerSocketHandlers = (io) => {
    //socket middleware handling


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
                const { room_id,players } = payload;
                const user_id_playerA = players[0];
                const user_id_playerB = players[1];
                const socketA = userService.getSocketForAnonymousPlayer(user_id_playerA);
                const socketB = userService.getSocketForAnonymousPlayer(user_id_playerB);
                socketA.emit("matchmaking:anon:matched",room_id);
                socketB.emit("matchmaking:anon:matched",room_id);
    })
    io.on("connection",(socket) => {
        logger.info(`A new connection recieved from socket ${socket.id} `)
        
        socket.on("duel:anon:joinRoom",(payload) => {
            logger.info(`Somebody wants to join a duel`);
            logger.info(payload);
            const {room_id , user_id } = payload; 
            if(!room_id || !user_id){
                // todo handle this client side
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return;
            }
            //todo verify room and user before passing them on.
            const { msg } = roomManager.handleJoinRoom(room_id,user_id, socket); 
            switch(msg){
                case "NO_SUCH_ROOM_ON_SERVER":
                    logger.info(`Emitting event for NO_SUCH_ROOM_ON_SERVER`);
                    socket.emit(`duel:anon:NO_SUCH_ROOM`);
                    return;
                case "READY_PLAYER_ONE":
                    
                    socket.emit(`duel:anon:READY_PLAYER_ONE`);
                    return;
                case "READY_PLAYER_TWO":
                    io.to(room_id).emit(`duel:anon:BEGIN_GAME`);
                    socket.emit(`duel:anon:ROOM_READY`);
                    return;
                case "USER_NOT_EXPECTED":
                    logger.error(`This should not have happened`);
                    logger.error(`How do we have a user verified by the mathchmaking service but unknow here`);
                    socket.emit(`duel:anon:USER_NOT_EXPECTED`);
                    return;
                case "ROOM_IS_FULL":
                    socket.emit(`duel:anon:IMPROPER_CONDUCT_LAD`);
                    logger.warn(`Somebody tried to join an already full room ${room_id}`);
                    return;                    
            }

        })
        socket.on("duel:anon:SUBMIT_GUESS",(payload) => {
            logger.info(payload);
        })
        
        socket.on("matchmaking:anon:join",async() => {    
            const anonymousPlayer = userService.createAnonymousPlayer(socket);
            await addToAnonMatchmakingQueue(anonymousPlayer);
            logger.info(`Successfully joined the anonymous matchmaking queue with user_id : ${anonymousPlayer.user_id}`);
        })

        socket.on("disconnect",(reason) => {
            // #TODO 
            // if a queued socket is disconnected then remove it from the matchmaking queuue, remove it from socket mapping
            logger.info(`Socket ${socket.id} has disconnected. Reason: ${reason}`);
        })

       
    })
}