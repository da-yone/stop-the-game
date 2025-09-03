import { SystemTrayManager, TrayInterface } from '../src/system-tray';
import { Logger } from '../src/logger';
import * as fs from 'fs';

class MockTray implements TrayInterface {
  private onClickCallback?: (action: any) => void;
  private onExitCallback?: () => void;

  onClick(callback: (action: any) => void): void {
    this.onClickCallback = callback;
  }

  onExit(callback: () => void): void {
    this.onExitCallback = callback;
  }

  sendAction(_action: { type: string; item?: any }): void {
    // Mock implementation
  }

  kill(): void {
    if (this.onExitCallback) {
      this.onExitCallback();
    }
  }

  // Test utility method
  simulateClick(action: any): void {
    if (this.onClickCallback) {
      this.onClickCallback(action);
    }
  }
}

describe('SystemTrayManager', () => {
  let trayManager: SystemTrayManager;
  let mockLogger: Logger;
  let mockTray: MockTray;
  const testLogFile = './logs/test-system-tray.log';

  const createMockTray = () => {
    mockTray = new MockTray();
    return mockTray;
  };

  beforeEach(() => {
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
    mockLogger = new Logger(testLogFile);
    trayManager = new SystemTrayManager(mockLogger, undefined, createMockTray);
  });

  afterEach(() => {
    trayManager.stop();
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('constructor', () => {
    it('should create system tray manager instance', () => {
      expect(trayManager).toBeDefined();
      expect(trayManager).toBeInstanceOf(SystemTrayManager);
    });

    it('should accept custom icon path', () => {
      const customTrayManager = new SystemTrayManager(mockLogger, {
        iconPath: './custom-icon.ico'
      });
      expect(customTrayManager).toBeDefined();
    });
  });

  describe('start', () => {
    it('should start system tray', async () => {
      trayManager.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('System tray started');
    });

    it('should not start if already running', async () => {
      trayManager.start();
      trayManager.start();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('System tray is already running');
    });
  });

  describe('stop', () => {
    it('should stop system tray', async () => {
      trayManager.start();
      trayManager.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('System tray stopped');
    });

    it('should not stop if not running', async () => {
      trayManager.stop();
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('System tray is not running');
    });
  });

  describe('isRunning', () => {
    it('should return false when not started', () => {
      expect(trayManager.isRunning()).toBe(false);
    });

    it('should return true when started', () => {
      trayManager.start();
      expect(trayManager.isRunning()).toBe(true);
    });

    it('should return false when stopped', () => {
      trayManager.start();
      trayManager.stop();
      expect(trayManager.isRunning()).toBe(false);
    });
  });

  describe('menu actions', () => {
    it('should register menu action callbacks', () => {
      const mockCallback = jest.fn();
      trayManager.onMenuAction('start', mockCallback);
      
      expect(mockCallback).toBeDefined();
    });

    it('should handle start action', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('start');
        done();
      });
      
      trayManager.onMenuAction('start', mockCallback);
      trayManager.start();
      
      // Simulate menu click
      trayManager.triggerMenuAction('start');
    });

    it('should handle stop action', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('stop');
        done();
      });
      
      trayManager.onMenuAction('stop', mockCallback);
      trayManager.start();
      
      // Simulate menu click
      trayManager.triggerMenuAction('stop');
    });

    it('should handle settings action', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('settings');
        done();
      });
      
      trayManager.onMenuAction('settings', mockCallback);
      trayManager.start();
      
      // Simulate menu click
      trayManager.triggerMenuAction('settings');
    });

    it('should handle exit action', (done) => {
      const mockCallback = jest.fn(() => {
        expect(mockCallback).toHaveBeenCalledWith('exit');
        done();
      });
      
      trayManager.onMenuAction('exit', mockCallback);
      trayManager.start();
      
      // Simulate menu click
      trayManager.triggerMenuAction('exit');
    });
  });

  describe('menu state updates', () => {
    it('should update menu item state', async () => {
      trayManager.start();
      trayManager.updateMenuState('start', { enabled: false });
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Menu state updated');
    });

    it('should handle invalid menu item', async () => {
      trayManager.start();
      trayManager.updateMenuState('invalid', { enabled: false });
      await mockLogger.waitForWrites();
      
      const logContent = fs.readFileSync(testLogFile, 'utf8');
      expect(logContent).toContain('Invalid menu item');
    });
  });
});