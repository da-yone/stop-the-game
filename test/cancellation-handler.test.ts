import { CancellationHandler } from '../src/cancellation-handler';
import { Logger } from '../src/logger';
import * as fs from 'fs';

describe('CancellationHandler', () => {
  let handler: CancellationHandler;
  let mockLogger: Logger;
  const testLogFile = './logs/test-cancellation.log';

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    handler = new CancellationHandler(mockLogger);
  });

  afterEach(() => {
    handler.stop();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create cancellation handler instance', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(CancellationHandler);
    });
  });

  describe('start', () => {
    it('should start listening for key input', async () => {
      handler.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler started');
    });

    it('should not start if already listening', async () => {
      handler.start();
      handler.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler is already running');
    });
  });

  describe('stop', () => {
    it('should stop listening for key input', async () => {
      handler.start();
      handler.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler stopped');
    });

    it('should not stop if not listening', async () => {
      handler.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler is not running');
    });
  });

  describe('isListening', () => {
    it('should return false when not started', () => {
      expect(handler.isListening()).toBe(false);
    });

    it('should return true when started', () => {
      handler.start();
      expect(handler.isListening()).toBe(true);
    });

    it('should return false when stopped', () => {
      handler.start();
      handler.stop();
      expect(handler.isListening()).toBe(false);
    });
  });

  describe('onCancellation', () => {
    it('should register cancellation callback', () => {
      const mockCallback = jest.fn();
      handler.onCancellation(mockCallback);
      
      expect(handler['callback']).toBe(mockCallback);
    });
  });

  describe('key press simulation', () => {
    it('should trigger cancellation on any key press', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('manual');
        done();
      });
      
      handler.onCancellation(mockCallback);
      handler.start();
      
      handler['triggerCancellation']('manual');
    });

    it('should log cancellation trigger', async () => {
      const mockCallback = jest.fn();
      handler.onCancellation(mockCallback);
      handler.start();
      
      handler['triggerCancellation']('manual');
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm cancelled by user input');
    });
  });
});