import { SettingsManager } from '../src/settings-manager';
import { Logger } from '../src/logger';
import * as fs from 'fs';
import * as path from 'path';

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;
  let mockLogger: Logger;
  const testLogFile = './logs/test-settings.log';
  const testSettingsFile = './config/test-settings.json';

  beforeEach(() => {
    // Clean up log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    
    // Clean up settings file
    if (fs.existsSync(testSettingsFile)) {
      fs.unlinkSync(testSettingsFile);
    }

    mockLogger = new Logger(testLogFile);
    settingsManager = new SettingsManager(mockLogger, { filePath: testSettingsFile });
  });

  afterEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    if (fs.existsSync(testSettingsFile)) {
      fs.unlinkSync(testSettingsFile);
    }
  });

  describe('constructor', () => {
    it('should create settings manager instance', () => {
      expect(settingsManager).toBeDefined();
      expect(settingsManager).toBeInstanceOf(SettingsManager);
    });

    it('should use default settings file path', () => {
      const defaultManager = new SettingsManager(mockLogger);
      expect(defaultManager).toBeDefined();
    });
  });

  describe('loadSettings', () => {
    it('should load default settings when file does not exist', async () => {
      const settings = await settingsManager.loadSettings();
      
      expect(settings).toBeDefined();
      expect(settings.alarmTime).toBe('21:00');
      expect(settings.soundFile).toBe('./sounds/alarm.wav');
      expect(settings.volume).toBe(1.0);
      expect(settings.duration).toBe(30);
      expect(settings.enabled).toBe(true);
    });

    it('should load settings from existing file', async () => {
      const testSettings = {
        alarmTime: '22:30',
        soundFile: './sounds/custom.wav',
        volume: 0.8,
        duration: 45,
        enabled: false
      };

      // Create settings file
      const configDir = path.dirname(testSettingsFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(testSettingsFile, JSON.stringify(testSettings, null, 2));

      const settings = await settingsManager.loadSettings();
      
      expect(settings.alarmTime).toBe('22:30');
      expect(settings.soundFile).toBe('./sounds/custom.wav');
      expect(settings.volume).toBe(0.8);
      expect(settings.duration).toBe(45);
      expect(settings.enabled).toBe(false);
    });

    it('should handle corrupted settings file', async () => {
      const configDir = path.dirname(testSettingsFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(testSettingsFile, 'invalid json');

      const settings = await settingsManager.loadSettings();
      await mockLogger.waitForWrites();
      
      // Should fallback to defaults
      expect(settings.alarmTime).toBe('21:00');
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Failed to parse settings file');
    });

    it('should log settings load', async () => {
      await settingsManager.loadSettings();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Settings file not found, using defaults');
    });
  });

  describe('saveSettings', () => {
    it('should save settings to file', async () => {
      const testSettings = {
        alarmTime: '23:00',
        soundFile: './sounds/test.wav',
        volume: 0.5,
        duration: 60,
        enabled: true
      };

      const success = await settingsManager.saveSettings(testSettings);
      await mockLogger.waitForWrites();
      
      expect(success).toBe(true);
      expect(fs.existsSync(testSettingsFile)).toBe(true);
      
      const savedContent = JSON.parse(fs.readFileSync(testSettingsFile, 'utf8'));
      expect(savedContent.alarmTime).toBe('23:00');
      expect(savedContent.soundFile).toBe('./sounds/test.wav');
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Settings saved');
    });

    it('should create config directory if not exists', async () => {
      const nestedSettingsFile = './config/nested/test-settings.json';
      const nestedManager = new SettingsManager(mockLogger, { filePath: nestedSettingsFile });
      
      const testSettings = {
        alarmTime: '20:00',
        soundFile: './sounds/alarm.wav',
        volume: 1.0,
        duration: 30,
        enabled: true
      };

      const success = await nestedManager.saveSettings(testSettings);
      
      expect(success).toBe(true);
      expect(fs.existsSync(nestedSettingsFile)).toBe(true);
      
      // Cleanup
      fs.unlinkSync(nestedSettingsFile);
      fs.rmdirSync(path.dirname(nestedSettingsFile));
    });

    it('should handle save errors gracefully', async () => {
      // Create a settings manager with invalid path
      const invalidManager = new SettingsManager(mockLogger, { 
        filePath: '/invalid/path/settings.json' 
      });
      
      const testSettings = {
        alarmTime: '21:00',
        soundFile: './sounds/alarm.wav',
        volume: 1.0,
        duration: 30,
        enabled: true
      };

      const success = await invalidManager.saveSettings(testSettings);
      await mockLogger.waitForWrites();
      
      expect(success).toBe(false);
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Failed to save settings');
    });
  });

  describe('validateSettings', () => {
    it('should validate valid settings', () => {
      const validSettings = {
        alarmTime: '21:00',
        soundFile: './sounds/alarm.wav',
        volume: 0.8,
        duration: 30,
        enabled: true
      };

      const result = settingsManager.validateSettings(validSettings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid alarm time format', () => {
      const invalidSettings = {
        alarmTime: '25:70',
        soundFile: './sounds/alarm.wav',
        volume: 1.0,
        duration: 30,
        enabled: true
      };

      const result = settingsManager.validateSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid alarm time format');
    });

    it('should reject invalid volume range', () => {
      const invalidSettings = {
        alarmTime: '21:00',
        soundFile: './sounds/alarm.wav',
        volume: 2.0,
        duration: 30,
        enabled: true
      };

      const result = settingsManager.validateSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Volume must be between 0.0 and 1.0');
    });

    it('should reject invalid duration', () => {
      const invalidSettings = {
        alarmTime: '21:00',
        soundFile: './sounds/alarm.wav',
        volume: 1.0,
        duration: -5,
        enabled: true
      };

      const result = settingsManager.validateSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duration must be a positive number');
    });

    it('should reject empty sound file', () => {
      const invalidSettings = {
        alarmTime: '21:00',
        soundFile: '',
        volume: 1.0,
        duration: 30,
        enabled: true
      };

      const result = settingsManager.validateSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Sound file path cannot be empty');
    });
  });

  describe('getSettings', () => {
    it('should return current settings', async () => {
      await settingsManager.loadSettings();
      
      const settings = settingsManager.getSettings();
      expect(settings).toBeDefined();
      expect(settings!.alarmTime).toBe('21:00');
    });

    it('should return null if settings not loaded', () => {
      const settings = settingsManager.getSettings();
      expect(settings).toBeNull();
    });
  });

  describe('updateSetting', () => {
    it('should update single setting', async () => {
      await settingsManager.loadSettings();
      
      const success = await settingsManager.updateSetting('alarmTime', '22:15');
      expect(success).toBe(true);
      
      const settings = settingsManager.getSettings();
      expect(settings!.alarmTime).toBe('22:15');
    });

    it('should validate updated setting', async () => {
      await settingsManager.loadSettings();
      
      const success = await settingsManager.updateSetting('volume', 2.5);
      await mockLogger.waitForWrites();
      
      expect(success).toBe(false);
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Invalid setting value');
    });

    it('should persist updated setting', async () => {
      await settingsManager.loadSettings();
      
      await settingsManager.updateSetting('duration', 45);
      
      // Verify file was updated
      expect(fs.existsSync(testSettingsFile)).toBe(true);
      const savedContent = JSON.parse(fs.readFileSync(testSettingsFile, 'utf8'));
      expect(savedContent.duration).toBe(45);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset settings to defaults', async () => {
      // Load and modify settings
      await settingsManager.loadSettings();
      await settingsManager.updateSetting('alarmTime', '23:30');
      
      // Reset to defaults
      const success = await settingsManager.resetToDefaults();
      expect(success).toBe(true);
      
      const settings = settingsManager.getSettings();
      expect(settings!.alarmTime).toBe('21:00');
      expect(settings!.volume).toBe(1.0);
      expect(settings!.duration).toBe(30);
    });

    it('should log reset operation', async () => {
      await settingsManager.loadSettings();
      await settingsManager.resetToDefaults();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Settings reset to defaults');
    });
  });
});