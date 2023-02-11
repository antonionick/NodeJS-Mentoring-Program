import type { ILogger } from '@logger/models/logger.models';
import { WinstonLoggerLevels, WINSTON_LOGGER_LEVELS_TO_PRIORITY_ORDER } from '@logger/winston-logger/models/winston-logger-levels';
import winston from 'winston';

export class WinstonLogger implements ILogger {
    private logger: winston.Logger;

    public init(): void {
        this.logger = winston.createLogger({
            levels: WINSTON_LOGGER_LEVELS_TO_PRIORITY_ORDER,
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.prettyPrint(),
            ),
            transports: [
                new winston.transports.Console(),
            ],
        });
    }

    public info(data: object): void {
        this.logger[WinstonLoggerLevels.Info](data);
    }

    public error(data: object): void {
        this.logger[WinstonLoggerLevels.Error](data);
    }

    public fatal(data: object): void {
        (this.logger as unknown as ILogger)[WinstonLoggerLevels.Fatal](data);
    }
}
