import { CancellationHandler, KeypressHandler } from '../src/cancellation-handler';
import { Logger } from '../src/logger';
import * as fs from 'fs';

class MockKeypressHandler implements KeypressHandler {
  private keyPressCallback: ((ch: string, key: any) => void) | null = null;
  private isRawMode: boolean = false;
  private isResumed: boolean = false;

  onKeyPress(callback: (ch: string, key: any) => void): void {
    this.keyPressCallback = callback;
  }

  setRawMode(mode: boolean): void {
    this.isRawMode = mode;
  }

  resume(): void {
    this.isResumed = true;
  }

  pause(): void {
    this.isResumed = false;
  }

  removeAllListeners(_event: string): void {
    this.keyPressCallback = null;
  }

  // Test utility methods
  simulateKeyPress(ch: string = '', key: any = {}): void {
    if (this.keyPressCallback) {
      this.keyPressCallback(ch, key);
    }
  }

  getRawMode(): boolean {
    return this.isRawMode;
  }

  getResumed(): boolean {
    return this.isResumed;
  }
}

describe('CancellationHandler', () => {
  let handler: CancellationHandler;
  let mockLogger: Logger;
  let mockKeypressHandler: MockKeypressHandler;
  const testLogFile = './logs/test-cancellation.log';

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    mockKeypressHandler = new MockKeypressHandler();
    handler = new CancellationHandler(mockLogger, mockKeypressHandler);
  });

  afterEach(() => {
    handler.stop();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create cancellation handler instance', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(CancellationHandler);
    });
  });

  describe('start', () => {
    it('should start listening for key input', async () => {
      handler.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler started');
    });

    it('should not start if already listening', async () => {
      handler.start();
      handler.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler is already running');
    });
  });

  describe('stop', () => {
    it('should stop listening for key input', async () => {
      handler.start();
      handler.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler stopped');
    });

    it('should not stop if not listening', async () => {
      handler.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Cancellation handler is not running');
    });
  });

  describe('isListening', () => {
    it('should return false when not started', () => {
      expect(handler.isListening()).toBe(false);
    });

    it('should return true when started', () => {
      handler.start();
      expect(handler.isListening()).toBe(true);
    });

    it('should return false when stopped', () => {
      handler.start();
      handler.stop();
      expect(handler.isListening()).toBe(false);
    });
  });

  describe('onCancellation', () => {
    it('should register cancellation callback', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('manual');
        done();
      });
      
      handler.onCancellation(mockCallback);
      handler.start();
      
      // Use mock keypress handler to simulate key press
      mockKeypressHandler.simulateKeyPress('', {});
    });
  });

  describe('key press simulation', () => {
    it('should trigger cancellation on any key press', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('manual');
        done();
      });
      
      handler.onCancellation(mockCallback);
      handler.start();
      
      mockKeypressHandler.simulateKeyPress('', {});
    });

    it('should log cancellation trigger', async () => {
      const mockCallback = jest.fn();
      handler.onCancellation(mockCallback);
      handler.start();
      
      mockKeypressHandler.simulateKeyPress('', {});
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Alarm cancelled by user input');
    });

    it('should handle Ctrl+C correctly', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      handler.start();
      
      expect(() => {
        mockKeypressHandler.simulateKeyPress('', { ctrl: true, name: 'c' });
      }).toThrow('process.exit called');
      
      exitSpy.mockRestore();
    });
  });
});