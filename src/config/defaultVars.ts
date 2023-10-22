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
    ACCESS_TOKEN_SECRET: Joi.string().required(),
    ACTIVATION_TOKEN_SECRET: Joi.string().required(),
    REFRESH_TOKEN_SECRET: Joi.string().required(),
    ACCESS_TOKEN_EXPIRES: Joi.number().required(),
    REFRESH_TOKEN_EXPIRES: Joi.number().required(),
    CLOUDINARY_API_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required(),
    SMPT_HOST: Joi.string().required(),
    SMPT_PORT: Joi.string().required(),
    SMTP_SERVICE: Joi.string().required(),
    SMTP_MAIL: Joi.string().required(),
    SMTP_PASSWORD: Joi.string().required(),

  })
  .unknown();

const { value: envVariables, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new ErrorHandler(
    `Config validation error: ${error.message}`,
    httpStatus.INTERNAL_SERVER_ERROR
  );
}

export default {
  env: envVariables.NODE_ENV,
  port: envVariables.PORT,
  appUrl: envVariables.APP_URL,
  frontendUrl: envVariables.FRONTEND_URL,
  allowedOrigin: envVariables.ORIGIN,
  jwt: {
    access_secret: envVariables.ACCESS_TOKEN_SECRET,
    refresh_token: envVariables.REFRESH_TOKEN_SECRET,
    activation_secret: envVariables.ACTIVATION_TOKEN_SECRET,
    access_expires: envVariables.ACCESS_TOKEN_EXPIRES,
    refresh_expires: envVariables.REFRESH_TOKEN_EXPIRES
  },

  db: {
    dbUrl: envVariables.DB_URL,
    redis: envVariables.REDIS_URL
  },

  cloudinary: {
    name: envVariables.CLOUDINARY_API_NAME,
    key: envVariables.CLOUDINARY_API_KEY,
    secret: envVariables.CLOUDINARY_API_SECRET
  },
  mails: {
    host: envVariables.SMPT_HOST,
    port: envVariables.SMPT_PORT,
    service: envVariables.SMTP_SERVICE,
    mail: envVariables.SMTP_MAIL,
    password: envVariables.SMTP_PASSWORD
  }
};
