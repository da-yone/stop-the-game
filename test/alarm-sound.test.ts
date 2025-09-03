import { AlarmSound } from '../src/alarm-sound';
import { Logger } from '../src/logger';
import * as fs from 'fs';

describe('AlarmSound', () => {
  let alarmSound: AlarmSound;
  let mockLogger: Logger;
  const testLogFile = './logs/test-alarm-sound.log';

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    alarmSound = new AlarmSound(mockLogger);
  });

  afterEach(() => {
    alarmSound.stop();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create alarm sound instance', () => {
      expect(alarmSound).toBeDefined();
      expect(alarmSound).toBeInstanceOf(AlarmSound);
    });

    it('should accept custom sound options', () => {
      const customAlarmSound = new AlarmSound(mockLogger, {
        duration: 60,
        volume: 0.8,
        loop: true
      });
      expect(customAlarmSound).toBeDefined();
    });
  });

  describe('play', () => {
    it('should start playing alarm sound', async () => {
      alarmSound.play();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm sound started');
    });

    it('should not start if already playing', async () => {
      alarmSound.play();
      alarmSound.play();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm sound is already playing');
    });

    it('should log sound duration', async () => {
      const customAlarmSound = new AlarmSound(mockLogger, { duration: 45 });
      customAlarmSound.play();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('duration');
      expect(logContent).toContain('45');
      
      customAlarmSound.stop();
    });
  });

  describe('stop', () => {
    it('should stop the alarm sound', async () => {
      alarmSound.play();
      alarmSound.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm sound stopped');
    });

    it('should not stop if not playing', async () => {
      alarmSound.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm sound is not playing');
    });
  });

  describe('isPlaying', () => {
    it('should return false when not playing', () => {
      expect(alarmSound.isPlaying()).toBe(false);
    });

    it('should return true when playing', () => {
      alarmSound.play();
      expect(alarmSound.isPlaying()).toBe(true);
    });

    it('should return false when stopped', () => {
      alarmSound.play();
      alarmSound.stop();
      expect(alarmSound.isPlaying()).toBe(false);
    });
  });

  describe('getRemainingTime', () => {
    it('should return 0 when not playing', () => {
      expect(alarmSound.getRemainingTime()).toBe(0);
    });

    it('should return duration when just started', () => {
      const customAlarmSound = new AlarmSound(mockLogger, { duration: 30 });
      customAlarmSound.play();
      expect(customAlarmSound.getRemainingTime()).toBe(30);
      customAlarmSound.stop();
    });
  });
});