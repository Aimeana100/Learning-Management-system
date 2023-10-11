require('dotenv').config();
import { Redis } from "ioredis";
import defaultVars from "../config/defaultVars";
import logger from "../config/logger";
import { ErrorHandler } from "../utils/errorHandler";
import httpStatus from "http-status";

const redisClient = () => {
    if(defaultVars.db.redis){
        logger.info("Redis connected");
        return defaultVars.db.redis
    }
    throw new ErrorHandler("Redis not connected ", httpStatus.INTERNAL_SERVER_ERROR)
}

export const redis = new Redis(redisClient())