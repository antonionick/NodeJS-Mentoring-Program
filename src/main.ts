import 'module-alias/register';
import express from 'express';
import type { Express } from 'express';
import { getDotenvOptions } from '@config/dotenv/dotenv-options';
import { initRoutes } from '@routes/routes';
import { PostgresqlDatabaseProvider, PostgresqlDatabaseProviderInitOptions } from '@database/postgresql/postgresql-database.provider';
import { JoiValidatorProvider } from '@validators/joi/joi-validator.provider';
import { AppLogger } from '@logger/app-logger';
import { WinstonLoggerProvider } from '@logger/winston-logger/models/winston-logger.provider';

class Main {
    public static async init(): Promise<void> {
        try {
            const dotenvOptions = getDotenvOptions();

            Main.initLogger();
            Main.registerUncaughtExceptionListener();

            const validatorProvider = new JoiValidatorProvider();
            const databaseProvider = await Main.initPostgreSQLProvider(dotenvOptions.databaseConnectionString);

            const app = Main.initApp(dotenvOptions.port);

            initRoutes(app, databaseProvider, validatorProvider);
        } catch (error) {
            AppLogger.fatal(error as object);
        }
    }

    private static initLogger(): void {
        const loggerProvider = new WinstonLoggerProvider();
        const logger = loggerProvider.initLogger();
        AppLogger.init(logger);
    }

    private static registerUncaughtExceptionListener(): void {
        process.on('uncaughtException', (error: Error, origin: string) => {
            AppLogger.fatal({
                origin,
                message: error.message,
                stack: error.stack,
            });
            process.exit(1);
        });
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
