import keypress from 'keypress';
import { Logger } from './logger';

export interface KeypressHandler {
  onKeyPress: (callback: (ch: string, key: any) => void) => void;
  setRawMode: (mode: boolean) => void;
  resume: () => void;
  pause: () => void;
  removeAllListeners: (event: string) => void;
}

export class DefaultKeypressHandler implements KeypressHandler {
  constructor() {
    keypress(process.stdin);
  }

  onKeyPress(callback: (ch: string, key: any) => void): void {
    process.stdin.on('keypress', callback);
  }

  setRawMode(mode: boolean): void {
    if (process.stdin.setRawMode && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(mode);
    }
  }

  resume(): void {
    process.stdin.resume();
  }

  pause(): void {
    process.stdin.pause();
  }

  removeAllListeners(event: string): void {
    process.stdin.removeAllListeners(event);
  }
}

export class CancellationHandler {
  private listening: boolean = false;
  private callback: ((reason: string) => void) | null = null;
  private logger: Logger;
  private keypressHandler: KeypressHandler;

  constructor(logger: Logger, keypressHandler?: KeypressHandler) {
    this.logger = logger;
    this.keypressHandler = keypressHandler || new DefaultKeypressHandler();
  }

  start(): void {
    if (this.listening) {
      this.logger.warn('Cancellation handler is already running');
      return;
    }

    this.listening = true;
    this.keypressHandler.setRawMode(true);
    this.keypressHandler.resume();
    this.keypressHandler.onKeyPress(this.handleKeyPress.bind(this));
    
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
    this.keypressHandler.removeAllListeners('keypress');
    this.keypressHandler.setRawMode(false);
    this.keypressHandler.pause();
    
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
      this.triggerCancellation('ctrl-c');
      return;
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
}