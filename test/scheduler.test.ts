import { AlarmScheduler } from '../src/scheduler';
import { Logger } from '../src/logger';
import * as fs from 'fs';

describe('AlarmScheduler', () => {
  let scheduler: AlarmScheduler;
  let mockLogger: Logger;
  const testLogFile = './logs/test-scheduler.log';

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    scheduler = new AlarmScheduler(mockLogger);
  });

  afterEach(() => {
    scheduler.stop();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create scheduler instance', () => {
      expect(scheduler).toBeDefined();
      expect(scheduler).toBeInstanceOf(AlarmScheduler);
    });

    it('should accept custom alarm time', () => {
      const customScheduler = new AlarmScheduler(mockLogger, '22:30');
      expect(customScheduler).toBeDefined();
    });
  });

  describe('start', () => {
    it('should start the scheduler', async () => {
      scheduler.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm scheduler started');
    });

    it('should log the scheduled alarm time', async () => {
      const customScheduler = new AlarmScheduler(mockLogger, '22:30');
      customScheduler.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('22:30');
      
      customScheduler.stop();
    });
  });

  describe('stop', () => {
    it('should stop the scheduler', async () => {
      scheduler.start();
      scheduler.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm scheduler stopped');
    });
  });

  describe('isRunning', () => {
    it('should return false when not started', () => {
      expect(scheduler.isRunning()).toBe(false);
    });

    it('should return true when started', () => {
      scheduler.start();
      expect(scheduler.isRunning()).toBe(true);
    });

    it('should return false when stopped', () => {
      scheduler.start();
      scheduler.stop();
      expect(scheduler.isRunning()).toBe(false);
    });
  });

  describe('getAlarmTime', () => {
    it('should return default alarm time', () => {
      expect(scheduler.getAlarmTime()).toBe('21:00');
    });

    it('should return custom alarm time', () => {
      const customScheduler = new AlarmScheduler(mockLogger, '22:30');
      expect(customScheduler.getAlarmTime()).toBe('22:30');
    });
  });
});