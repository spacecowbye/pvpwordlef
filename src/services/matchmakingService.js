import { Logger } from "../utils/logger.js";
import { Redis } from "ioredis";
import { getStringForRedis,getObjectFromRedisString } from "../utils/redisUtils.js";

const filename = import.meta.url;
const logger = new Logger(filename);
const redis = new Redis();
const ANONYMOUS_MATCHMAKING_QUEUE_KEY = "fANONYMOUS_MATCHMAKING_QUEUE";
const MATCHMAKING_WINDOW_SIZE = 100;

export const addToAnonMatchmakingQueue = async (anonymousUser) => {
    logger.info(anonymousUser);
    logger.info(`[ANONYMOUS Q] Attempting to add above User to the matchmaking Queue`);

    try{
        const timestamp = Date.now();
        const stringifiedAnonymousUser = getStringForRedis(anonymousUser);
        await redis.zadd(ANONYMOUS_MATCHMAKING_QUEUE_KEY,timestamp,stringifiedAnonymousUser);
        logger.info(`[ANONYMOUS Q]Succedded in putting the anonymous user in the matchmaking queue`);
    }catch(err){
        console.log(err);
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
        logger.warn("Too few people for matchmaking, as usually nobody came to play your game");
        return;
    }
    console.log(anonymousQueueMembers);

    
    // now we have an array like [object1, score1, object2 , score2 ] so putting that its proper form
    let anonymousQueue = []
    for(let i = 0; i < anonymousQueueMembers.length ; i+=2){
        const anonymousPlayer = getObjectFromRedisString(anonymousQueueMembers[i]);
        const age = parseFloat(anonymousQueueMembers[i+1]);

        anonymousQueue.push({
            anonymousPlayer,
            age
        })
    }

    // now we have a queue of players whose adjacent members can be matched and game can be started

    for(let i = 0 ; i < anonymousQueue.length ; i+=2 ){
        const playerA = anonymousQueue[i];
        const playerB = anonymousQueue[i+1]
    }
    
    


}

setInterval(async() => {
    runAnonymousMatchmaking()
},2100);


