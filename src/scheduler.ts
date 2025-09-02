import * as cron from 'node-cron';
import { Logger } from './logger';
import { AlarmConfig } from '../types';

export class AlarmScheduler {
  private task: cron.ScheduledTask | null = null;
  private config: AlarmConfig;
  private logger: Logger;

  constructor(logger: Logger, alarmTime: string = '21:00') {
    this.logger = logger;
    this.config = {
      time: alarmTime,
      enabled: true
    };
  }

  start(): void {
    if (this.task) {
      this.logger.warn('Alarm scheduler is already running');
      return;
    }

    const [hours, minutes] = this.config.time.split(':');
    const cronExpression = `${minutes} ${hours} * * *`;

    this.task = cron.schedule(cronExpression, () => {
      this.logger.info('Alarm triggered!', { time: this.config.time });
    }, {
      scheduled: false
    });

    this.task.start();
    this.logger.info('Alarm scheduler started', { 
      alarmTime: this.config.time,
      cronExpression 
    });
  }

  stop(): void {
    if (!this.task) {
      this.logger.warn('Alarm scheduler is not running');
      return;
    }

    this.task.stop();
    this.task = null;
    this.logger.info('Alarm scheduler stopped');
  }

  isRunning(): boolean {
    return this.task !== null;
  }

  getAlarmTime(): string {
    return this.config.time;
  }
}