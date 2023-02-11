export enum WinstonLoggerLevels {
    Info = 'info',
    Error = 'error',
    Fatal = 'fatal',
}

export const WINSTON_LOGGER_LEVELS_TO_PRIORITY_ORDER = {
    [WinstonLoggerLevels.Fatal]: 0,
    [WinstonLoggerLevels.Error]: 1,
    [WinstonLoggerLevels.Info]: 2,
}
