import dotenv from "dotenv"
dotenv.config()
import mongoose from 'mongoose'
import defaultVars from "../config/defaultVars"
import logger from "../config/logger"

const dbUrl = defaultVars.db.dbUrl

export const connectDb = async () => {
    try {
        await mongoose.connect(dbUrl).then(() => {
            logger.info("Connected to database ")
        })
    } catch (error) {
        logger.error("Failed to connect to database "+ error.message )
    }
}