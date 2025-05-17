import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

export const config = {
    svix: {
      apiKey: process.env.SVIX_API_KEY || '',
      apiUrl: process.env.SVIX_API_URL || 'https://api.eu.svix.com',
    },
  };

// Configure logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'webhook-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});