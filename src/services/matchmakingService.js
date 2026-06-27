import { Logger } from "../utils/logger.js";
import { Redis } from "ioredis";
import { EventEmitter } from "node:events";
import { getStringForRedis,getObjectFromRedisString } from "../utils/redisUtils.js";
import userService from "./userService.js";
import roomManager from "../game/roomManager.js";

const filename = import.meta.url;
const logger = new Logger(filename);
const redis = new Redis();
const ANONYMOUS_MATCHMAKING_QUEUE_KEY = "fANONYMOUS_MATCHMAKING_QUEUE";
const MATCHMAKING_WINDOW_SIZE = 100;
export const matchmakingEvents = new EventEmitter();

export const addToAnonMatchmakingQueue = async (anonymousPlayer) => {
    logger.info(`[ANONYMOUS Q] Attempting to add above User to the matchmaking Queue`);

    try{
        const timestamp = Date.now();
        const stringifiedAnonymousPlayer = getStringForRedis(anonymousPlayer);
        await redis.zadd(ANONYMOUS_MATCHMAKING_QUEUE_KEY,timestamp,stringifiedAnonymousPlayer);
        logger.info(`[ANONYMOUS Q]Succedded in putting the anonymous user in the matchmaking queue`);
        matchmakingEvents.emit("matchmaking:anon:queued",JSON.stringify(anonymousPlayer));
        
        
    }catch(err){
        logger.error(err);
        logger.error(`An error occured while trying to add the anonymous user to the redis queue`);
        process.exit(1);
    }
};

const runAnonymousMatchmaking = async() => {
    //Step 1 of matchmaking anonymously, is to find all the people in the queue.    
    const anonymousQueueMembers = await redis.zrange(ANONYMOUS_MATCHMAKING_QUEUE_KEY,
        0,
        MATCHMAKING_WINDOW_SIZE - 1,
        "WITHSCORES"
    )
    if(anonymousQueueMembers.length < 4){
        return;
    }
    console.log(anonymousQueueMembers);

    
    // now we have an array like [object1, score1, object2 , score2 ] so putting that its proper form
    let anonymousQueue = []
    for(let i = 0; i < anonymousQueueMembers.length ; i+=2){
        const rawString = anonymousQueueMembers[i];
        const anonymousPlayer = getObjectFromRedisString(rawString);
        // we have no use of age, we only added that for sorting purposes based on timestamp
        anonymousQueue.push({
            ...anonymousPlayer, _raw : rawString
        })
    }

    // now we have a queue of players whose adjacent members can be matched and game can be started
    console.log(anonymousQueue);
    for(let i = 0 ; i < anonymousQueue.length ; i+=2 ){
        logger.info(`Check here`);
        //take the first two players for matchmaking,
        const playerA = anonymousQueue[i];
        const playerB = anonymousQueue[i+1];
        if(!playerB) continue;
        const playerA_stringified = playerA._raw ; 
        const playerB_stringified = playerB._raw ;

        //start to matchmake them
        const tx = redis.multi();
            tx.zrem(ANONYMOUS_MATCHMAKING_QUEUE_KEY,playerA_stringified);
            tx.zrem(ANONYMOUS_MATCHMAKING_QUEUE_KEY,playerB_stringified);

        const results = await tx.exec();
        
        const playerAisRemoved = results[0][1] ; 
        const playerBisRemoved = results[1][1] ;
        if(playerAisRemoved && playerBisRemoved  ){
            playerA.socket = userService.getSocketForAnonymousPlayer(playerA.user_id);
            playerB.socket = userService.getSocketForAnonymousPlayer(playerB.user_id);  

            if( playerA.socket && playerB.socket && playerA.user_id && playerB.user_id ){
                logger.info(`Found a match between two Anonymous Players!`);
                logger.info(`Passing context to and starting activating Room Manager`);
                
                const room = roomManager.createRoom(playerA,playerB)
                const payload = roomManager.getRoomPayloadForClient(room);
                matchmakingEvents.emit("matchmaking:anon:match_found",payload);

            }
            else{
                logger.error(`Something went very wrong with matchmaking service`);
                logger.error(`Stopping server`);
                process.exit(1);
            }
         
        }else{
                logger.warn(`Collision: one player was already matched, skipping pair`);
        }
        
    }
    
    


}

export const clearAnonMatchmakingQueue = async() => {
        logger.info(`Removing Anonymous members on server start`);
        const removed = await redis.del(ANONYMOUS_MATCHMAKING_QUEUE_KEY);
        logger.info(`Anonymous Matchmaking queue cleared (${removed ? "queue existed" : "queue already empty"})`);
}


setInterval(async() => {
   await runAnonymousMatchmaking();
},2100);



