import type { ILogger } from 'logger/models/logger.models';

export interface ILoggerProvider {
    initLogger(): ILogger;
}
