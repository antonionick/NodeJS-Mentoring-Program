export interface ILogger {
    info(data: object): void;
    error(data: object): void;
    fatal(data: object): void;
}
