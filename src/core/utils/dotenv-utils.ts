import dotenv from 'dotenv';
import { DEFAULT_PORT } from '@core/constants/app-options-constants';

export interface IDotenvOptions {
    port: number;
    databaseConnectionString: string;
}

export function getDotenvOptions(): IDotenvOptions {
    const { error, parsed } = dotenv.config();
    const defaultOptions = getDefaultOptions();

    if (error) {
        console.error(`Dotenv error is: ${error}\n Default values are used`);
        return defaultOptions;
    }

    const port = Number(parsed?.port);
    return {
        port: port || defaultOptions.port,
        databaseConnectionString:
            parsed?.databaseConnectionString || defaultOptions.databaseConnectionString,
    };
}

function getDefaultOptions(): IDotenvOptions {
    return {
        port: DEFAULT_PORT,
    } as IDotenvOptions;
}
