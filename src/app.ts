import dotenv from 'dotenv'
dotenv.config
import express, {NextFunction, Request, Response} from 'express';
import httpStatus from 'http-status';
import cors from 'cors';
import cookieParser from 'cookie-parser'

import { ErrorHandler } from './utils/errorHandler';
import defaultVars from './config/defaultVars';
import { errorMiddlware } from './middleware/errorMiddware';
import router from './routes';
import swaggerRouter from '../docs';

export const app = express();

// body parser
app.use(express.json({ limit: "50mb"}))

// cookie parser
app.use(cookieParser())

// cors origin sharing
app.use(cors({origin: defaultVars.allowedOrigin}))

// routes
app.use('/api/v1', router)
app.use(swaggerRouter)

// testing api
app.get('/api/test', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({status: 'OK', message: "API test successful"})
})

// unkown routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new ErrorHandler(`Route ${req.originalUrl} not found`, httpStatus.NOT_FOUND) 
    next(err)
})

app.use(errorMiddlware)