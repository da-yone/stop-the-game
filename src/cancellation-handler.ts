import keypress from 'keypress';
import { Logger } from './logger';

export class CancellationHandler {
  private listening: boolean = false;
  private callback: ((reason: string) => void) | null = null;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    keypress(process.stdin);
  }

  start(): void {
    if (this.listening) {
      this.logger.warn('Cancellation handler is already running');
      return;
    }

    this.listening = true;
    
    if (process.stdin.setRawMode && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(true);
    }
    
    process.stdin.resume();
    process.stdin.on('keypress', this.handleKeyPress.bind(this));
    
    this.logger.info('Cancellation handler started', {
      message: 'Press any key to cancel alarm'
    });
  }

  stop(): void {
    if (!this.listening) {
      this.logger.warn('Cancellation handler is not running');
      return;
    }

    this.listening = false;
    process.stdin.removeAllListeners('keypress');
    
    if (process.stdin.setRawMode && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
    
    process.stdin.pause();
    
    this.logger.info('Cancellation handler stopped');
  }

  isListening(): boolean {
    return this.listening;
  }

  onCancellation(callback: (reason: string) => void): void {
    this.callback = callback;
  }

  private handleKeyPress(_ch: string, key: any): void {
    if (key && (key.ctrl && key.name === 'c')) {
      process.exit();
    }
    
    this.triggerCancellation('manual');
  }

  private triggerCancellation(reason: string): void {
    this.logger.info('Alarm cancelled by user input', { reason });
    
    if (this.callback) {
      this.callback(reason);
    }
    
    this.stop();
  }

  // Protected method for testing purposes
  protected simulateKeyPress(reason: string = 'test'): void {
    this.triggerCancellation(reason);
  }
}