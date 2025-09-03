import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export interface AppSettings {
  alarmTime: string;
  soundFile: string;
  volume: number;
  duration: number;
  enabled: boolean;
}

export interface SettingsManagerOptions {
  filePath?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SettingsManager {
  private logger: Logger;
  private filePath: string;
  private currentSettings: AppSettings | null = null;

  private readonly DEFAULT_SETTINGS: AppSettings = {
    alarmTime: '21:00',
    soundFile: './sounds/alarm.wav',
    volume: 1.0,
    duration: 30,
    enabled: true
  };

  constructor(logger: Logger, options?: SettingsManagerOptions) {
    this.logger = logger;
    this.filePath = options?.filePath ?? './config/settings.json';
  }

  async loadSettings(): Promise<AppSettings> {
    try {
      if (!fs.existsSync(this.filePath)) {
        this.logger.info('Settings file not found, using defaults', {
          filePath: this.filePath
        });
        this.currentSettings = { ...this.DEFAULT_SETTINGS };
        return this.currentSettings;
      }

      const fileContent = fs.readFileSync(this.filePath, 'utf8');
      const parsedSettings = JSON.parse(fileContent);
      
      // Merge with defaults to ensure all required properties exist
      this.currentSettings = {
        ...this.DEFAULT_SETTINGS,
        ...parsedSettings
      };

      this.logger.info('Settings loaded', {
        filePath: this.filePath,
        settings: this.currentSettings
      });

      return { ...this.currentSettings } as AppSettings;

    } catch (error) {
      this.logger.error('Failed to parse settings file', {
        filePath: this.filePath,
        error: error instanceof Error ? error.message : String(error)
      });

      // Fallback to defaults on error
      this.currentSettings = { ...this.DEFAULT_SETTINGS };
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  async saveSettings(settings: AppSettings): Promise<boolean> {
    try {
      const validation = this.validateSettings(settings);
      if (!validation.isValid) {
        this.logger.warn('Cannot save invalid settings', {
          errors: validation.errors
        });
        return false;
      }

      // Ensure directory exists
      const directory = path.dirname(this.filePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Save to file
      fs.writeFileSync(this.filePath, JSON.stringify(settings, null, 2));
      
      // Update current settings
      this.currentSettings = { ...settings };

      this.logger.info('Settings saved', {
        filePath: this.filePath,
        settings: this.currentSettings
      });

      return true;

    } catch (error) {
      this.logger.error('Failed to save settings', {
        filePath: this.filePath,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  validateSettings(settings: AppSettings): ValidationResult {
    const errors: string[] = [];

    // Validate alarm time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(settings.alarmTime)) {
      errors.push('Invalid alarm time format');
    }

    // Validate volume range
    if (settings.volume < 0.0 || settings.volume > 1.0) {
      errors.push('Volume must be between 0.0 and 1.0');
    }

    // Validate duration
    if (settings.duration <= 0) {
      errors.push('Duration must be a positive number');
    }

    // Validate sound file
    if (!settings.soundFile || settings.soundFile.trim() === '') {
      errors.push('Sound file path cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getSettings(): AppSettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null;
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ): Promise<boolean> {
    if (!this.currentSettings) {
      this.logger.warn('No settings loaded to update');
      return false;
    }

    // Create temporary settings object to validate
    const tempSettings = {
      ...this.currentSettings,
      [key]: value
    };

    const validation = this.validateSettings(tempSettings);
    if (!validation.isValid) {
      this.logger.warn('Invalid setting value', {
        key,
        value,
        errors: validation.errors
      });
      return false;
    }

    // Update current settings
    this.currentSettings[key] = value;

    // Persist to file
    const saved = await this.saveSettings(this.currentSettings);
    if (saved) {
      this.logger.info('Setting updated', {
        key,
        value
      });
    }

    return saved;
  }

  async resetToDefaults(): Promise<boolean> {
    this.currentSettings = { ...this.DEFAULT_SETTINGS };
    
    const saved = await this.saveSettings(this.currentSettings);
    if (saved) {
      this.logger.info('Settings reset to defaults');
    }

    return saved;
  }
}