import winston from 'winston';
import config from './defaultVars';

const enumerateErrorFormat = winston.format((errorInfo) => {
  if (errorInfo instanceof Error) {
    Object.assign(errorInfo, { message: errorInfo.stack });
  }
  return errorInfo;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    })
  ]
});

export default logger;