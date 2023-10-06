import {app} from './app';
import dotenv from 'dotenv'
import { connectDb } from './database/db';
import logger from './src/config/logger';
dotenv.config()

// create server configuration
const PORT = process.env.PORT
app.listen(PORT , () => {
    logger.info(`server listening on port ${PORT}`)
    connectDb()
})