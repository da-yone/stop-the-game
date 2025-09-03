import * as SysTray from 'systray2';
import { SystrayOptions, MenuItem } from 'systray2';
import { Logger } from './logger';
import * as path from 'path';

export interface SystemTrayOptions {
  iconPath?: string;
  title?: string;
  tooltip?: string;
}

export interface TrayInterface {
  onClick(callback: (action: any) => void): void;
  onExit(callback: () => void): void;
  sendAction(action: { type: string; item?: any }): void;
  kill(): void;
}

export interface MenuActionCallbacks {
  [key: string]: (action: string) => void;
}

export class SystemTrayManager {
  private systray: TrayInterface | null = null;
  private running: boolean = false;
  private options: Required<SystemTrayOptions>;
  private logger: Logger;
  private callbacks: MenuActionCallbacks = {};
  private trayFactory: ((config: SystrayOptions) => TrayInterface) | undefined;

  constructor(logger: Logger, options?: Partial<SystemTrayOptions>, trayFactory?: (config: SystrayOptions) => TrayInterface) {
    this.logger = logger;
    this.trayFactory = trayFactory;
    this.options = {
      iconPath: options?.iconPath ?? './assets/icon.ico',
      title: options?.title ?? 'Stop The Game',
      tooltip: options?.tooltip ?? 'Stop The Game - Windows Sleep Alarm'
    };
  }

  start(): void {
    if (this.running) {
      this.logger.warn('System tray is already running');
      return;
    }

    try {
      const menuItems: MenuItem[] = [
        {
          title: 'Start Alarm',
          tooltip: 'Start the alarm scheduler',
          enabled: true,
          click: () => this.triggerMenuAction('start')
        },
        {
          title: 'Stop Alarm',
          tooltip: 'Stop the alarm scheduler',
          enabled: true,
          click: () => this.triggerMenuAction('stop')
        },
        {
          title: 'Settings',
          tooltip: 'Open settings',
          enabled: true,
          click: () => this.triggerMenuAction('settings')
        },
        {
          title: '---'
        },
        {
          title: 'Exit',
          tooltip: 'Exit application',
          enabled: true,
          click: () => this.triggerMenuAction('exit')
        }
      ];

      const systrayConfig: SystrayOptions = {
        menu: {
          icon: this.getIconPath(),
          title: this.options.title,
          tooltip: this.options.tooltip,
          items: menuItems
        },
        debug: false,
        copyDir: true
      };

      if (this.trayFactory) {
        this.systray = this.trayFactory(systrayConfig);
      } else {
        this.systray = new (SysTray as any)(systrayConfig);
      }
      
      if (this.systray) {
        this.systray.onClick((action) => {
          this.logger.info('System tray menu clicked', { 
            action: action.item.title 
          });
        });

        this.systray.onExit(() => {
          this.logger.info('System tray exited');
          this.running = false;
        });
      }

      this.running = true;
      this.logger.info('System tray started', {
        title: this.options.title,
        tooltip: this.options.tooltip,
        iconPath: this.options.iconPath
      });

    } catch (error) {
      this.logger.error('Failed to start system tray', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  stop(): void {
    if (!this.running) {
      this.logger.warn('System tray is not running');
      return;
    }

    if (this.systray) {
      this.systray.kill();
      this.systray = null;
    }

    this.running = false;
    this.logger.info('System tray stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  onMenuAction(action: string, callback: (action: string) => void): void {
    this.callbacks[action] = callback;
  }

  triggerMenuAction(action: string): void {
    if (this.callbacks[action]) {
      this.callbacks[action](action);
    } else {
      this.logger.warn('No callback registered for menu action', { action });
    }
  }

  updateMenuState(itemName: string, state: { enabled?: boolean; checked?: boolean }): void {
    if (!this.running || !this.systray) {
      this.logger.warn('Cannot update menu state - system tray not running');
      return;
    }

    const validItems = ['start', 'stop', 'settings', 'exit'];
    if (!validItems.includes(itemName)) {
      this.logger.warn('Invalid menu item', { itemName });
      return;
    }

    // Update menu state
    this.systray.sendAction({
      type: 'update-item',
      item: {
        title: itemName,
        ...state
      }
    });

    this.logger.info('Menu state updated', { 
      itemName, 
      state 
    });
  }

  private getIconPath(): string {
    // For testing, return a simple base64 icon
    if (process.env['NODE_ENV'] === 'test') {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    const iconPath = path.resolve(this.options.iconPath);
    return iconPath;
  }
}