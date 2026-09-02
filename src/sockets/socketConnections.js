import { Logger } from "../utils/logger.js"
import { addToAnonMatchmakingQueue } from "../services/matchmakingService.js";
import  userService  from "../services/userService.js";
import { matchmakingEvents } from "../services/matchmakingService.js";
import roomManager from "../game/roomManager.js";
import { gameManagerEvents } from "../game/gameManager.js";


// TODO -> flow should be event recieved here, triggers and event to go to roomManager.js api


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

    // handle all future gameManagerEvents here
    gameManagerEvents.on(`duel:anon:guess_result`,(payload) => {

        //below user_id,room_id have been verified server-side    
        const {user_id, room_id ,playerGuessResult,oppGuessResult } = payload;    
        const room_obj = roomManager.roomIdToRoomMapping.get(room_id);
        const opp_user_object_list = room_obj.players.filter((el) => el.user_id !== user_id);
        const opp_user_object = opp_user_object_list[0];
        const opp_user_id = opp_user_object.user_id ; 
        logger.info(`${opp_user_id} is the opponent for ${user_id} in room ${room_id}`);
        
        const socketPlayer = userService.userIdToSocketMap.get(user_id);
        const socketOpponent = userService.userIdToSocketMap.get(opp_user_id);
        
        //gives back a list with two elements
         
        socketPlayer.emit(`duel:anon:guess_result`,playerGuessResult);
        socketOpponent.emit(`duel:anon:guess_result`,oppGuessResult);
    });

    io.on("connection",(socket) => {
        logger.info(`A new connection recieved from socket ${socket.id} `)
        
        socket.on("duel:anon:joinRoom",(payload) => {
            logger.info(`Somebody wants to join a duel`);
            const {room_id , user_id } = payload; 
            let verified_room_id = roomManager.verifyRoom(room_id);
            if(!verified_room_id){
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return ;
            }
            let verified_user_id = roomManager.verifyUser(user_id);
            if(!verified_user_id){
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return ;
            }
            const isRightUserInRightRoom = roomManager.verifyUserInRoom(room_id,user_id);
            if(!isRightUserInRightRoom){
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return ;
            }

            //todo verify room and user before passing them on.
            const { msg } = roomManager.handleJoinRoom(verified_room_id,verified_user_id, socket); 
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
            const {room_id , user_id , attemptedGuess } = payload; 
            let verified_room_id = roomManager.verifyRoom(room_id);
            if(!verified_room_id){
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return;
            }
            let verified_user_id = roomManager.verifyUser(user_id);
            if(!verified_user_id){
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return;
            }
            const isRightUserInRightRoom = roomManager.verifyUserInRoom(room_id,user_id);
            if(!isRightUserInRightRoom){
                socket.emit(`duel:anon:INVALID_ARGUEMENTS`);
                return;
            }
            roomManager.handleDuelSocketEvent(verified_room_id,verified_user_id,attemptedGuess);
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