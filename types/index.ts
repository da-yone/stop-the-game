// Global type definitions for stop-the-game application

export interface AlarmConfig {
  time: string; // Format: "HH:MM"
  enabled: boolean;
  soundFile?: string;
}

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  timestamp: Date;
  level: keyof LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface SystemTrayMenuItem {
  label: string;
  click: () => void;
  enabled?: boolean;
  visible?: boolean;
}

export interface AlarmSchedulerEvents {
  alarmTriggered: (time: string) => void;
  alarmCancelled: (time: string) => void;
  sleepExecuted: (time: string) => void;
  schedulerStarted: () => void;
  schedulerStopped: () => void;
}

export interface SleepManagerOptions {
  method: 'powershell' | 'rundll32';
  timeout?: number;
}

export interface AlarmSoundOptions {
  duration: number; // seconds
  volume?: number; // 0-1
  loop?: boolean;
}