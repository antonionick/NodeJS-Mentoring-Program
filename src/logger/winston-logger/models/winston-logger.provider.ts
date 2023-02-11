import type { ILoggerProvider } from '@logger/models/logger-provider.models';
import type { ILogger } from '@logger/models/logger.models';
import { WinstonLogger } from '@logger/winston-logger/winston.logger';

export class WinstonLoggerProvider implements ILoggerProvider {
    public initLogger(): ILogger {
        const winstonLogger = new WinstonLogger();
        winstonLogger.init();
        return winstonLogger;
    }
}
