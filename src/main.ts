import 'module-alias/register';
import express from 'express';
import type { Express } from 'express';
import { getDotenvOptions } from '@config/dotenv/dotenv-options';
import { initRoutes } from '@routes/routes';
import { PostgresqlDatabaseProvider, PostgresqlDatabaseProviderInitOptions } from '@database/postgresql/postgresql-database.provider';
import { JoiValidatorProvider } from '@validators/joi/joi-validator.provider';
import { ConsoleLoggerProvider } from 'logger/console-logger/console-logger.provider';
import { AppLogger } from 'logger/app-logger';

class Main {
    public static async init(): Promise<void> {
        const dotenvOptions = getDotenvOptions();

        Main.initLogger();

        const validatorProvider = new JoiValidatorProvider();
        const databaseProvider = await Main.initPostgreSQLProvider(dotenvOptions.databaseConnectionString);

        const app = Main.initApp(dotenvOptions.port);

        initRoutes(app, databaseProvider, validatorProvider);
    }

    private static initLogger(): void {
        const loggerProvider = new ConsoleLoggerProvider();
        const logger = loggerProvider.initLogger();
        AppLogger.init(logger);
    }

    private static async initPostgreSQLProvider(
        connectionString: string,
    ): Promise<PostgresqlDatabaseProvider> {
        const initOptions = new PostgresqlDatabaseProviderInitOptions({
            connectionString,
        });

        const database = new PostgresqlDatabaseProvider();
        await database.initDatabase(initOptions);

        return database;
    }

    private static initApp(port: number): Express {
        const app = express();
        app.listen(port);
        app.use(express.json());
        return app;
    }
}

Main.init();
