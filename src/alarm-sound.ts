import player from 'play-sound';
import { Logger } from './logger';
import { AlarmSoundOptions } from '../types';

export interface AudioPlayer {
  play(file: string, options?: any, callback?: (err: Error | null) => void): any;
}

export class DefaultAudioPlayer implements AudioPlayer {
  private player: ReturnType<typeof player>;

  constructor() {
    this.player = player();
  }

  play(file: string, options?: any, callback?: (err: Error | null) => void): any {
    return this.player.play(file, options, callback);
  }
}

export class MockAudioPlayer implements AudioPlayer {
  play(_file: string, _options?: any, callback?: (err: Error | null) => void): any {
    // Mock implementation for testing/Linux environments
    if (callback) {
      setTimeout(() => callback(null), 0);
    }
    return { kill: () => {} };
  }
}

export class AlarmSound {
  private audioPlayer: AudioPlayer;
  private playProcess: any = null;
  private timer: NodeJS.Timeout | null = null;
  private options: Required<AlarmSoundOptions>;
  private logger: Logger;
  private remainingTime: number = 0;

  constructor(logger: Logger, options?: Partial<AlarmSoundOptions>, audioPlayer?: AudioPlayer) {
    this.logger = logger;
    
    // Platform-specific audio player selection with DI support
    if (audioPlayer) {
      this.audioPlayer = audioPlayer;
    } else if (process.platform === 'linux') {
      this.audioPlayer = new MockAudioPlayer();
    } else {
      this.audioPlayer = new DefaultAudioPlayer();
    }
    
    this.options = {
      duration: options?.duration ?? 30,
      volume: options?.volume ?? 1.0,
      loop: options?.loop ?? true
    };
  }

  play(): void {
    if (this.playProcess) {
      this.logger.warn('Alarm sound is already playing');
      return;
    }

    this.remainingTime = this.options.duration;
    
    const soundFile = './sounds/alarm.wav';
    
    // Select appropriate player based on platform
    const playerOptions = this.getPlayerOptions();
    
    this.playProcess = this.audioPlayer.play(soundFile, playerOptions, (err: Error | null) => {
      if (err && err.message && !err.message.includes('killed')) {
        this.logger.error('Failed to play alarm sound', { 
          error: err.message,
          soundFile 
        });
      }
    });

    this.timer = setTimeout(() => {
      this.stop();
    }, this.options.duration * 1000);

    const countdown = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        clearInterval(countdown);
      }
    }, 1000);

    this.logger.info('Alarm sound started', { 
      duration: this.options.duration,
      volume: this.options.volume,
      loop: this.options.loop,
      soundFile,
      platform: process.platform
    });
  }

  private getPlayerOptions(): any {
    if (process.platform === 'win32') {
      return { player: 'cmdmp3' };
    } else if (process.platform === 'darwin') {
      return { player: 'afplay' };
    } else {
      // Linux or other platforms
      return { player: 'aplay' };
    }
  }

  stop(): void {
    if (!this.playProcess) {
      this.logger.warn('Alarm sound is not playing');
      return;
    }

    if (this.playProcess.kill) {
      this.playProcess.kill();
    }
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.playProcess = null;
    this.remainingTime = 0;
    this.logger.info('Alarm sound stopped');
  }

  isPlaying(): boolean {
    return this.playProcess !== null;
  }

  getRemainingTime(): number {
    return this.remainingTime;
  }
}