import pino from 'pino';
import config from 'config';

export default pino({
  level: config.get('app.logger.level'),
  enabled: config.get('app.logger.enabled'),
});
