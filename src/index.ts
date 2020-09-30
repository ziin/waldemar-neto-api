import config from 'config';
import logger from './logger';
import { SetupServer } from './server';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}
process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to a unhandled promise ${promise} and reason ${reason}`
  );
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to a uncaughtException: ${error}`);
  process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('app.port'));
    await server.init();
    server.start();

    // gracefully shutdown
    const exitSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.map((signal) =>
      process.on(signal, async () => {
        try {
          await server.close();
          logger.info('Server gracefully shutdown.');
          process.exit(ExitStatus.Success);
        } catch (error) {
          logger.error(`App exited with error: ${error}`);
          process.exit(ExitStatus.Failure);
        }
      })
    );
  } catch (error) {
    logger.error(`App exited with error: ${error}`);
    process.exit(ExitStatus.Failure);
  }
})();
