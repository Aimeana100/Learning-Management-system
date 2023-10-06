import dotenv from 'dotenv';
import Joi from 'joi';
import { ErrorHandler } from '../utils/errorHandler';
import httpStatus from 'http-status';

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(8000),
    DB_URL: Joi.string().required(),
    REDIS_URL: Joi.string().required(),
    ORIGIN: Joi.required(),
    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required()
  })
  .unknown();

const { value: envVariables, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new ErrorHandler(`Config validation error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
}

export default {
  env: envVariables.NODE_ENV,
  port: envVariables.PORT,
  appUrl: envVariables.APP_URL,
  frontendUrl: envVariables.FRONTEND_URL,
  allowedOrigin : envVariables.ORIGIN,
  jwt: {
    secret: envVariables.JWT_SECRET,
  },

  db: {
    dbUrl: envVariables.DB_URL,
    redis: envVariables.REDIS_URL
  },

  cloudinary: {
    name: envVariables.CLOUDINARY_CLOUD_NAME,
    key: envVariables.CLOUDINARY_API_KEY,
    secret: envVariables.CLOUDINARY_API_SECRET
  }
};