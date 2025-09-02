import { Logger } from './logger';

export class RestartManager {
  private timer: NodeJS.Timeout | null = null;
  private callback: (() => void) | null = null;
  private restartDelay: number;
  private logger: Logger;
  private startTime: number = 0;

  constructor(logger: Logger, restartDelaySeconds: number = 10) {
    this.logger = logger;
    this.restartDelay = restartDelaySeconds;
  }

  scheduleRestart(callback: () => void): void {
    if (this.timer) {
      this.logger.warn('Restart is already scheduled');
      return;
    }

    this.callback = callback;
    this.startTime = Date.now();
    
    this.timer = setTimeout(() => {
      this.logger.info('Executing scheduled restart');
      if (this.callback) {
        this.callback();
      }
      this.timer = null;
      this.callback = null;
      this.startTime = 0;
    }, this.restartDelay * 1000);

    this.logger.info('Restart scheduled', {
      delay: `${this.restartDelay} seconds`,
      timestamp: new Date().toISOString()
    });
  }

  cancelRestart(): void {
    if (!this.timer) {
      this.logger.warn('No restart scheduled to cancel');
      return;
    }

    clearTimeout(this.timer);
    this.timer = null;
    this.callback = null;
    this.startTime = 0;

    this.logger.info('Restart cancelled');
  }

  isRestartScheduled(): boolean {
    return this.timer !== null;
  }

  getRestartDelay(): number {
    return this.restartDelay;
  }

  getRemainingTime(): number {
    if (!this.timer || this.startTime === 0) {
      return 0;
    }

    const elapsed = (Date.now() - this.startTime) / 1000;
    const remaining = Math.max(0, this.restartDelay - elapsed);
    return Math.ceil(remaining);
  }
}