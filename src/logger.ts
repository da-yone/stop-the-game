import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfig } from './config';

export class Logger {
  private logger: winston.Logger;

  constructor(logFilePath?: string) {
    const logPath = logFilePath || AppConfig.LOG_FILE_PATH;
    
    // Create log directory if it doesn't exist
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'stop-the-game' },
      transports: [
        new winston.transports.File({ filename: logPath }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.logger.error(message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, metadata);
  }

  // For testing: wait for all pending writes to complete
  async waitForWrites(): Promise<void> {
    return new Promise((resolve) => {
      // Use a simple timeout approach for testing
      setTimeout(resolve, 50); // Wait for winston to write
    });
  }
}