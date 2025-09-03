import { RestartManager } from '../src/restart-manager';
import { Logger } from '../src/logger';
import * as fs from 'fs';

describe('RestartManager', () => {
  let restartManager: RestartManager;
  let mockLogger: Logger;
  const testLogFile = './logs/test-restart.log';

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    restartManager = new RestartManager(mockLogger);
  });

  afterEach(() => {
    restartManager.cancelRestart();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create restart manager instance', () => {
      expect(restartManager).toBeDefined();
      expect(restartManager).toBeInstanceOf(RestartManager);
    });

    it('should accept custom restart delay', () => {
      const customManager = new RestartManager(mockLogger, 5);
      expect(customManager).toBeDefined();
      expect(customManager.getRestartDelay()).toBe(5);
    });
  });

  describe('scheduleRestart', () => {
    it('should schedule restart with callback', async () => {
      const mockCallback = jest.fn();
      restartManager.scheduleRestart(mockCallback);
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Restart scheduled');
      expect(logContent).toContain('10 seconds');
    });

    it('should not schedule if already scheduled', async () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      
      restartManager.scheduleRestart(mockCallback1);
      restartManager.scheduleRestart(mockCallback2);
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Restart is already scheduled');
    });

    it('should execute callback after delay', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalled();
        done();
      });
      
      const shortDelayManager = new RestartManager(mockLogger, 0.1); // 100ms for testing
      shortDelayManager.scheduleRestart(mockCallback);
    }, 1000);
  });

  describe('cancelRestart', () => {
    it('should cancel scheduled restart', async () => {
      const mockCallback = jest.fn();
      restartManager.scheduleRestart(mockCallback);
      restartManager.cancelRestart();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Restart cancelled');
    });

    it('should not cancel if not scheduled', async () => {
      restartManager.cancelRestart();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('No restart scheduled to cancel');
    });
  });

  describe('isRestartScheduled', () => {
    it('should return false when not scheduled', () => {
      expect(restartManager.isRestartScheduled()).toBe(false);
    });

    it('should return true when scheduled', () => {
      const mockCallback = jest.fn();
      restartManager.scheduleRestart(mockCallback);
      expect(restartManager.isRestartScheduled()).toBe(true);
    });

    it('should return false after cancellation', () => {
      const mockCallback = jest.fn();
      restartManager.scheduleRestart(mockCallback);
      restartManager.cancelRestart();
      expect(restartManager.isRestartScheduled()).toBe(false);
    });
  });

  describe('getRestartDelay', () => {
    it('should return default restart delay', () => {
      expect(restartManager.getRestartDelay()).toBe(10);
    });

    it('should return custom restart delay', () => {
      const customManager = new RestartManager(mockLogger, 5);
      expect(customManager.getRestartDelay()).toBe(5);
    });
  });

  describe('getRemainingTime', () => {
    it('should return 0 when not scheduled', () => {
      expect(restartManager.getRemainingTime()).toBe(0);
    });

    it('should return remaining time when scheduled', () => {
      const mockCallback = jest.fn();
      restartManager.scheduleRestart(mockCallback);
      const remaining = restartManager.getRemainingTime();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(10);
    });
  });
});