import { Logger } from "../utils/logger.js";
import { Redis } from "ioredis";
import { getStringForRedis,getObjectFromRedisString } from "../utils/redisUtils.js";
import userService from "./userService.js";


const filename = import.meta.url;
const logger = new Logger(filename);
const redis = new Redis();
const ANONYMOUS_MATCHMAKING_QUEUE_KEY = "fANONYMOUS_MATCHMAKING_QUEUE";
const MATCHMAKING_WINDOW_SIZE = 100;

export const addToAnonMatchmakingQueue = async (anonymousUser) => {
    logger.info(`[ANONYMOUS Q] Attempting to add above User to the matchmaking Queue`);

    try{
        const timestamp = Date.now();
        const stringifiedAnonymousUser = getStringForRedis(anonymousUser);
        await redis.zadd(ANONYMOUS_MATCHMAKING_QUEUE_KEY,timestamp,stringifiedAnonymousUser);
        logger.info(`[ANONYMOUS Q]Succedded in putting the anonymous user in the matchmaking queue`);
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
        logger.warn("Too few people for matchmaking, as usually nobody came to play your game");
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
        if(playerAisRemoved && playerBisRemoved ){
            logger.info(`Found a match between two Anonymous Players!`);
            logger.info(`Passing context to and starting activating Room Manager`);
            



        }else{
                logger.warn(`Collision: one player was already matched, skipping pair`);
        }
        
    }
    
    


}

setInterval(async() => {
    try{
        await runAnonymousMatchmaking()
    }
    catch(err){
        logger.error(`Something went wrong with matchmaking service`);
        logger.error(err);
        process.exit(1);
    }
    
},2100);



