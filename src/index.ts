import { Logger } from './logger';
import { AppConfig } from './config';

const logger = new Logger();

async function main(): Promise<void> {
  try {
    logger.info('Stop The Game アプリケーション開始');
    logger.info(`設定: アラーム時刻 ${AppConfig.DEFAULT_ALARM_TIME}`);
    
    // TODO: Phase2でスケジューラー、アラーム、スリープ機能を実装
    
  } catch (error) {
    logger.error('アプリケーション実行エラー', { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('アプリケーション終了中...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('アプリケーション終了中...');
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}