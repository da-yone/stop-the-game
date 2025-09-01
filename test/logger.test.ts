import { Logger } from '../src/logger';
import * as fs from 'fs';
import * as path from 'path';

describe('Logger', () => {
  let logger: Logger;
  const testLogFile = './logs/test.log';

  beforeEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    logger = new Logger(testLogFile);
  });

  afterEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create log directory if it does not exist', () => {
      const customLogFile = './logs/test/custom.log';
      new Logger(customLogFile);
      
      expect(fs.existsSync(path.dirname(customLogFile))).toBe(true);
      
      // Cleanup
      fs.rmSync('./logs/test', { recursive: true, force: true });
    });
  });

  describe('info', () => {
    it('should log info message', async () => {
      const message = 'Test info message';
      logger.info(message);
      await logger.waitForWrites();
      
      expect(fs.existsSync(testLogFile)).toBe(true);
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('info');
      expect(logContent).toContain(message);
    });

    it('should log info message with metadata', async () => {
      const message = 'Test with metadata';
      const metadata = { key: 'value', number: 42 };
      
      logger.info(message, metadata);
      await logger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain(message);
      expect(logContent).toContain('value');
      expect(logContent).toContain('42');
    });
  });

  describe('error', () => {
    it('should log error message', async () => {
      const message = 'Test error message';
      logger.error(message);
      await logger.waitForWrites();
      
      expect(fs.existsSync(testLogFile)).toBe(true);
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('error');
      expect(logContent).toContain(message);
    });

    it('should log error with Error object', async () => {
      const message = 'Test error';
      const error = new Error('Sample error');
      
      logger.error(message, { error: error.message, stack: error.stack });
      await logger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain(message);
      expect(logContent).toContain('Sample error');
    });
  });

  describe('warn', () => {
    it('should log warning message', async () => {
      const message = 'Test warning message';
      logger.warn(message);
      await logger.waitForWrites();
      
      expect(fs.existsSync(testLogFile)).toBe(true);
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('warn');
      expect(logContent).toContain(message);
    });
  });

  describe('debug', () => {
    it('should log debug message', async () => {
      const message = 'Test debug message';
      logger.debug(message);
      await logger.waitForWrites();
      
      expect(fs.existsSync(testLogFile)).toBe(true);
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('debug');
      expect(logContent).toContain(message);
    });
  });
});