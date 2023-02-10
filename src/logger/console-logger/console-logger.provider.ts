import { ConsoleLogger } from '@logger/console-logger/console.logger';
import type { ILoggerProvider } from '@logger/models/logger-provider.models';
import type { ILogger } from '@logger/models/logger.models';

export class ConsoleLoggerProvider implements ILoggerProvider {
    public initLogger(): ILogger {
        const consoleLogger = new ConsoleLogger();
        return consoleLogger;
    }
}
