import type { ILogger } from '@logger/models/logger.models';

export class AppLogger {
    private static instance: AppLogger;

    private constructor(
        private readonly logger: ILogger,
    ) { }

    public static init(logger: ILogger): void {
        if (!AppLogger.instance) {
            AppLogger.instance = new AppLogger(logger);
        }
    }

    public static info(data: object): void {
        AppLogger.instance.logger.info(data);
    }

    public static error(data: object): void {
        AppLogger.instance.logger.error(data);
    }

    public static fatal(data: object): void{
        AppLogger.instance.logger.fatal(data);
    }
}
