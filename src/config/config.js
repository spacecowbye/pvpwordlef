import dotenv from "dotenv";
import { Logger } from "../utils/logger.js";





const filepath = import.meta.url
const logger = new Logger(filepath)
dotenv.config();


logger.info("Loading in Environment variables from config");
export const config = {
    NODE_ENV : process.env.NODE_ENV,
    PORT : process.env.PORT
}
console.log(config);
logger.info("Finished loading in environment variables from config");


