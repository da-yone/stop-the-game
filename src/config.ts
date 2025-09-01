import { AlarmConfig, SleepManagerOptions, AlarmSoundOptions } from '../types';

export class AppConfig {
  public static readonly DEFAULT_ALARM_TIME = '21:00';
  public static readonly DEFAULT_SOUND_DURATION = 30; // seconds
  public static readonly RESTART_DELAY = 10; // seconds after cancellation
  public static readonly LOG_FILE_PATH = './logs/app.log';
  public static readonly SOUND_FILE_PATH = './sounds/alarm.wav';

  public static readonly ALARM_SOUND_OPTIONS: AlarmSoundOptions = {
    duration: this.DEFAULT_SOUND_DURATION,
    volume: 1.0,
    loop: true
  };

  public static readonly SLEEP_MANAGER_OPTIONS: SleepManagerOptions = {
    method: 'powershell',
    timeout: 5000
  };

  public static readonly DEFAULT_ALARM_CONFIG: AlarmConfig = {
    time: this.DEFAULT_ALARM_TIME,
    enabled: true,
    soundFile: this.SOUND_FILE_PATH
  };
}