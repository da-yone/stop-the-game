import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from './logger';
import { SleepManagerOptions } from '../types';

const execAsync = promisify(exec);

export class SleepManager {
  private options: Required<SleepManagerOptions>;
  private logger: Logger;

  constructor(logger: Logger, options?: Partial<SleepManagerOptions>) {
    this.logger = logger;
    this.options = {
      method: options?.method ?? 'powershell',
      timeout: options?.timeout ?? 10000
    };
  }

  async executeSleep(): Promise<boolean> {
    this.logger.info('Executing PC sleep', {
      method: this.options.method,
      timeout: this.options.timeout,
      platform: process.platform
    });

    if (!this.validateEnvironment()) {
      this.logger.error('Sleep operation failed: Unsupported environment');
      return false;
    }

    try {
      const command = this.buildSleepCommand();
      this.logger.info('Sleep command prepared', { command });

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.options.timeout
      });

      if (stderr) {
        this.logger.warn('Sleep command stderr output', { stderr });
      }

      this.logger.info('Sleep command executed successfully', { 
        stdout: stdout.trim() || 'No output' 
      });

      return true;
    } catch (error: any) {
      this.logger.error('Failed to execute sleep command', {
        error: error.message,
        code: error.code,
        killed: error.killed
      });
      return false;
    }
  }

  validateEnvironment(): boolean {
    const isSupported = this.isWindows();
    
    this.logger.info('Environment validation', {
      platform: process.platform,
      isWindows: this.isWindows(),
      supported: isSupported
    });

    return isSupported;
  }

  isWindows(): boolean {
    return process.platform === 'win32';
  }

  getSleepOptions(): Required<SleepManagerOptions> {
    return { ...this.options };
  }

  private buildSleepCommand(): string {
    switch (this.options.method) {
      case 'powershell':
        return 'powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $true)"';
      case 'rundll32':
        return 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0';
      default:
        throw new Error(`Unsupported sleep method: ${this.options.method}`);
    }
  }
}