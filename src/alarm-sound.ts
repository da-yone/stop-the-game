import player from 'play-sound';
import { Logger } from './logger';
import { AlarmSoundOptions } from '../types';

export class AlarmSound {
  private player: ReturnType<typeof player>;
  private playProcess: any = null;
  private timer: NodeJS.Timeout | null = null;
  private options: Required<AlarmSoundOptions>;
  private logger: Logger;
  private remainingTime: number = 0;

  constructor(logger: Logger, options?: Partial<AlarmSoundOptions>) {
    this.logger = logger;
    this.player = player();
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
    
    this.playProcess = this.player.play(soundFile, {
      player: 'afplay'
    }, (err: Error | null) => {
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
      soundFile
    });
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