import { SleepManager } from '../src/sleep-manager';
import { Logger } from '../src/logger';
import * as fs from 'fs';

describe('SleepManager', () => {
  let sleepManager: SleepManager;
  let mockLogger: Logger;
  const testLogFile = './logs/test-sleep.log';

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    sleepManager = new SleepManager(mockLogger);
  });

  afterEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create sleep manager instance', () => {
      expect(sleepManager).toBeDefined();
      expect(sleepManager).toBeInstanceOf(SleepManager);
    });

    it('should accept custom sleep options', () => {
      const customManager = new SleepManager(mockLogger, {
        method: 'rundll32',
        timeout: 5000
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('executeSleep', () => {
    it('should log sleep execution attempt', async () => {
      await sleepManager.executeSleep();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Executing PC sleep');
      expect(logContent).toContain('powershell');
    });

    it('should use custom method when specified', async () => {
      const customManager = new SleepManager(mockLogger, {
        method: 'rundll32'
      });
      
      await customManager.executeSleep();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('rundll32');
    });

    it('should handle sleep execution errors gracefully', async () => {
      const result = await sleepManager.executeSleep();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Executing PC sleep');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('validateEnvironment', () => {
    it('should return false on non-Windows environment', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });

      const result = sleepManager.validateEnvironment();
      expect(result).toBe(false);

      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      });
    });

    it('should log environment validation', async () => {
      sleepManager.validateEnvironment();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Environment validation');
    });
  });

  describe('getSleepOptions', () => {
    it('should return default sleep options', () => {
      const options = sleepManager.getSleepOptions();
      expect(options.method).toBe('powershell');
      expect(options.timeout).toBe(10000);
    });

    it('should return custom sleep options', () => {
      const customManager = new SleepManager(mockLogger, {
        method: 'rundll32',
        timeout: 5000
      });
      
      const options = customManager.getSleepOptions();
      expect(options.method).toBe('rundll32');
      expect(options.timeout).toBe(5000);
    });
  });

  describe('isWindows', () => {
    it('should detect platform correctly', () => {
      const originalPlatform = process.platform;
      
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
      expect(sleepManager.isWindows()).toBe(true);

      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });
      expect(sleepManager.isWindows()).toBe(false);

      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      });
    });
  });
});