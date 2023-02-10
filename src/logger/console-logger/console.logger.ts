import type { ILogger } from '@logger/models/logger.models';

export class ConsoleLogger implements ILogger {
    public info(data: object): void {
        const stringifiedData = JSON.stringify(data);
        console.log(stringifiedData);
    }

    public error(data: object): void {
        const stringifiedData = JSON.stringify(data);
        console.error(stringifiedData);
    }
}
