//since redis stores everything in strings, i need to stringifty everthing before storing it and 
//objectify everything when i take it out?
import { Logger } from "./logger.js";

const filename = import.meta.url;
const logger = new Logger(filename);

export const getStringForRedis = (object) => {
    
    const string = JSON.stringify(object);
    if(!string){
        logger.warn(`Error stringifying object before putting into redis key`);
        throw new Error("Error stringifying object before putting into redis key");
    }
    logger.info(`Created the string for the object before putting into redis ${string}`);
    return string;

}   


/**
 * Utility function for getting back the original stringified object
 *
 * @param {string} redisString 
 * @returns {*} 
 */
export const getObjectFromRedisString = (redisString) => {

    const object = JSON.parse(redisString);
    if(!object){
        logger.warn(`Error parsing string into object after retrieving it from redis`);
        throw new Error("Error parsing string into object after retrieving it from redis");
    }
    logger.info(`Parsed this object from the returned redis string `);
    logger.info(object);
    return object;

}

//export const 